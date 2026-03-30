import { Module } from '@nestjs/common';

import { OpenRouterModule } from '../openrouter/openrouter.module';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [OpenRouterModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
