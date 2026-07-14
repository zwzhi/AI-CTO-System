import type { RuntimeErrorCode } from './runtime-types.ts';

export class RuntimeError extends Error {
  readonly name = 'RuntimeError';
  readonly code: RuntimeErrorCode;
  readonly details: Readonly<Record<string, string>>;

  constructor(
    code: RuntimeErrorCode,
    message: string,
    details: Readonly<Record<string, string>> = {},
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
