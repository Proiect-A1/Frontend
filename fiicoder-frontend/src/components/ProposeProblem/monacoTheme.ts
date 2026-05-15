type MonacoThemePalette = {
    accent: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    editorBg: string;
    codeBg: string;
    accentSecondary: string;
};

type MonacoThemeRule = {
    token: string;
    foreground: string;
    fontStyle?: string;
};

type ApplyMonacoThemeOptions = {
    themeId?: string;
    extraRules?: MonacoThemeRule[];
    extraColors?: Record<string, string>;
};

const monacoThemes: Record<string, MonacoThemePalette> = {
    rose: {
        accent: '#ff5eb6',
        accentSecondary: '#a78bfa',
        text: '#ffe8f6',
        textMuted: '#b39aad',
        textSubtle: '#8a7099',
        editorBg: '#0a0812',
        codeBg: '#120e1c',
    },
    nord: {
        accent: '#88c0d0',
        accentSecondary: '#5e81ac',
        text: '#eceff4',
        textMuted: '#7b88a1',
        textSubtle: '#616e88',
        editorBg: '#242933',
        codeBg: '#2e3440',
    },
    cream: {
        accent: '#d4a574',
        accentSecondary: '#b76857',
        text: '#f5f1e8',
        textMuted: '#a89080',
        textSubtle: '#8a7560',
        editorBg: '#1a1612',
        codeBg: '#2a2420',
    },
    sage: {
        accent: '#7a9e7e',
        accentSecondary: '#5a7e78',
        text: '#e8ebe7',
        textMuted: '#7a8f7c',
        textSubtle: '#667069',
        editorBg: '#1a1e1a',
        codeBg: '#242823',
    },
};

export function getMonacoThemePalette(themeName: string): MonacoThemePalette {
    return monacoThemes[themeName] || monacoThemes.rose;
}

export function applyMonacoTheme(
    monaco: any,
    themeName: string,
    options: ApplyMonacoThemeOptions = {},
) {
    const palette = getMonacoThemePalette(themeName);
    const themeId = options.themeId ?? 'fiicoder-dark';

    monaco.editor.defineTheme(themeId, {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: palette.textMuted.replace('#', ''), fontStyle: 'italic' },
            { token: 'keyword', foreground: palette.accent.replace('#', '') },
            { token: 'string', foreground: palette.accentSecondary.replace('#', '') },
            { token: 'number', foreground: palette.accent.replace('#', '') },
            ...(options.extraRules ?? []),
        ],
        colors: {
            'editor.background': palette.editorBg,
            'editor.foreground': palette.text,
            'editor.lineHighlightBackground': palette.codeBg,
            'editor.selectionBackground': `${palette.accent}4d`,
            'editor.inactiveSelectionBackground': `${palette.accent}26`,
            'editorLineNumber.foreground': palette.textSubtle,
            'editorLineNumber.activeForeground': palette.accent,
            'editorCursor.foreground': palette.accent,
            'editorIndentGuide.background': `${palette.accent}1f`,
            'editorIndentGuide.activeBackground': `${palette.accent}59`,
            'scrollbarSlider.background': `${palette.accent}26`,
            'scrollbarSlider.hoverBackground': `${palette.accent}4d`,
            'scrollbarSlider.activeBackground': `${palette.accent}80`,
            ...(options.extraColors ?? {}),
        },
    });

    monaco.editor.setTheme(themeId);
}
