import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { chatCompletionBodySchema } from '@repo/api-contracts/chat-contract';

import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async completion(@Body() body: unknown) {
    const parsed = chatCompletionBodySchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.chatService.complete(parsed.data);
  }
}
