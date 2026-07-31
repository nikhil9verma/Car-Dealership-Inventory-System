# PROMPTS.md — AI Prompts Used During Development

> This file documents the actual prompts used with AI tools during this project.
> They reflect real thought process, iteration, and domain knowledge written
> by a developer building this system from scratch with AI assistance.

---

## Phase 1 — Project Bootstrap & Architecture

---

**Prompt 1.1 — Initial Architecture Decision**

> I'm starting a new full-stack project: a Car Dealership Inventory System.
> The backend needs to handle user auth (register/login with JWT), a vehicles table
> (make, model, category, price, quantity), and two inventory actions — purchase
> (decrement qty) and restock (increment qty, admin only).
>
> I want to use Node.js + Express + TypeScript + Prisma with SQLite for local dev.
> Frontend will be React + Vite + Tailwind CSS v4.
>
> Before I write any code, help me decide: should I use a monorepo (single package.json,
> Vite handles both frontend and backend serving) or two separate projects?
> Give me the tradeoffs specifically for a small team kata, not a Fortune 500 app.

---

**Prompt 1.2 — Database Schema Review**

> Here's my initial Prisma schema:
>
> ```prisma
> model User {
>   id           String   @id @default(uuid())
>   email        String   @unique
>   passwordHash String
>   role         String   @default("USER")
>   createdAt    DateTime @default(now())
> }
>
> model Vehicle {
>   id        String   @id @default(uuid())
>   make      String
>   model     String
>   category  String
>   price     Float
>   quantity  Int
>   createdAt DateTime @default(now())
>   updatedAt DateTime @updatedAt
> }
> ```
>
> Two questions:
> 1. I'm using `String` for `role` instead of an enum. Prisma enums have a known
>    limitation with SQLite — they're just strings under the hood anyway. Is there
>    a reason to use `@map` enum here or is a plain string with app-level validation fine?
> 2. Should `price` be `Float` or `Decimal`? I know floating point is lossy for
>    currency — but this is SQLite and I don't need accounting-grade precision.
>    What's the pragmatic call?

---

**Prompt 1.3 — JWT Expiry & Security**

> I'm generating JWTs with this:
>
> ```typescript
> jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
> ```
>
> The kata spec says 60 minutes. But I want users to stay logged in during a demo
> without re-authenticating. What's the right way to handle this without implementing
> a full refresh token flow? Is bumping to 24h acceptable for a kata, and what should
> I note in the README about this trade-off?

---

## Phase 2 — TDD: Writing Tests First

---

**Prompt 2.1 — Auth Test Design (Red Phase)**

> I'm doing TDD for the auth routes. Before I write any implementation, help me write
> the test file for `POST /api/auth/register` and `POST /api/auth/login` using
> Jest + Supertest.
>
> My setup:
> - App is an Express instance exported from `src/server/app.ts`
> - Prisma client is in `src/server/db.ts`
> - Tests talk to a real SQLite test DB (same DATABASE_URL)
>
> I need tests for:
> - Successful registration returns 201 with `{ token, user: { id, email, role } }`
> - Duplicate email returns 400 with error message matching /already exists/i
> - Public ADMIN registration attempt returns 400
> - Invalid email format returns 400
> - Successful login returns 200 with token
> - Wrong password returns 401
> - Non-existent user returns 401
>
> Write only the test file. No implementation. Each `it()` block should have a comment
> explaining what business rule it's testing, not just what it does technically.

---

**Prompt 2.2 — Test Isolation Problem**

> My auth tests are failing with "User already exists" on the second run because
> the test user isn't being cleaned up properly. Here's my current cleanup:
>
> ```typescript
> afterAll(async () => {
>   await prisma.user.deleteMany({ where: { email: testEmail } });
>   await prisma.$disconnect();
> });
> ```
>
> But when tests run in parallel (other test files), the DB is shared.
> What's the minimal fix here — I don't want to spin up a separate test DB,
> and I can't use transactions in Supertest because each request is a separate
> HTTP call. What pattern do experienced teams use for this kind of integration
> test isolation with Prisma + SQLite?

---

**Prompt 2.3 — Vehicle Endpoint Tests (Red Phase)**

