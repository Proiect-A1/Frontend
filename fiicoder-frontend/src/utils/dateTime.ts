export type LocaleLang = 'RO' | 'EN';

export function formatDateTime(value: string | undefined, lang: LocaleLang): string {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat(lang === 'RO' ? 'ro-RO' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(parsed);
}
