/** Splits a comma-separated input into trimmed, non-empty values. */
export function parseCsvValues(rawInput: string): string[] {
    return rawInput
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
}