> Write tests for these vehicle routes. All routes require a valid JWT.
> Some require `role: 'ADMIN'`.
>
> Routes to test:
> - `GET /api/vehicles` — returns paginated list
> - `GET /api/vehicles/search?make=Toyota&category=SUV&minPrice=20000&maxPrice=50000`
>   — filters combine correctly (this is the main one I want thorough coverage on)
> - `POST /api/vehicles` — admin can create, non-admin gets 403
> - `PUT /api/vehicles/:id` — admin can update, 404 if not found
> - `DELETE /api/vehicles/:id` — admin only, 403 for regular user
> - `POST /api/vehicles/:id/purchase` — decrements quantity, 400 if insufficient stock
> - `POST /api/vehicles/:id/restock` — admin only, increments quantity
>
> I don't want to hit the real DB for auth — use `generateToken()` directly to
> fabricate valid tokens for test users without creating DB records.
> Show me how to structure the `beforeAll` setup to create a test vehicle,
> then use its ID across all tests.

---

## Phase 3 — Implementation (Green Phase)

---

**Prompt 3.1 — Purchase Route Edge Case**

> Here's my purchase route:
>
> ```typescript
> const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
> if (vehicle.quantity < purchaseQty) {
>   return res.status(400).json({ error: 'Insufficient stock' });
> }
> await prisma.vehicle.update({
>   where: { id: req.params.id },
>   data: { quantity: vehicle.quantity - purchaseQty },
> });
> ```
>
> I just realized there's a race condition: two simultaneous purchase requests
> could both pass the quantity check before either updates the DB.
> For a kata this probably doesn't matter — but I want to at least acknowledge it.
> What's the simplest Prisma-native way to handle this without a full transaction
> or row locking? Or should I just add a DB-level `CHECK (quantity >= 0)` constraint
> and let Prisma throw on violation?

---

**Prompt 3.2 — Search Route Refinement**

> My search route builds a `where` clause dynamically:
>
> ```typescript
> const where: any = {};
> if (make) where.make = { contains: make.trim() };
> if (category && category !== 'ALL') where.category = { equals: category };
> if (minPrice) where.price = { gte: parseFloat(minPrice) };
> if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
> ```
>
> Two issues I see:
> 1. Using `any` for `where` — is there a Prisma-generated type I can use instead?
> 2. The `contains` operator is case-sensitive on SQLite but case-insensitive on
>    PostgreSQL. My tests pass locally but might break if we switch to Postgres.
>    What's the correct Prisma approach to make `contains` case-insensitive
>    across both providers?

---

**Prompt 3.3 — Zod Schema for Partial Updates**

> For the `PUT /api/vehicles/:id` route I need to accept partial updates —
> any subset of `{ make, model, category, price, quantity }`.
> I currently have:
>
> ```typescript
> const vehicleCreateSchema = z.object({ make, model, category, price, quantity });
> const vehicleUpdateSchema = vehicleCreateSchema.partial();
> ```
>
> But `.partial()` makes ALL fields optional, including making it valid to send
> an empty body `{}`. I want to require at least one field to be present.
> How do I express "partial but non-empty" in Zod v4?

---

## Phase 4 — Chatbot Feature

---

**Prompt 4.1 — Chatbot Architecture Decision**

> I need to add a sales assistant chatbot to the app. It should answer questions
> like "what SUVs do you have under $100k?" using the actual DB inventory.
>
> I have two design options:
>
> **Option A:** Client sends message → backend fetches inventory → builds system prompt
> with full inventory JSON → sends to Groq → returns reply.
> Every request rebuilds the prompt from scratch. Simple, stateless.
>
> **Option B:** Cache the inventory in memory/Redis, only rebuild the prompt
> when inventory changes (e.g., after purchase/restock). More efficient for
> large catalogs.
>
> For a 16-vehicle demo, Option A is clearly fine. But at what inventory size
> does Option B become necessary? And if I go with Option A for now, what should
> the system prompt look like to prevent the model from hallucinating vehicles
> that aren't in the list?

---

**Prompt 4.2 — Groq System Prompt Engineering**

> I'm passing inventory to Groq as JSON in the system prompt. Here's what I have:
>
> ```
> You are a helpful car dealership assistant. Only discuss vehicles from this
> exact inventory: [JSON array here]
> ```
>
> My concern: with llama-3.3-70b-versatile at temperature 0.3, will the model
> reliably refuse to invent vehicles? Or do I need a more explicit constraint
> in the prompt? Write me a tighter system prompt that:
> 1. Grounds the model strictly in the inventory list
> 2. Tells it what to say when asked about something NOT in the list
> 3. Keeps answers concise (1-3 sentences max) — this is a small chat widget,
>    not a full conversation UI
> 4. Sets the right persona for a car dealership context

---

**Prompt 4.3 — Test Mocking Strategy for Groq**

