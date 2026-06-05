import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import type { editor } from 'monaco-editor';
import { applyMonacoTheme } from '../../../utils/monacoTheme';

export function useMonacoTheming(
    monacoRef: MutableRefObject<any>,
    themeName: string,
    extraRulesFactory?: (themeName: string) => any[],
    customColors?: { bg: string; accent: string },
) {
    useEffect(() => {
        if (monacoRef?.current) {
            const extraRules = extraRulesFactory ? extraRulesFactory(themeName) : undefined;
            applyMonacoTheme(monacoRef.current as unknown as typeof editor, themeName, { extraRules, customColors });
        }
    }, [monacoRef, themeName, extraRulesFactory, customColors]);
}

