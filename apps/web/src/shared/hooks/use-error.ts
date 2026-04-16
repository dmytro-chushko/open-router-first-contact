'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { FrontChatError } from '../lib/front-chat-error';

export function useError() {
  const tErrors = useTranslations('errors');

  const getErrorMessage = useCallback(
    (error: unknown) => {
      if (error instanceof FrontChatError) {
        if (error.payload.kind === 'http') {
          return tErrors('requestFailed', {
            status: String(error.payload.status),
          });
        } else {
          return tErrors('invalidResponse');
        }
      }

      if (error instanceof Error) {
        return error.message;
      }

      return tErrors('unknown');
    },
    [tErrors]
  );

  return {
    tErrors,
    getErrorMessage,
  };
}
