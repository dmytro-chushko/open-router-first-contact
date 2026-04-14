'use client';

import type { ChatCompletionBody } from '@repo/api-contracts/chat-contract';
import { useMutation } from '@tanstack/react-query';

import { publicApiClient } from '@/shared/api/api-client';
import { tryGetApiErrorString } from '@/shared/api/get-api-error-message';
import { FrontChatError } from '@/shared/lib/front-chat-error';

export function useChatCompletionMutation() {
  const mutation = useMutation({
    mutationFn: async (body: ChatCompletionBody) => {
      const result = await publicApiClient.chat.completion({
        body,
      });

      if (result.status !== 200) {
        const fromApi = tryGetApiErrorString(result.body);

        if (fromApi) {
          throw new Error(fromApi);
        }

        throw new FrontChatError({ kind: 'http', status: result.status });
      }

      const data = result.body;

      if (data === null || data === undefined) {
        throw new FrontChatError({ kind: 'invalidResponse' });
      }

      return data.message.content;
    },
  });

  return mutation;
}
