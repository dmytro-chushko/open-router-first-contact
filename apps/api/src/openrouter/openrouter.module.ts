import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';

import { OpenRouterService } from './openrouter.service';

@Module({
  imports: [CommonModule],
  providers: [OpenRouterService],
  exports: [OpenRouterService],
})
export class OpenRouterModule {}