> I need to write integration tests for `POST /api/chatbot/query`.
> The route imports Groq like this:
>
> ```typescript
> import Groq from 'groq-sdk';
> // ...
> const groq = new Groq({ apiKey });
> const completion = await groq.chat.completions.create({ ... });
> ```
>
> I want to mock the Groq SDK in Jest so no real API calls are made.
> The tricky part: `jest.mock('groq-sdk')` needs to be hoisted before the
> module import, but in TypeScript with `ts-jest` the import order matters.
>
> Show me the correct pattern using `jest.mock` with a factory function where:
> - Default success: mock returns a valid Groq completion object
> - I can override per-test to simulate a thrown error (for the 502 test)
> - The mock doesn't bleed between test files

---

**Prompt 4.4 — 502 Error Handling Concern**

> My chatbot route catches Groq errors like this:
>
> ```typescript
> } catch (err: any) {
>   console.error('Groq API error:', err?.message ?? err);
>   return res.status(502).json({ error: 'Chatbot service unavailable, please try again.' });
> }
> ```
>
> Two follow-up questions:
> 1. Should I log `err.message` only, or the full `err` object? I don't want to
>    accidentally log API keys if the error object contains request headers.
> 2. The Groq SDK throws different error subtypes (RateLimitError, AuthenticationError,
>    etc.). Should I differentiate them in the response — e.g., return 429 for rate
>    limits — or is a flat 502 better for a client that just shows "try again"?

---

## Phase 5 — Frontend

---

**Prompt 5.1 — Optimistic UI for Purchase**

> In my `DashboardPage`, when a user clicks "Purchase", I want to immediately
> decrement the quantity on the card (optimistic update) so the UI feels instant,
> then confirm with the server response. If the server returns an error,
> roll back to the previous state.
>
> Here's my current state shape:
> ```typescript
> const [vehicles, setVehicles] = useState<Vehicle[]>([]);
> ```
>
> Write the purchase handler that:
> 1. Saves previous state for rollback
> 2. Applies optimistic decrement
> 3. Makes the API call
> 4. On success: updates with the server's authoritative vehicle object
> 5. On failure: rolls back + shows toast error
>
> Don't use any external state management library. Just React `useState`.

---

**Prompt 5.2 — ChatWidget Design Review**

> I've built a floating chat widget. Before I finalize it, review this design decision:
> I'm storing conversation history in local component state only — no localStorage,
> no server-side sessions. This means the history disappears on page refresh.
>
> Is this acceptable UX for a sales assistant on a dashboard, or should I persist
> to localStorage? My concern with localStorage: the conversation might contain
> inventory data that's now stale (vehicles were purchased/restocked since the
> chat). What's the right call here for a v1?

---

**Prompt 5.3 — Auth Context Design & Stale Token Handling**

> My `AuthContext` stores `{ token, user }` and persists the token to localStorage.
> On app load, I restore from localStorage. But I'm not validating the token —
> if the JWT expires after 24h, or the server DB is reset/reseeded, the user sees
> the dashboard but every API call returns 401.
>
> What's the cleanest way to handle this without a full token refresh flow?
> Options I'm considering:
> - Catch 401 in a fetch wrapper and call `logout()`
> - Validate token expiry on app load by decoding the JWT client-side (`jwt-decode`)
> - Add a lightweight `GET /api/vehicles?limit=1` call on mount that fails gracefully
>
> I'm using native `fetch`, not Axios. Which approach is cleanest with fetch?
> Also: after a successful login, the overlay isn't closing — `onReturnToShowroom`
> was never passed from `App.tsx` to `LoginPage`. How do I wire that up properly?

---

**Prompt 5.4 — Login Preset Credentials Mismatch**

> The quick-login preset buttons in `LoginPage.tsx` are hardcoded to:
> - Admin: `admin@dealership.com` / `admin123`
> - Customer: `customer@example.com` / `customer123`
>
> But the seed in `prisma/seed.ts` creates:
> - Admin: `admin@incubytemotors.com` / `AdminPassword123!`
> - Driver: `driver@incubytemotors.com` / `UserPassword123!`
>
> This means every demo login attempt using the presets returns 401 "Invalid credentials".
> Fix the preset buttons and also fix the `App.tsx` wiring so the auth overlay
> dismisses after a successful login.

---

## Phase 6 — Refactor & Polish

---

**Prompt 6.1 — Clean Code Review Request**

