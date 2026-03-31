import { Logger } from '@nestjs/common';

import { getErrorMessage } from './get-error-message';

export interface ErrorHandlerOptions {
  logger: Logger;
  context: string;
  logLevel?: 'error' | 'warn' | 'debug';
  swallow?: boolean;
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions,
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    const { logger, context, logLevel = 'error', swallow } = options;
    const stack = error instanceof Error ? error.stack : undefined;

    if (logLevel === 'error') {
      logger.error(`${context}: ${errorMessage}`, stack);
    } else if (logLevel === 'warn') {
      logger.warn(`${context}: ${errorMessage}`, stack);
    } else {
      logger.debug(`${context}: ${errorMessage}`, stack);
    }

    if (swallow) {
      return undefined as T;
    }
    throw error;
  }
}
