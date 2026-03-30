import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT') || 8001;
  }

  get apiUrl(): string {
    return this.config.get<string>('API_URL') || 'http://localhost:8001/api';
  }

  get openRouterApiKey(): string | undefined {
    return this.config.get<string>('OPENROUTER_API_KEY');
  }

  get openRouterDefaultModel(): string {
    return (
      this.config.get<string>('OPENROUTER_DEFAULT_MODEL') ??
      'openai/gpt-4o-mini'
    );
  }

  get openRouterHttpReferer(): string | undefined {
    return this.config.get<string>('OPENROUTER_HTTP_REFERER');
  }

  get openRouterAppTitle(): string | undefined {
    return this.config.get<string>('OPENROUTER_APP_TITLE');
  }

  get webOrigin(): string {
    return this.config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';
  }
}
