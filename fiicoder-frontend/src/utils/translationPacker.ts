export function unpackTranslation(backendString: string | undefined | null, currentLang: 'RO' | 'EN'): string {
    if (!backendString) return '';
    try {
        let sanitizedString = backendString;
        if (typeof sanitizedString === 'string') {
            sanitizedString = sanitizedString
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
        }

        let parsedData = JSON.parse(sanitizedString);

        if (typeof parsedData === 'string') {
            parsedData = JSON.parse(parsedData);
        }

        if (typeof parsedData === 'object' && parsedData !== null) {
            const langKey = currentLang.toLowerCase() as 'ro' | 'en';
            if (parsedData[langKey] !== undefined && parsedData[langKey] !== '') {
                return parsedData[langKey];
            }
            // Fallbacks
            if (parsedData['ro']) return parsedData['ro'];
            if (parsedData['en']) return parsedData['en'];
        }
        
        return backendString; 
    } catch (parseError) {
        return backendString; 
    }
}

export function packTranslation(roText: string, enText: string): string {
    return JSON.stringify({ ro: roText, en: enText });
}

export function getTranslationParts(backendString: string | undefined | null): { ro: string; en: string } {
    if (!backendString) return { ro: '', en: '' };
    try {
        let sanitizedString = backendString;
        if (typeof sanitizedString === 'string') {
            sanitizedString = sanitizedString
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
        }

        let parsedData = JSON.parse(sanitizedString);
        
        if (typeof parsedData === 'string') {
            parsedData = JSON.parse(parsedData);
        }

        if (typeof parsedData === 'object' && parsedData !== null) {
            return {
                ro: parsedData.ro || '',
                en: parsedData.en || ''
            };
        }
        return { ro: backendString, en: '' };
    } catch (parseError) {
        return { ro: backendString, en: '' };
    }
}