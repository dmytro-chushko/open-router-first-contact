'use client';

import type { ChatCompletionBody } from '@repo/api-contracts/chat-contract';
import { useMutation } from '@tanstack/react-query';

import { publicApiClient } from '@/shared/api/api-client';
import { getApiErrorMessage } from '@/shared/api/get-api-error-message';

export function useChatCompletionMutation() {
  return useMutation({
    mutationFn: async (body: ChatCompletionBody) => {
      const result = await publicApiClient.chat.completion({
        body,
      });

      if (result.status !== 200) {
        throw new Error(getApiErrorMessage(result.status, result.body));
      }

      const data = result.body;

      if (data === null || data === undefined) {
        throw new Error('Invalid response from chat API');
      }

      return data.message.content;
    },
  });
}
