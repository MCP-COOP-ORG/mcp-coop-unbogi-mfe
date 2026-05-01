/**
 * Type guards for safe runtime checks.
 * Replace `as` assertions with these across the codebase.
 */

interface SignInError {
  code: string;
  message: string;
}

/** Narrows unknown catch value to a sign-in error shape (e.g. Firebase/Google) */
export function isSignInError(error: unknown): error is SignInError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as SignInError).code === 'string' &&
    typeof (error as SignInError).message === 'string'
  );
}

/** Narrows unknown to Error instance */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/** Returns error message from unknown catch value */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message;
  if (isSignInError(error)) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}
