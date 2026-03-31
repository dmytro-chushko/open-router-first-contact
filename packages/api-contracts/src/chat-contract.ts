import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  badRequestResponse,
  internalServerErrorResponse,
} from './common-responses.js';

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

export type ChatCompletionBody = z.infer<typeof chatCompletionBodySchema>;

export const chatCompletionResponseSchema = z
  .object({
    message: z.object({
      role: z.literal('assistant'),
      content: z.string(),
    }),
  })
  .nullable();

export const chatContract = c.router({
  completion: {
    method: 'POST',
    path: '/chat',
    body: chatCompletionBodySchema,
    responses: {
      200: chatCompletionResponseSchema,
      400: badRequestResponse,
      500: internalServerErrorResponse,
    },
    summary: 'Chat completion',
  },
});
