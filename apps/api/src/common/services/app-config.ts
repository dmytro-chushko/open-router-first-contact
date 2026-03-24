import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT') || 3000;
  }

  get apiUrl(): string {
    return this.config.get<string>('API_URL') || 'http://localhost:8001/api';
  }
}
