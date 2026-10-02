export type AiErrorCode =
  | 'UNKNOWN_CHANNEL' | 'CHANNEL_DISABLED' | 'CHANNEL_UNCONFIGURED' | 'INVALID_CONFIG'
  | 'UPSTREAM_ERROR' | 'INVALID_RESPONSE' | 'EMPTY_RESPONSE' | 'TIMEOUT' | 'NETWORK_ERROR'

export class AiError extends Error {
  constructor(
    public readonly code: AiErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly upstreamStatus?: number
  ) {
    super(message)
    this.name = 'AiError'
  }
}
