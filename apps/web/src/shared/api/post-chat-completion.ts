import type { ChatCompletionBody } from '@repo/api-contracts/chat-contract';
import { chatCompletionResponseSchema } from '@repo/api-contracts/chat-contract';

import { getPublicApiBaseUrl } from '../config/public-api-url';

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();

  if (!text) {
    return res.statusText || `HTTP ${res.status}`;
  }
  try {
    const body: unknown = JSON.parse(text) as unknown;

    if (
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
    ) {
      return (body as { message: string }).message;
    }

    if (
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      Array.isArray((body as { message: unknown }).message)
    ) {
      return (body as { message: string[] }).message.join(', ');
    }
  } catch {
    /* use raw text */
  }

  return text;
}

export async function postChatCompletion(
  body: ChatCompletionBody
): Promise<string> {
  const base = getPublicApiBaseUrl();
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await readErrorMessage(res);
    throw new Error(message);
  }

  const json: unknown = await res.json();
  const parsed = chatCompletionResponseSchema.safeParse(json);

  if (!parsed.success || parsed.data === null) {
    throw new Error('Invalid response from chat API');
  }

  return parsed.data.message.content;
}
