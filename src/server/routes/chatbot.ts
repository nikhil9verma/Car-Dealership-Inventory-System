import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Validation: message must be a non-empty string
const chatQuerySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

/**
 * Build a grounded system prompt from the live DB inventory.
 * The model is strictly forbidden from inventing vehicles not in this list.
 */
async function buildSystemPrompt(): Promise<string> {
  const vehicles = await prisma.vehicle.findMany({
    select: { make: true, model: true, category: true, price: true, quantity: true },
    orderBy: { make: 'asc' },
  });

  const inventoryJson = JSON.stringify(vehicles, null, 2);

  return (
    `You are a helpful and friendly car dealership sales assistant for Incubyte Motors. ` +
    `You must ONLY discuss vehicles from the exact inventory list below — never invent a ` +
    `vehicle, price, or quantity that is not listed. If asked about something not in the ` +
    `list, politely say it is not currently in stock.\n\n` +
    `Current Inventory:\n${inventoryJson}`
  );
}

// POST /api/chatbot/query — authenticated users only
router.post('/query', requireAuth, async (req: Request, res: Response) => {
  const result = chatQuerySchema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message || 'Invalid input';
    return res.status(400).json({ error: errorMsg });
  }

  const { message } = result.data;

  try {
    const apiKey = process.env.GROQ_API_KEY || 'placeholder';
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const groq = new Groq({ apiKey });
    const systemPrompt = await buildSystemPrompt();

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content ?? 'No response from assistant.';
    return res.status(200).json({ reply });
  } catch (err: any) {
    // Never leak raw SDK errors — return a clean 502
    console.error('Groq API error:', err?.message ?? err);
    return res.status(502).json({
      error: 'Chatbot service unavailable, please try again.',
    });
  }
});

export default router;
