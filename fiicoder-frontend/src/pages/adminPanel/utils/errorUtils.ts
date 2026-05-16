export function extractErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'body' in error) {
        const body = (error as { body?: { message?: string } }).body;
        if (body?.message) return body.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}
