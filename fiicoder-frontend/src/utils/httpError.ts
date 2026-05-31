// The error apiClient rejects with: a real Error (so `instanceof Error` and
// React Query's error handling work) that also carries the HTTP `status` and
// parsed response `body`. `message` is the response statusText.
export class ApiError extends Error {
    readonly status: number;
    readonly body: unknown;

    constructor(status: number, body: unknown, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

// Shared helper for turning an unknown thrown value into a user-facing message.
// Handles ApiError / `{ body }` shapes (preferring the backend message) as well
// as plain Error instances, falling back to the provided default.
export function extractErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'body' in error) {
        const body = (error as { body?: { message?: string } }).body;
        if (body?.message) return body.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}
