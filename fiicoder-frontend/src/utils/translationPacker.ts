export function unpackTranslation(backendString: string | undefined | null, currentLang: 'RO' | 'EN'): string {
    if (!backendString) return '';
    try {
        let sanitized = backendString;
        if (typeof sanitized === 'string') {
            sanitized = sanitized.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        }

        let parsedData = JSON.parse(sanitized);
        if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);

        if (typeof parsedData === 'object' && parsedData !== null) {
            const langKey = currentLang.toLowerCase() as 'ro' | 'en';
            let text = parsedData[langKey];
            
            if (text === undefined) text = parsedData['ro'];
            if (text === undefined) text = parsedData['en'];
            if (text === undefined) return backendString;

            if (parsedData._encoded) {
                try { 
                    return decodeURIComponent(text); 
                } catch (e) { 
                    return text; 
                }
            }
            return text;
        }
    } catch (e) {
        return backendString; 
    }
    return backendString;
}

export function packTranslation(roText: string, enText: string): string {
    return JSON.stringify({ 
        _encoded: true, 
        ro: encodeURIComponent(roText), 
        en: encodeURIComponent(enText) 
    });
}

export function getTranslationParts(backendString: string | undefined | null): { ro: string; en: string } {
    if (!backendString) return { ro: '', en: '' };
    try {
        let sanitized = backendString;
        if (typeof sanitized === 'string') {
            sanitized = sanitized.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        }

        let parsedData = JSON.parse(sanitized);
        if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);

        if (typeof parsedData === 'object' && parsedData !== null) {
            let ro = parsedData.ro || '';
            let en = parsedData.en || '';

            if (parsedData._encoded) {
                try { ro = decodeURIComponent(ro); } catch(e) {}
                try { en = decodeURIComponent(en); } catch(e) {}
            }
            return { ro, en };
        }
    } catch (e) {
        return { ro: backendString, en: '' };
    }
    return { ro: backendString, en: '' };
}