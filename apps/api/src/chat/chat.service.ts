import { Injectable } from '@nestjs/common';
import type { ChatCompletionBody } from '@repo/api-contracts/chat-contract';

import { OpenRouterService } from '../openrouter/openrouter.service';

@Injectable()
export class ChatService {
  constructor(private readonly openRouter: OpenRouterService) {}

  async complete(
    body: ChatCompletionBody,
  ): Promise<{ message: { role: 'assistant'; content: string } }> {
    const content = await this.openRouter.complete({
      messages: body.messages,
      model: body.model,
      temperature: body.temperature,
    });

    return {
      message: {
        role: 'assistant',
        content,
      },
    };
  }
}
