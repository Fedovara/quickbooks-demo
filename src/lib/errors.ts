export type ErrorCode =
  | 'QB_NOT_CONNECTED'
  | 'QB_TOKEN_EXPIRED'
  | 'QB_API_ERROR'
  | 'QB_AUTH_FAILED'
  | 'REPORT_FAILED'
  | 'AI_FAILED'
  | 'EXPORT_FAILED'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
    }
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
