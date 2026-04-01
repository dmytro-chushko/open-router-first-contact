import { HttpException, ServiceUnavailableException } from '@nestjs/common';
import { OpenRouterError } from '@openrouter/sdk/models/errors';

/**
 * Maps OpenRouter SDK HTTP errors to Nest HTTP exceptions (correct status + readable detail).
 */
export function toNestHttpFromOpenRouterError(
  err: OpenRouterError,
): HttpException {
  const detail = resolveOpenRouterErrorDetail(err);

  if (err.statusCode === 429) {
    return new HttpException(`OpenRouter: ${detail}`, 429);
  }

  return new ServiceUnavailableException(
    `OpenRouter request failed (HTTP ${err.statusCode}): ${detail}`,
  );
}

function resolveOpenRouterErrorDetail(err: OpenRouterError): string {
  let detail = err.message;

  try {
    const parsed = JSON.parse(err.body) as {
      error?: {
        message?: string;
        code?: number | string;
        metadata?: { raw?: string };
      };
      message?: string;
    };

    const metaRaw =
      typeof parsed.error?.metadata?.raw === 'string'
        ? parsed.error.metadata.raw.trim()
        : '';
    const apiMessage =
      typeof parsed.error?.message === 'string'
        ? parsed.error.message.trim()
        : '';
    const topMessage =
      typeof parsed.message === 'string' ? parsed.message.trim() : '';

    if (metaRaw) {
      detail = metaRaw;
    } else if (apiMessage && apiMessage !== err.message) {
      detail = `${err.message}: ${apiMessage}`;
    } else if (topMessage) {
      detail = topMessage;
    } else if (
      typeof parsed.error?.code !== 'undefined' &&
      String(parsed.error.code) !== String(err.statusCode)
    ) {
      detail = `${err.message} (code ${parsed.error.code})`;
    }
  } catch {
    const snippet = err.body.trim().slice(0, 280);

    if (snippet) {
      detail = `${err.message} (${snippet})`;
    }
  }

  return detail;
}
