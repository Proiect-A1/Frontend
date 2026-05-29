import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const THEMES = ["fii", "fiicode", "rose", "nord", "cream", "sage", "olivia", "serika", "eighties", "superuser", "custom", "mcdonalds"] as const;
export type Theme = (typeof THEMES)[number];
const DEFAULT_THEME: Theme = "fii";

export type CustomRadius = 'rounded' | 'medium' | 'square';
export type CustomFont   = 'sans' | 'serif' | 'mono' | 'pixel';
export type CustomBorder = 'default' | 'wobbly';
export interface CustomColors {
  bg: string;
  accent: string;
  radius: CustomRadius;
  font: CustomFont;
  border: CustomBorder;
}

interface ThemeContextValue {
  theme: Theme;
  themes: readonly Theme[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  customColors: CustomColors;
  setCustomColors: (colors: Partial<CustomColors>) => void;
}

const THEME_STORAGE_KEY = "fiicoder_theme";
const THEME_FAVICONS: Record<Theme, string> = {
  rose: "/logo.svg",
  nord: "/logo_nord.svg",
  cream: "/logo_cream.svg",
  sage: "/logo_sage.svg",
  serika: "/logo_serika.svg",
  eighties: "/logo_eighties.svg",
  "olivia": "/logo_olivia.svg",
  fiicode: "/logo_fiicode.svg",
  fii: "/logo_fii.svg",
  superuser: "/logo_superuser.svg",
  custom: "/logo.svg",
  mcdonalds: "/logo.svg",
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const CUSTOM_COLORS_KEY = "fiicoder_custom_colors";
const DEFAULT_CUSTOM_COLORS: CustomColors = { bg: "#090812", accent: "#ff5eb6", radius: 'rounded', font: 'sans', border: 'default' };

function isTheme(value: string | null): value is Theme {
  return value !== null && THEMES.includes(value as Theme);
}

// In Safari/Firefox private mode, localStorage poate fi indisponibil sau
// poate intoarce date corupte. Orice throw aici ar darama intregul tree
// fara ErrorBoundary, deci defensiva.
function safeReadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function safeReadCustomColors(): CustomColors {
  try {
    const stored = localStorage.getItem(CUSTOM_COLORS_KEY);
    if (!stored) return DEFAULT_CUSTOM_COLORS;
    const parsed = JSON.parse(stored) as Partial<{ bg: string; accent: string; radius: string; font: string; border: string }>;
    if (parsed && typeof parsed.bg === "string" && typeof parsed.accent === "string") {
      return {
        bg:     parsed.bg,
        accent: parsed.accent,
        radius: (['rounded', 'medium', 'square'] as CustomRadius[]).includes(parsed.radius as CustomRadius)
          ? (parsed.radius as CustomRadius) : 'rounded',
        font:   (['sans', 'serif', 'mono', 'pixel'] as CustomFont[]).includes(parsed.font as CustomFont)
          ? (parsed.font as CustomFont) : 'sans',
        border: (['default', 'wobbly'] as CustomBorder[]).includes(parsed.border as CustomBorder)
          ? (parsed.border as CustomBorder) : 'default',
      };
    }
    return DEFAULT_CUSTOM_COLORS;
  } catch {
    try {
      localStorage.removeItem(CUSTOM_COLORS_KEY);
    } catch {
      // ignore
    }
    return DEFAULT_CUSTOM_COLORS;
  }
}

function safeWrite(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota errors and private-mode blocks
  }
}

// ── WAVY BORDER ──────────────────────────────────────────────────────────────

function generateWavyRectPath(w: number, h: number): string {
  const A = 5, L = 54, R = 22;

  function waveX(x1: number, x2: number, y: number, startUp: boolean): string {
    const dist = x2 - x1;
    const n = Math.max(1, Math.round(Math.abs(dist) / L));
    const wl = dist / n;
    let d = '', cx = x1, up = startUp;
    for (let i = 0; i < n; i++) {
      const dy = up ? -A : A;
      d += ` C${(cx+wl*.3).toFixed(1)},${(y+dy).toFixed(1)} ${(cx+wl*.7).toFixed(1)},${(y+dy).toFixed(1)} ${(cx+wl).toFixed(1)},${y}`;
      cx += wl; up = !up;
    }
    return d;
  }

  function waveY(y1: number, y2: number, x: number, startRight: boolean): string {
    const dist = y2 - y1;
    const n = Math.max(1, Math.round(Math.abs(dist) / L));
    const wl = dist / n;
    let d = '', cy = y1, right = startRight;
    for (let i = 0; i < n; i++) {
      const dx = right ? A : -A;
      d += ` C${(x+dx).toFixed(1)},${(cy+wl*.3).toFixed(1)} ${(x+dx).toFixed(1)},${(cy+wl*.7).toFixed(1)} ${x},${(cy+wl).toFixed(1)}`;
      cy += wl; right = !right;
    }
    return d;
  }

  const r = Math.min(R, w / 4, h / 4);
  return [
    `M${r},0`,
    waveX(r, w - r, 0, true),
    ` Q${w},0 ${w},${r}`,
    waveY(r, h - r, w, true),
    ` Q${w},${h} ${w-r},${h}`,
    waveX(w - r, r, h, false),
    ` Q0,${h} 0,${h-r}`,
    waveY(h - r, r, 0, false),
    ` Q0,0 ${r},0 Z`,
  ].join('');
}

const WAVY_SEL = '.flexlayout__tabset, .rounded-3xl, .rounded-2xl, .rounded-xl, .rounded-full';

function applyWavyBorders(): () => void {
  const ros: ResizeObserver[] = [];
  const seen = new WeakSet<Element>();
  const ns = 'http://www.w3.org/2000/svg';
  const OFF = 4;

  function add(el: HTMLElement) {
    if (seen.has(el) || el.hasAttribute('data-wavy-border')) return;
    seen.add(el);
    el.setAttribute('data-wavy-border', '1');
    if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';

    const svg = document.createElementNS(ns, 'svg') as SVGSVGElement;
    svg.setAttribute('data-wavy-overlay', '1');
    svg.style.cssText = `position:absolute;top:-${OFF}px;left:-${OFF}px;width:calc(100% + ${OFF*2}px);height:calc(100% + ${OFF*2}px);pointer-events:none;z-index:20;overflow:visible`;

    const path = document.createElementNS(ns, 'path') as SVGPathElement;
    path.style.fill = 'none';
    path.style.stroke = 'var(--accent)';
    path.style.strokeWidth = '2';
    path.style.strokeLinecap = 'round';
    path.style.strokeLinejoin = 'round';
    svg.appendChild(path);
    el.appendChild(svg);

    const update = () => {
      const w = el.offsetWidth + OFF * 2, h = el.offsetHeight + OFF * 2;
      if (w < 20 || h < 20) return;
      path.setAttribute('d', generateWavyRectPath(w, h));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    ros.push(ro);
  }

  document.querySelectorAll<HTMLElement>(WAVY_SEL).forEach(add);

  const mo = new MutationObserver(muts => {
    for (const { addedNodes } of muts)
      addedNodes.forEach(n => {
        if (!(n instanceof HTMLElement)) return;
        if (n.matches?.(WAVY_SEL)) add(n);
        n.querySelectorAll<HTMLElement>(WAVY_SEL).forEach(add);
      });
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    mo.disconnect();
    ros.forEach(r => r.disconnect());
    document.querySelectorAll('[data-wavy-overlay]').forEach(e => e.remove());
    document.querySelectorAll('[data-wavy-border]').forEach(e => e.removeAttribute('data-wavy-border'));
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(safeReadTheme);

  const [customColors, setCustomColorsState] = useState(safeReadCustomColors);
  const wavyCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        safeWrite(THEME_STORAGE_KEY, theme);
        wavyCleanupRef.current?.();
        wavyCleanupRef.current = null;
        document.getElementById('custom-squiggle-svg')?.remove();

        // Resolve effective tone (light/dark) per theme — used to retarget
        // low-contrast Tailwind palette utilities (text-amber-400, bg-red-500/15, etc.)
        const STATIC_LIGHT_THEMES: Theme[] = ['cream', 'sage', 'olivia', 'fii', 'mcdonalds'];
        let isLightTone = STATIC_LIGHT_THEMES.includes(theme);

        if (theme === 'custom') {
            document.documentElement.style.setProperty('--bg-color', customColors.bg);
            document.documentElement.style.setProperty('--accent', customColors.accent);

            const hexColor = customColors.bg.replace('#', '');
            const redChannel = parseInt(hexColor.substring(0, 2), 16);
            const greenChannel = parseInt(hexColor.substring(2, 4), 16);
            const blueChannel = parseInt(hexColor.substring(4, 6), 16);

            const brightnessScore = (redChannel * 299 + greenChannel * 587 + blueChannel * 114) / 1000;
            const isLightBackground = brightnessScore > 128;
            isLightTone = isLightBackground;

            let textHex = '#e5e9f0';
            let textHHex = '#ffffff';

            if (isLightBackground) {
                textHex = '#2d2530';
                textHHex = '#120c14';
                document.documentElement.style.setProperty('--text', textHex);
                document.documentElement.style.setProperty('--text-h', textHHex);
                document.documentElement.style.setProperty('--color-scheme', 'light');
            } else {
                textHex = '#e5e9f0';
                textHHex = '#ffffff';
                document.documentElement.style.setProperty('--text', textHex);
                document.documentElement.style.setProperty('--text-h', textHHex);
                document.documentElement.style.setProperty('--color-scheme', 'dark');
            }

            const cursorDefault = `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'><circle cx='13' cy='13' r='5.4' fill='none' stroke='${textHHex}' stroke-width='1.4'/><circle cx='13' cy='13' r='2.8' fill='${customColors.accent}'/></svg>`;
            const cursorPointer = `<svg xmlns='http://www.w3.org/2000/svg' width='29' height='29' viewBox='0 0 36 36'><path d='M8 4L31 24L17 24.5L8 32Z' fill='${customColors.accent}' stroke='color-mix(in srgb, ${customColors.accent} 50%, black 50%)' stroke-width='2.8' stroke-linejoin='round' stroke-linecap='round'/></svg>`;
            const cursorText = `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'><path d='M10 4.5h6M13 4.5v17M10 21.5h6M9.5 9h7M9.5 17h7' stroke='${customColors.accent}' stroke-width='1.9' stroke-linecap='round'/><circle cx='13' cy='13' r='1.1' fill='${textHHex}'/></svg>`;

            document.documentElement.style.setProperty('--cursor-default', `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(cursorDefault)}")`);
            document.documentElement.style.setProperty('--cursor-pointer', `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(cursorPointer)}")`);
            document.documentElement.style.setProperty('--cursor-text', `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(cursorText)}")`);
            // Radius
            document.documentElement.setAttribute('data-custom-radius', customColors.radius);

            // Font
            const FONT_MAP: Record<CustomFont, { sans: string; heading: string }> = {
                sans:  { sans: "system-ui, 'Segoe UI', Roboto, sans-serif",  heading: "system-ui, 'Segoe UI', Roboto, sans-serif" },
                serif: { sans: "'Lora', Georgia, serif",                     heading: "'Lora', Georgia, serif" },
                mono:  { sans: "'JetBrains Mono', 'Courier New', monospace", heading: "'JetBrains Mono', 'Courier New', monospace" },
                pixel: { sans: "'Pixelify Sans', monospace",                 heading: "'Pixelify Sans', monospace" },
            };
            const fontCfg = FONT_MAP[customColors.font];
            document.documentElement.style.setProperty('--sans', fontCfg.sans);
            document.documentElement.style.setProperty('--heading', fontCfg.heading);
            if (customColors.font === 'mono' || customColors.font === 'pixel') {
                document.documentElement.style.setProperty('--mono', fontCfg.sans);
            } else {
                document.documentElement.style.removeProperty('--mono');
            }

            // Border style
            document.documentElement.setAttribute('data-custom-border', customColors.border);
            if (customColors.border === 'wobbly') {
                requestAnimationFrame(() => {
                    wavyCleanupRef.current = applyWavyBorders();
                });
            }

            safeWrite(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
        } else {
            document.documentElement.style.removeProperty('--bg-color');
            document.documentElement.style.removeProperty('--accent');
            document.documentElement.style.removeProperty('--text');
            document.documentElement.style.removeProperty('--text-h');
            document.documentElement.style.removeProperty('--color-scheme');
            document.documentElement.style.removeProperty('--cursor-default');
            document.documentElement.style.removeProperty('--cursor-pointer');
            document.documentElement.style.removeProperty('--cursor-text');
            document.documentElement.removeAttribute('data-custom-radius');
            document.documentElement.removeAttribute('data-custom-border');
            document.documentElement.style.removeProperty('--sans');
            document.documentElement.style.removeProperty('--heading');
            document.documentElement.style.removeProperty('--mono');
        }

        document.documentElement.setAttribute('data-tone', isLightTone ? 'light' : 'dark');

        const existingFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        const favicon = existingFavicon ?? document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';

        if (theme === 'mcdonalds') {
            const mcFaviconSvg = `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><path d="M 15 90 L 15 35 Q 15 12 37 12 Q 60 12 60 38 L 60 60 L 60 38 Q 60 12 83 12 Q 105 12 105 35 L 105 90 L 88 90 L 88 40 Q 88 26 76 26 Q 65 26 65 42 L 65 90 L 55 90 L 55 42 Q 55 26 44 26 Q 32 26 32 40 L 32 90 Z" fill="#FFC72C" stroke="#DA291C" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
            favicon.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mcFaviconSvg)}`;
        } else if (theme === 'custom') {
            const faviconSvg = `<svg viewBox="2.5229450154783466 65.87558809587485 252.37708872055313 121.06515820573098" xmlns="http://www.w3.org/2000/svg">
                <path style="fill: color-mix(in srgb, ${customColors.accent} 65%, white 35%)" fill-rule="evenodd" d="m17.3 109.25c-13.11 9.81-11.44 18.37-3.9 31.5 10.98 19.14 27.93 26.49 49.35 31.28 23.25 5.2 56.87-25.08 73.85-38.63 9.92-7.92 18.84-16.75 27.13-26.28 1.01-1.16 7-5.69 6.74-7.59-1.23-9-21.08-15.19-27.74-17.53-25.2-8.88-67.63-9.77-92.39 0.84-11.77 5.05-26.1 11.77-34.93 21.32-2.89 3.12-6.21 7.03-6.98 11.4-0.13 0.75 0.67 6.65-0.55 5.4"/>
                <path style="fill: ${customColors.accent}" d="m55.22 98.48c1.9-6.86 15.7-8.67 25.44-9.95 24.97-3.05 49.07 0.62 70.8 10 7.76-0.71 14.7 11.59 37.64 9.2 8.74-0.91 15.88-3.54 21.18-5.5 23.94-8.86 35.47-22.28 38-20.03 3.33 2.98-20.45 22.76-19.1 48.87 0.97 18.99 14.99 30.67 11.14 34.53-3.47 3.48-14.1-6.78-36.5-12.65-18.05-4.73-32.33-3.63-39.8-2.98-13.53 1.17-37.72 5.58-38.26 13.1-0.48 6.64 17.91 10.82 17.04 14.73-0.36 1.6-4.05 3.75-55.12-1.29-24.25-2.39-29.9-3.51-31.67-7.76-4.33-10.29 21.15-22.26 18.88-40.46-1.94-15.46-22.1-21.04-19.67-29.81z"/>
                <path style="fill: color-mix(in srgb, ${customColors.accent} 55%, black 45%)" d="m227.99 136.58c-7.77-6.17-12.46-6.76-56.22-0.73-30.61 4.22-34.17 5.02-39.81 7.32-19.74 8.07-18.24 15.5-32.1 18.64-11.41 2.57-22.11-0.28-38.2-6.8-4.25 5.07-7.45 9.55-5.69 13.75 7.28 2.15 18.21 5.12 31.67 7.76 2.87 0.56 50.96 9.82 53.15 2.79 1.33-4.26-15.81-9.28-15.07-16.24 1-9.43 34.19-16.1 62.98-13.22 22.99 2.31 40.61 10.45 50.94 16.21-0.72-19.1-8.02-26.61-11.65-29.48z"/>
                <path style="fill: color-mix(in srgb, ${customColors.accent} 30%, black 70%)" d="m242.42 171.6c-1.86 0.91-4.46 1.31-8 0.21-2.3-0.71-4.86-1.96-8.1-3.53-5.71-2.78-13.55-6.59-24.08-9.35-17.37-4.55-31.1-3.37-37.7-2.8-7.43 0.64-11.97 1.55-20.51 3.34-6.73 1.42-11.05 2.63-11.03 3.99 0.02 0.72 1.28 0.99 5.77 3.34 3.16 1.64 4.74 2.45 5.76 3.32 0.24 0.2 5.21 4.6 4.28 9.03-0.95 4.6-7.59 6.82-10.67 7.25-3.52 0.5-8.25 0.65-14.06 0.46-10.94-0.38-24.61-1.93-37.52-4.27-14.84-2.7-28.85-5.23-45.21-13.49-16.73-8.45-35.69-18.02-38.49-36.23-3.42-22.21 19.84-40.26 28.61-47.05 18.5-14.37 37.62-17.42 44.82-18.57 21.35-3.41 40.52 0.16 52.85 3.76 1.61 0.48 3.02 1.59 3.81 3.21 1.51 3.07 0.24 6.77-2.82 8.28-1.45 0.7-3.04 0.8-4.47 0.38-11.1-3.24-28.35-6.47-47.43-3.43-6.34 1.01-23.19 3.7-39.19 16.12-3.74 2.9-10.7 8.3-16.21 14.99-6.1 7.41-8.71 14.28-7.77 20.43 1.84 11.93 17.1 19.63 31.86 27.08 14.01 7.05 29.13 10.95 44.58 11.51-25.27-3.49-17.18-1.53-2.73 0.86 15.13 2.49 38.34 5.73 38.65 4.13 0.07-0.32-0.86-0.51-2.28-1.58-3.59-2.71-5.76-7.45-5.55-10.35 0.61-8.39 10.99-12.27 18.76-14.43 10.54-2.96 21.91-4.1 25.14-4.37 7.28-0.64 22.44-1.94 41.9 3.15 11.28 2.96 19.55 6.9 25.67 9.86-3.32-6.12-7.5-14.71-8.06-25.45-0.81-15.89 6.72-29.16 12.79-38.26l-3.71 1.85c-4.54 2.26-10.2 5.08-17.2 8.49-13.18 6.41-17.49 8.46-20.55 8.97-13.49 2.26-22.5-4.04-32.93-11.34-2.73-1.91-5.55-3.88-8.68-5.88-0.91-0.57-1.7-1.42-2.22-2.49-1.51-3.06-0.24-6.76 2.82-8.26 2-0.98 4.27-0.79 6.02 0.32 3.38 2.16 6.44 4.3 9.14 6.19 10.33 7.22 15.66 10.63 23.78 9.28 1.74-0.38 8.91-3.87 17.21-7.91 6.95-3.37 12.58-6.18 17.1-8.43 7.11-3.55 11.4-5.69 14.49-6.93 2.32-0.93 7.76-3.12 11.66 0.91 1.53 1.57 3.65 5.09 0.7 10.88-1.07 2.1-2.71 4.48-4.63 7.23-5.64 8.14-14.17 20.44-13.44 34.74 0.47 9.17 4.47 16.39 7.68 22.2 1.43 2.58 2.66 4.81 3.4 6.93 1.88 5.39-0.27 8.64-1.73 10.09-0.6 0.61-1.36 1.17-2.23 1.59q-0.02 0.02-0.05 0.03z"/>
                <path style="fill: color-mix(in srgb, ${customColors.accent} 30%, black 70%)" d="m145.08 88q0 0 0 0c-1.74 0.85-3.68 0.82-5.31 0.06l-0.49-0.22c-1.25-0.57-2.33-1.56-2.99-2.9-1.5-3.07-0.23-6.77 2.83-8.27 1.72-0.84 3.65-0.81 5.27-0.08l0.57 0.26c1.23 0.57 2.3 1.56 2.95 2.88 1.5 3.07 0.24 6.77-2.83 8.27z"/>
                <path style="fill: color-mix(in srgb, ${customColors.accent} 30%, black 70%)" d="m48.56 131.24c1.53 0.12 3.17-0.17 4.7-0.92 4.6-2.25 6.5-7.81 4.25-12.4-1.51-3.06-4.48-4.93-7.65-5.16-1.59-0.12-3.22 0.17-4.76 0.92-4.59 2.25-6.49 7.8-4.24 12.4 1.51 3.06 4.47 4.93 7.65 5.16z"/>
            </svg>`;
            favicon.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faviconSvg)}`;
        } else {
            favicon.href = THEME_FAVICONS[theme];
        }

        if (!existingFavicon) {
            document.head.appendChild(favicon);
        }
    }, [theme, customColors]);

  const value = useMemo(
    () => ({
      theme,
      themes: THEMES,
      setTheme: (nextTheme: Theme) => setThemeState(nextTheme),
      toggleTheme: () =>
        setThemeState((prevTheme) => {
          const currentIndex = THEMES.indexOf(prevTheme);
          const nextIndex = (currentIndex + 1) % THEMES.length;
          return THEMES[nextIndex];
        }),
      customColors,
      setCustomColors: (colors: Partial<CustomColors>) =>
        setCustomColorsState((prev) => ({ ...prev, ...colors })),
    }),
    [theme, customColors],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}