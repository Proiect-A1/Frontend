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
  customColors?: { bg: string; accent: string };
};

const monacoThemes: Record<string, MonacoThemePalette> = {
  rose: {
    accent: "#ff5eb6",
    accentSecondary: "#a78bfa",
    text: "#ffe8f6",
    textMuted: "#b39aad",
    textSubtle: "#8a7099",
    editorBg: "#0a0812",
    codeBg: "#120e1c",
  },
  nord: {
    accent: "#88c0d0",
    accentSecondary: "#5e81ac",
    text: "#eceff4",
    textMuted: "#7b88a1",
    textSubtle: "#616e88",
    editorBg: "#242933",
    codeBg: "#2e3440",
  },
  cream: {
    accent: "#d4a574",
    accentSecondary: "#b76857",
    text: "#f5f1e8",
    textMuted: "#a89080",
    textSubtle: "#8a7560",
    editorBg: "#1a1612",
    codeBg: "#2a2420",
  },
  sage: {
    accent: "#7a9e7e",
    accentSecondary: "#5a7e78",
    text: "#e8ebe7",
    textMuted: "#7a8f7c",
    textSubtle: "#667069",
    editorBg: "#1a1e1a",
    codeBg: "#242823",
  },
  serika: {
    accent: "#E2B714",
    accentSecondary: "#f39b48",
    text: "#F5F5F0",
    textMuted: "#9E9D96",
    textSubtle: "#7A7972",
    editorBg: "#1e2029",
    codeBg: "#232530",
  },
  eighties: {
    accent: "#E91E8C",
    accentSecondary: "#00E5FF",
    text: "#F0E6FF",
    textMuted: "#9988BB",
    textSubtle: "#7766AA",
    editorBg: "#1A1A2E",
    codeBg: "#16163A",
  },
  "olivia": {
    accent: "#D4A49A",
    accentSecondary: "#8FAB80",
    text: "#3A1E12",
    textMuted: "#8A6A60",
    textSubtle: "#7A5850",
    editorBg: "#E8D8D0",
    codeBg: "#EDD6CB",
  },
  fiicode: {
    accent: "#5DADE2",
    accentSecondary: "#2E86C1",
    text: "#D6EAF8",
    textMuted: "#7BAAC8",
    textSubtle: "#5A8DB0",
    editorBg: "#0E3460",
    codeBg: "#113E67",
  },
  fii: {
    accent: "#3388CB",
    accentSecondary: "#1D6BA8",
    text: "#1C2833",
    textMuted: "#5D7A94",
    textSubtle: "#7F9CB4",
    editorBg: "#EDF2F8",
    codeBg: "#F4F6F9",
  },
  superuser: {
    accent: "#39D353",
    accentSecondary: "#00b4d8",
    text: "#E0FFE0",
    textMuted: "#6DBD6D",
    textSubtle: "#4A8A4A",
    editorBg: "#060D06",
    codeBg: "#0A0A0A",
  },
  mcdonalds: {
    accent: "#DA291C",
    accentSecondary: "#FF8C2C",
    text: "#3C1A0E",
    textMuted: "#8A5A40",
    textSubtle: "#A88060",
    editorBg: "#FFF8DC",
    codeBg: "#FFE680",
  },
};

