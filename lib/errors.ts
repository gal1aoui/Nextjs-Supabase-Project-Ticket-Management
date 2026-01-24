import type { AuthError, PostgrestError } from "@supabase/supabase-js";

// Error codes for consistent error handling
export const ErrorCode = {
  // Auth errors
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_OTP: "INVALID_OTP",

  // Database errors
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  FOREIGN_KEY_VIOLATION: "FOREIGN_KEY_VIOLATION",
  PERMISSION_DENIED: "PERMISSION_DENIED",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Generic errors
  UNKNOWN: "UNKNOWN",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// Custom API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCodeType,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromSupabaseError(error: PostgrestError | AuthError): ApiError {
    const code = mapSupabaseErrorCode(error);
    const status = "status" in error ? error.status : undefined;
    return new ApiError(error.message, code, status, error);
  }

  static unauthorized(message = "User not authenticated"): ApiError {
    return new ApiError(message, ErrorCode.UNAUTHORIZED, 401);
  }

  static notFound(resource: string): ApiError {
    return new ApiError(`${resource} not found`, ErrorCode.NOT_FOUND, 404);
  }

  static validation(message: string, details?: unknown): ApiError {
    return new ApiError(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

// Map Supabase error codes to our error codes
function mapSupabaseErrorCode(error: PostgrestError | AuthError): ErrorCodeType {
  const code = "code" in error ? error.code : undefined;

  switch (code) {
    case "23505":
      return ErrorCode.DUPLICATE_ENTRY;
    case "23503":
      return ErrorCode.FOREIGN_KEY_VIOLATION;
    case "42501":
      return ErrorCode.PERMISSION_DENIED;
    case "PGRST116":
      return ErrorCode.NOT_FOUND;
    case "invalid_credentials":
      return ErrorCode.INVALID_CREDENTIALS;
    case "user_not_found":
      return ErrorCode.USER_NOT_FOUND;
    case "email_exists":
      return ErrorCode.EMAIL_ALREADY_EXISTS;
    default:
      return ErrorCode.UNKNOWN;
  }
}

// Result type for operations that can fail
export type Result<T, E = ApiError> = { success: true; data: T } | { success: false; error: E };

// Helper to create success result (returns narrow type for proper inference)
export function success<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

// Helper to create error result (returns narrow type for proper inference)
export function failure<E>(error: E): { success: false; error: E } {
  return { success: false, error };
}

// Generic Supabase response type
type SupabaseResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

// Wrapper for Supabase operations that return data (SELECT, INSERT, UPDATE with .select())
export async function handleSupabaseError<T>(
  operation: () => PromiseLike<SupabaseResponse<T>>
): Promise<T> {
  const { data, error } = await operation();

  if (error) {
    throw ApiError.fromSupabaseError(error);
  }

  if (data === null) {
    throw ApiError.notFound("Resource");
  }

  return data;
}

// Wrapper for Supabase operations that return void (DELETE without .select())
export async function handleSupabaseVoid(
  operation: () => PromiseLike<{ error: PostgrestError | null }>
): Promise<void> {
  const { error } = await operation();

  if (error) {
    throw ApiError.fromSupabaseError(error);
  }
}

// Wrapper for auth operations
export async function handleAuthError<T>(
  operation: () => Promise<{ data: T; error: AuthError | null }>
): Promise<T> {
  const { data, error } = await operation();

  if (error) {
    throw ApiError.fromSupabaseError(error);
  }

  return data;
}

// Get user or throw unauthorized error
export async function requireAuth(supabase: {
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
}): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw ApiError.unauthorized();
  }

  return user.id;
}

// Format error for user display
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

// Check if error is of specific code
export function isErrorCode(error: unknown, code: ErrorCodeType): boolean {
  return error instanceof ApiError && error.code === code;
}
