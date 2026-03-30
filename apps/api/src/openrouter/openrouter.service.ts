import {
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OpenRouter } from '@openrouter/sdk';
import type { Message } from '@openrouter/sdk/models';

import { AppConfigService } from '../common/services/app-config';

export type ChatMessageInput = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

@Injectable()
export class OpenRouterService implements OnModuleInit {
  private client!: OpenRouter;

  constructor(private readonly appConfig: AppConfigService) {}

  onModuleInit(): void {
    const apiKey = this.appConfig.openRouterApiKey;

    if (!apiKey?.trim()) {
      throw new Error(
        'OPENROUTER_API_KEY is missing. Set it in apps/api/.env to start the API.',
      );
    }
    this.client = new OpenRouter({
      apiKey,
      httpReferer: this.appConfig.openRouterHttpReferer,
      appTitle: this.appConfig.openRouterAppTitle,
    });
  }

  private toSdkMessages(messages: ChatMessageInput[]): Message[] {
    return messages.map((m) => {
      if (m.role === 'system') {
        return { role: 'system', content: m.content };
      }

      if (m.role === 'user') {
        return { role: 'user', content: m.content };
      }

      return { role: 'assistant', content: m.content };
    });
  }

  async complete(params: {
    messages: ChatMessageInput[];
    model?: string;
    temperature?: number;
  }): Promise<string> {
    const model = params.model ?? this.appConfig.openRouterDefaultModel;
    const messages = this.toSdkMessages(params.messages);

    try {
      const completion = await this.client.chat.send({
        chatGenerationParams: {
          model,
          messages,
          stream: false,
          ...(params.temperature !== undefined && {
            temperature: params.temperature,
          }),
        },
      });

      const choice = completion.choices[0];
      const raw: unknown = choice?.message?.content;

      if (typeof raw === 'string' && raw.length > 0) {
        return raw;
      }

      if (raw == null) {
        return '';
      }

      return JSON.stringify(raw);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableException(
        `OpenRouter request failed: ${message}`,
      );
    }
  }
}
