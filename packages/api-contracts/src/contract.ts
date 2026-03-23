import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export const chatCompletionBodySchema = z.object({
  messages: z.array(chatMessageSchema),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export const chatCompletionResponseSchema = z.object({
  message: z.object({
    role: z.literal('assistant'),
    content: z.string(),
  }),
});

export const contract = c.router({
  chat: {
    completion: {
      method: 'POST',
      path: '/chat',
      body: chatCompletionBodySchema,
      responses: {
        200: chatCompletionResponseSchema,
      },
      summary: 'Chat completion',
    },
  },
});
