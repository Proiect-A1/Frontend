/**
 * Format a score value, stripping floating-point noise (e.g. -1.76e-15 → 0)
 * and trimming trailing decimal zeros (e.g. 100.00 → 100, 33.50 → 33.5).
 */
export function formatScore(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '0';
    if (Math.abs(value) < 1e-9) return '0';
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '');
}

export function unindent(str: string): string {
    if (!str) return '';
    const lines = str.split('\n');

    let minIndent = Infinity;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim().length > 0) {
            const match = lines[i].match(/^[ \t]*/);
            if (match) {
                minIndent = Math.min(minIndent, match[0].length);
            }
        }
    }

    if (minIndent === Infinity || minIndent === 0) return str;

    return lines
        .map((line, index) => {
            if (index === 0) return line;
            if (line.trim().length === 0) return '';
            const regex = new RegExp(`^[ \\t]{1,${minIndent}}`);
            return line.replace(regex, '');
        })
        .join('\n');
}
