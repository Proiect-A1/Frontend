import { useCallback, useEffect, useRef } from 'react';
import type { OnMount } from '@monaco-editor/react';
import { applyMonacoTheme } from '../../../utils/monacoTheme';
import type { Theme, CustomColors } from '../../../contexts/ThemeContext';

/**
 * Keeps the Monaco editor's theme in sync with the app theme. Applies the theme
 * on mount and re-applies it whenever the theme or custom colors change.
 */
export function useMonacoEditorTheme(theme: Theme, customColors: CustomColors) {
    const monacoRef = useRef<any>(null);
    const editorRef = useRef<any>(null);

    const handleEditorMount: OnMount = useCallback(
        (_editor, monaco) => {
            monacoRef.current = monaco;
            editorRef.current = _editor;
            applyMonacoTheme(monaco, theme, { customColors });
            setTimeout(() => _editor.layout(), 100);
        },
        [theme, customColors],
    );

    useEffect(() => {
        if (monacoRef.current) {
            applyMonacoTheme(monacoRef.current, theme, { customColors });
        }
    }, [theme, customColors]);

    return { monacoRef, editorRef, handleEditorMount };
}
