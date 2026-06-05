// Builds a URL query string from a flat record, skipping null/undefined/empty
// values. Returns a leading "?" only when at least one param survives, so it can
// be concatenated directly onto an endpoint (e.g. `/group${buildQuery({...})}`).
//
// Note: key order follows the input object's insertion order. Query-param order
// is not semantically significant, so callers may spread criteria objects freely.
export type QueryValue = string | number | boolean | null | undefined;

export function buildQuery(params: Record<string, QueryValue>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === '') continue;
        searchParams.append(key, String(value));
    }
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
}
