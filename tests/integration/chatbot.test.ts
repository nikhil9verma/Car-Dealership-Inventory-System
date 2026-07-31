import request from 'supertest';
import { generateToken } from '../../src/server/middleware/auth';
import { prisma } from '../../src/server/db';

// Mock groq-sdk BEFORE importing app so the module cache is intercepted
const mockCreate = jest.fn().mockResolvedValue({
  choices: [{ message: { content: 'We have a Toyota RAV4 (SUV) at $32,499 with 4 in stock.' } }],
});

jest.mock('groq-sdk', () => {
  return function MockGroq() {
    return {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
  };
});

// Import app AFTER mock is set up
import app from '../../src/server/app';

const userToken = generateToken({
  id: 'chat-test-user',
  email: 'chatuser@incubytemotors.com',
  role: 'USER',
});

describe('Chatbot Endpoint Integration Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── RED test 1: unauthenticated requests must be rejected ────────────────
  it('should return 401 when no auth token is provided', async () => {
    const res = await request(app)
      .post('/api/chatbot/query')
      .send({ message: 'What SUVs do you have?' });

    expect(res.status).toBe(401);
  });

  // ── RED test 2: authenticated request returns a grounded reply ────────────
  it('should return a reply grounded in inventory for authenticated users', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'We have a Toyota RAV4 (SUV) at $32,499 with 4 in stock.' } }],
    });

    const res = await request(app)
      .post('/api/chatbot/query')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: 'What SUVs do you have under $35,000?' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBeDefined();
    expect(typeof res.body.reply).toBe('string');
    expect(res.body.reply.length).toBeGreaterThan(0);
  });

  // ── RED test 3: empty message is rejected ────────────────────────────────
  it('should return 400 when message is empty', async () => {
    const res = await request(app)
      .post('/api/chatbot/query')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // ── RED test 4: Groq failure → clean 502, no raw stack trace ─────────────
  it('should return 502 with a clean error message when Groq API fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Groq API is unavailable'));

    const res = await request(app)
      .post('/api/chatbot/query')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: 'Do you have any trucks?' });

    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/unavailable|try again/i);
    // Must NOT expose raw stack traces or SDK error details
    expect(res.body.stack).toBeUndefined();
  });
});