function hexBrightness(hex: string): number {
  const h = hex.replace('#', '').substring(0, 6);
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function adjustBrightness(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(h.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(h.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(h.substring(4, 6), 16) + amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function blendHex(hex1: string, hex2: string, t: number): string {
  const h1 = hex1.replace('#', '');
  const h2 = hex2.replace('#', '');
  const r = Math.round(parseInt(h1.substring(0, 2), 16) * t + parseInt(h2.substring(0, 2), 16) * (1 - t));
  const g = Math.round(parseInt(h1.substring(2, 4), 16) * t + parseInt(h2.substring(2, 4), 16) * (1 - t));
  const b = Math.round(parseInt(h1.substring(4, 6), 16) * t + parseInt(h2.substring(4, 6), 16) * (1 - t));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function buildCustomPalette(customColors: { bg: string; accent: string }): MonacoThemePalette {
  const { bg, accent } = customColors;
  const isLight = hexBrightness(bg) > 128;
  const text = isLight ? '#2d2530' : '#e5e9f0';
  const codeBg = adjustBrightness(bg, isLight ? -10 : 12);
  return {
    accent,
    accentSecondary: blendHex(accent, '#a78bfa', 0.7),
    text,
    textMuted: blendHex(text, bg, 0.6),
    textSubtle: blendHex(text, bg, 0.45),
    editorBg: bg,
    codeBg,
  };
}

const LANGUAGE_MAP: Record<string, string> = {
  // Full names
  'c++':        'cpp',
  'c':          'c',
  'cpp':        'cpp',
  'python':     'python',
  'java':       'java',
  'javascript': 'javascript',
  'typescript': 'typescript',
  'rust':       'rust',
  'go':         'go',
  'golang':     'go',
  'kotlin':     'kotlin',
  'swift':      'swift',
  'ruby':       'ruby',
  'scala':      'scala',
  'php':        'php',
  'csharp':     'csharp',
  'c#':         'csharp',
  // Short codes the backend sends
  'py':  'python',
  'rs':  'rust',
  'js':  'javascript',
  'ts':  'typescript',
  'kt':  'kotlin',
  'rb':  'ruby',
};

export function getMonacoLanguageId(langName: string): string {
  return LANGUAGE_MAP[langName.toLowerCase().trim()] ?? 'plaintext';
}

export function getMonacoThemePalette(themeName: string): MonacoThemePalette {
  return monacoThemes[themeName] || monacoThemes.rose;
}

export function getEffectivePalette(
  themeName: string,
  customColors?: { bg: string; accent: string },
): MonacoThemePalette {
  return themeName === 'custom' && customColors
    ? buildCustomPalette(customColors)
    : getMonacoThemePalette(themeName);
}

export function applyMonacoTheme(
  monaco: any,
  themeName: string,
  options: ApplyMonacoThemeOptions = {},
) {
  const palette =
    themeName === 'custom' && options.customColors
      ? buildCustomPalette(options.customColors)
      : getMonacoThemePalette(themeName);

  const themeId = options.themeId ?? `fiicoder-${themeName}`;

  // dynamic for custom, static mapping for named themes
  const isLight = hexBrightness(palette.editorBg) > 128;

  const a = palette.accent.replace('#', '');
  const s = palette.accentSecondary.replace('#', '');
  const t = palette.text.replace('#', '');
  const m = palette.textMuted.replace('#', '');

  monaco.editor.defineTheme(themeId, {
    base: isLight ? 'vs' : 'vs-dark',
    inherit: true,
    rules: [
      // Comments - all languages
      { token: 'comment',     foreground: m, fontStyle: 'italic' },
      { token: 'comment.doc', foreground: m, fontStyle: 'italic' }, // C++/Java javadoc

      // Keywords - base covers Python; subtypes cover C++/Java ($0 expansion), Rust, JS
      { token: 'keyword',                   foreground: a },
      { token: 'keyword.control',           foreground: a },
      { token: 'keyword.operator',          foreground: a },
      { token: 'keyword.type',              foreground: a }, // Rust: i32, u64, bool, str…
      { token: 'keyword.directive',         foreground: a }, // C++: #define, #pragma
      { token: 'keyword.directive.include', foreground: a }, // C++: #include
      { token: 'keyword.other',             foreground: a }, // JS: import, export

      // Types
      { token: 'type',            foreground: s },
      { token: 'type.identifier', foreground: s }, // JS/TS class names

      // Strings - all variants across languages
      { token: 'string',          foreground: s },
      { token: 'string.escape',   foreground: s },
      { token: 'string.raw',      foreground: s }, // C++ R"(...)"
      { token: 'string.byteliteral', foreground: s }, // Rust b"..."
      { token: 'string.quote',    foreground: s }, // Rust char literals

      // Numbers - all variants
      { token: 'number',        foreground: a },
      { token: 'number.float',  foreground: a },
      { token: 'number.hex',    foreground: a },
      { token: 'number.octal',  foreground: a },
      { token: 'number.binary', foreground: a },

      // Functions & variables
      { token: 'function',            foreground: a },
      { token: 'variable',            foreground: t },
      { token: 'variable.predefined', foreground: s }, // Python built-ins: print, len, True…

      // Annotations / attributes
      { token: 'annotation', foreground: a }, // Java @Override; C++ [[nodiscard]]
      { token: 'attribute',  foreground: a }, // Rust #[derive(...)]

      // Regexp (JavaScript/TypeScript)
      { token: 'regexp',         foreground: s },
      { token: 'regexp.escape',  foreground: s },

      // Operators
      { token: 'operator', foreground: m }, // Rust explicit operator token

      // Python decorators / magic names
      { token: 'tag', foreground: a },

      ...(options.extraRules ?? []),
    ],
    colors: {
      "editor.background": palette.editorBg,
      "editor.foreground": palette.text,
      "editor.lineHighlightBackground": palette.codeBg,
      "editor.selectionBackground": `${palette.accent}4d`,
      "editor.inactiveSelectionBackground": `${palette.accent}26`,
      "editorLineNumber.foreground": palette.textSubtle,
      "editorLineNumber.activeForeground": palette.accent,
      "editorCursor.foreground": palette.accent,
      "editorIndentGuide.background": `${palette.accent}1f`,
      "editorIndentGuide.activeBackground": `${palette.accent}59`,
      "scrollbarSlider.background": `${palette.accent}26`,
      "scrollbarSlider.hoverBackground": `${palette.accent}4d`,
      "scrollbarSlider.activeBackground": `${palette.accent}80`,
      ...(options.extraColors ?? {}),
    },
  });

  monaco.editor.setTheme(themeId);
}
