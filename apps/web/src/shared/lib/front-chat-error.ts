export type FrontChatErrorPayload =
  | { kind: 'http'; status: number }
  | { kind: 'invalidResponse' };

export class FrontChatError extends Error {
  readonly payload: FrontChatErrorPayload;

  constructor(payload: FrontChatErrorPayload) {
    super('FrontChatError');
    this.name = 'FrontChatError';
    this.payload = payload;
  }
}
