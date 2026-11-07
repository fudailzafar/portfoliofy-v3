/** The server answered with an error. `message` is safe to show the user. */
export class ApiError extends Error {
  readonly status: number;
  /** Seconds to wait before retrying, when the server rate-limited us. */
  readonly retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** The profile was saved from somewhere else since this copy was loaded. */
export class SaveConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'SaveConflictError';
  }
}

/** The profile data failed validation, so nothing was sent. */
export class ResumeValidationError extends Error {
  constructor(message: string) {
    super(`Validation failed: ${message}`);
    this.name = 'ResumeValidationError';
  }
}
