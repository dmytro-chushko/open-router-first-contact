'use client';

import type { ChatCompletionBody } from '@repo/api-contracts/chat-contract';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { publicApiClient } from '@/shared/api/api-client';
import { tryGetApiErrorString } from '@/shared/api/get-api-error-message';
import { FrontChatError } from '@/shared/lib/front-chat-error';

export function useChatCompletionMutation() {
  const tErrors = useTranslations('errors');
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

  useEffect(() => {
    if (mutation.isError && mutation.error) {
      let errorMessage;

      if (mutation.error instanceof FrontChatError) {
        if (mutation.error.payload.kind === 'http') {
          errorMessage = tErrors('requestFailed', {
            status: String(mutation.error.payload.status),
          });
        } else {
          errorMessage = tErrors('invalidResponse');
        }
      }

      if (mutation.error instanceof Error) {
        errorMessage = mutation.error.message;
      } else {
        errorMessage = 'Failed to get chat completion';
      }
      toast.error('Error getting chat completion', {
        description: errorMessage,
      });
    }
  }, [mutation.isError, mutation.error, tErrors]);

  return mutation;
}
