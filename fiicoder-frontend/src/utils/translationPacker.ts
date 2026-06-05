export function unpackTranslation(backendString: string | undefined | null, currentLang: 'RO' | 'EN'): string {
    if (!backendString) return '';
    try {
        let parsedData = JSON.parse(backendString);
        if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);

        if (typeof parsedData === 'object' && parsedData !== null) {
            const langKey = currentLang.toLowerCase() as 'ro' | 'en';
            let text = parsedData[langKey];

            if (!text) text = parsedData['ro'];
            if (!text) text = parsedData['en'];
            if (!text) return backendString;

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

export function hasTranslation(backendString: string | undefined | null, lang: 'RO' | 'EN'): boolean {
    if (!backendString) return false;
    try {
        let parsedData = JSON.parse(backendString);
        if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);
        if (typeof parsedData === 'object' && parsedData !== null) {
            const langKey = lang.toLowerCase() as 'ro' | 'en';
            const text = parsedData[langKey];
            if (!text) return false;
            if (parsedData._encoded) {
                try { return !!decodeURIComponent(text); } catch { return !!text; }
            }
            return !!text;
        }
    } catch {
        return true;
    }
    return true;
}

export function getTranslationParts(backendString: string | undefined | null): { ro: string; en: string } {
    if (!backendString) return { ro: '', en: '' };
    try {
        let parsedData = JSON.parse(backendString);
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