> Review this Express route handler for clean code issues. I want specific
> feedback on SOLID violations, not just style nitpicks:
>
> ```typescript
> router.post('/:id/purchase', requireAuth, async (req, res) => {
>   const result = purchaseSchema.safeParse(req.body);
>   if (!result.success) return res.status(400).json({ error: result.error.issues[0]?.message });
>
>   const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
>   if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
>   if (vehicle.quantity < result.data.quantity) return res.status(400).json({ error: 'Insufficient stock' });
>
>   const updated = await prisma.vehicle.update({
>     where: { id: req.params.id },
>     data: { quantity: vehicle.quantity - result.data.quantity },
>   });
>
>   return res.status(200).json({ message: 'Purchase successful', vehicle: updated });
> });
> ```
>
> Specifically:
> 1. The route is doing DB lookups directly — should this be in a service layer?
> 2. The "fetch or 404" pattern is repeated in every route. How would you extract it?
> 3. Is a route handler that's ~20 lines too long, or is that acceptable for Express?

---

**Prompt 6.2 — Git History & TDD Evidence**

> I've been coding with AI assistance and my commit history looks messy —
> some commits are "add feature + tests" together, which doesn't show
> the Red→Green→Refactor pattern the kata requires.
>
> For future commits, give me a concrete commit message template for each phase:
> - The RED commit (failing test added, implementation doesn't exist yet)
> - The GREEN commit (minimal implementation to make the test pass)
> - The REFACTOR commit (cleanup, no new tests, tests still pass)
>
> Also: I used AI for most of this. The kata says every AI-assisted commit needs
> a `Co-authored-by` trailer. Is it acceptable to add this retroactively to
> previous commits via `git rebase -i`, or does that look worse than just being
> transparent about it in the README?

---

**Prompt 6.3 — Color System Consistency**

> I have a neo-brutalist design system with these colors used as inline Tailwind
> classes throughout 11 component files:
>
> ```
> #FFE500 (acid yellow) → should be #E8A020 (amber)
> #00E676 (neon green) → should be #10B981 (teal)
> #FF3B30 (hot red)    → should be #DC2626 (crimson)
> #0047FF (electric blue) → should be #3B82F6 (steel blue)
> #F5F0E8 (cream)      → should be #F8F9FA (off-white)
> ```
>
> These are scattered as hardcoded hex values in className strings — not Tailwind
> config tokens. I need to replace them consistently across all files.
>
> Before doing the replacement: is it worth extracting these to CSS custom properties
> or Tailwind config first, so future changes are a single-file edit? Or just
> do the find-replace now and add the config later? What's the pragmatic call
> for a kata that won't have many future color changes?

---

## Phase 7 — Local Setup & Debugging

---

**Prompt 7.1 — PowerShell Execution Policy Error**

> When I run `npm install` in PowerShell I get:
> ```
> File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts
> is disabled on this system.
> ```
>
> I don't want to change the global PowerShell execution policy on this machine.
> What's the cleanest workaround to run npm commands without touching the system policy?

---

**Prompt 7.2 — npm Install Scripts Not Running**

> After `npm install` I get this warning:
> ```
> npm warn allow-scripts 8 packages have install scripts not yet covered by allowScripts:
>   @prisma/client, @prisma/engines, prisma, esbuild, protobufjs, unrs-resolver, @google/genai
> ```
>
> The Prisma client never generates because `postinstall` didn't run.
> What's the correct command to approve all pending install scripts so Prisma
> and esbuild get their post-install steps executed?

---

**Prompt 7.3 — Port Already in Use**

> `npm run dev` fails with:
> ```
> Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
> ```
>
> I need to find and kill the process occupying port 3000 on Windows without
> using a package manager or installing tools. What's the `netstat` / `taskkill`
> one-liner to do this?

---

## Phase 8 — Documentation & Submission

---

**Prompt 8.1 — README Structure Advice**

> I need to write a README for a coding kata submission. The evaluators are
> senior engineers who will spend about 3 minutes reading it before deciding
> whether to dig into the code.
>
> What's the ideal README structure for this context? My instinct:
> - One-liner project description
> - Tech stack table (not a paragraph)
> - Setup in 4 commands max
> - API endpoint table
> - Test results (copy-pasted output)
> - "My AI Usage" section (kata requirement)
>
> What am I missing, and what should I cut? Evaluators hate long READMEs
> that repeat what the code already shows.

---

**Prompt 8.2 — AI Usage Section Draft Review**

> Here's my draft for the "My AI Usage" section:
>
> "I used AI to help build this project. It was very helpful for generating
> boilerplate and writing tests. I reviewed all the code before committing it."
>
> The kata says evaluators will discuss AI usage in the interview.
> This draft is too vague. Rewrite it to be specific and credible —
> covering: which specific tasks AI did, what I had to correct or redirect,
> and one honest reflection on where AI made me slower (not just faster).
> Keep it under 300 words.

---

**Prompt 8.3 — Pre-submission Checklist**

> I'm about to push this kata to GitHub. Walk me through a pre-submission review
> checklist specific to this project. I want you to check for:
>
> 1. Any hardcoded secrets (API keys, passwords) that might have slipped
>    into source files or git history
> 2. `.env` files accidentally committed (check `.gitignore` coverage)
> 3. SQLite `.db` files accidentally committed
> 4. Test suite — are there any skipped tests or `console.log` debug statements
>    I forgot to remove?
> 5. PROMPTS.md — does it actually reflect what I did, or is it generic?
> 6. README — does the "My AI Usage" section have enough specificity to hold
>    up in an interview?
>
> For each item, tell me the exact command or file to check,
> not just the abstract concern.

---

## Phase 9 — Final Debugging, Git Init & Push Prep

---

**Prompt 9.1 — App Not Starting: Full Environment Bootstrap**

> I have a project with `package.json`, `prisma/schema.prisma`, and source files
> but no `node_modules`, no `.env`, and no SQLite database.
> The README says to run `npm run dev` but that fails because nothing is set up.
>
> Walk me through the complete sequence of commands to go from zero to a running
> dev server on Windows — including any gotchas with Prisma client generation,
> database creation, and seeding. What order do the commands need to run in and why?

---

**Prompt 9.2 — 401 on Public Catalog: Stale Token in localStorage**

> After reseeding the database, the app loads but the vehicle catalog returns 401.
> The browser console shows:
> ```
> GET /api/vehicles/search?sortBy=newest&page=1&limit=9  401 (Unauthorized)
> ```
>
> The route logic switches to `/api/vehicles/search` (auth required) when a token
> exists in localStorage, and to `/api/vehicles/public/catalog` (no auth) when it
> doesn't. The user has a token stored from a previous session before the DB was wiped.
>
> What's the correct fix? I need:
> 1. On app mount, validate the stored token and clear it if the server rejects it
> 2. Inside `fetchVehicles`, gracefully handle a 401 mid-session — fall back to the
>    public catalog rather than showing an error
> 3. No breaking changes to the existing auth flow

---

**Prompt 9.3 — Login Always 401: Wrong Credentials in Preset Buttons**

> My login page has two "quick preset" buttons that fill in demo credentials.
> They're showing `admin@dealership.com / admin123` and `customer@example.com / customer123`.
> Every login attempt returns 401 even with the correct password.
>
> The seed file creates:
> - `admin@incubytemotors.com` hashed with `AdminPassword123!`
> - `driver@incubytemotors.com` hashed with `UserPassword123!`
>
> Fix the preset buttons and also find out why the login overlay doesn't close
> after a successful login even when credentials are correct.

---

**Prompt 9.4 — Post-Login Redirect Not Working**

> After a successful login the `login()` context function is called and the JWT
> is stored, but the page doesn't change — the login form stays on screen.
>
> Here's how `App.tsx` renders the login page:
> ```tsx
> if (authOverlay === 'login') {
>   return <LoginPage onNavigateRegister={() => setAuthOverlay('register')} />;
> }
> ```
>
> And `LoginPage.tsx` on success:
> ```tsx
> login(data.token, data.user);
> if (onReturnToShowroom) onReturnToShowroom();
> ```
>
> `onReturnToShowroom` is never passed from `App.tsx`, so the overlay state
> never resets to `'none'`. What's the minimal fix — add a new prop or restructure?

---

**Prompt 9.5 — Git Init, .gitattributes, and Initial Commit on Windows**

> I have a finished project that's never been in git. I need to:
> 1. Initialize the repo
> 2. Stage all files (respecting `.gitignore`)
> 3. Verify that `.env`, `node_modules`, and `prisma/*.db` are correctly excluded
> 4. Fix the CRLF line-ending warnings that appear during `git add` on Windows
> 5. Make a well-structured initial commit with a `Co-authored-by` trailer for AI
>
> The multi-line commit message in PowerShell keeps failing with parse errors.
> What's the right way to write a multi-line commit message on Windows without
> using a temp file or changing the default editor?

---

**Prompt 9.6 — Updating README with Real Test Output**

> The README has a test report section that was written manually and shows 16 tests.
> I just ran `npm test` and the actual output shows 29 tests passing across 4 suites,
> with a coverage report. The timing also differs from what was in the README.
>
> Update the test report section with the real output. Also update the test count
> in any badges or summary lines. The coverage table should be included so reviewers
> can see which routes have lower coverage and why (e.g., the public catalog routes
> aren't covered by the current test suite because tests use the auth'd endpoints).
