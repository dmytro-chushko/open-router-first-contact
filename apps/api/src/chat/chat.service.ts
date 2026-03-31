import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { ChatCompletionBody } from '@repo/api-contracts/chat-contract';
import { withErrorHandling } from 'src/common/utils/error/error-handler';
import { getErrorMessage } from 'src/common/utils/error/get-error-message';

import { OpenRouterService } from '../openrouter/openrouter.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly openRouter: OpenRouterService) {}

  async complete(
    body: ChatCompletionBody,
  ): Promise<{ message: { role: 'assistant'; content: string } }> {
    return withErrorHandling<{
      message: { role: 'assistant'; content: string };
    }>(
      async () => {
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
      },
      {
        logger: this.logger,
        context: 'ChatService.complete',
        logLevel: 'error',
      },
    ).catch((error: unknown) => {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage = getErrorMessage(error);
      throw new InternalServerErrorException(
        errorMessage || 'Failed to complete chat',
      );
    });
  }
}
