import { Controller } from '@nestjs/common';
import { contract } from '@repo/api-contracts';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @TsRestHandler(contract.chat.completion)
  completion(): ReturnType<
    typeof tsRestHandler<typeof contract.chat.completion>
  > {
    return tsRestHandler(contract.chat.completion, async ({ body }) => {
      const result = await this.chatService.complete(body);

      return {
        status: 200,
        body: result,
      };
    });
  }
}
