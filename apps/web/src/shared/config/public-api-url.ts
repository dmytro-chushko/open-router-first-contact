/**
 * Base URL for the Nest API (includes `/api` prefix), e.g. `http://localhost:8001/api`.
 */
export function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const fallback = 'http://localhost:8001/api';

  if (!raw) {
    return fallback;
  }

  return raw.replace(/\/$/, '');
}
