/** Returns API-provided error string when present; otherwise `null` (caller uses localized fallback). */
export function tryGetApiErrorString(body: unknown): string | null {
  if (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'string'
  ) {
    return (body as { error: string }).error;
  }

  return null;
}
