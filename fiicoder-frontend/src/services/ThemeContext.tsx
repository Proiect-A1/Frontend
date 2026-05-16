import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const THEMES = ["rose", "nord", "cream", "sage", "custom"] as const;
export type Theme = (typeof THEMES)[number];
const DEFAULT_THEME: Theme = THEMES[0];

interface ThemeContextValue {
  theme: Theme;
  themes: readonly Theme[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  customColors: { bg: string; accent: string };
  setCustomColors: (bg: string, accent: string) => void;
}

const THEME_STORAGE_KEY = "fiicoder_theme";
const THEME_FAVICONS: Record<Theme, string> = {
  rose: "/logo.svg",
  nord: "/logo_nord.svg",
  cream: "/logo_cream.svg",
  sage: "/logo_sage.svg",
  custom: "/logo.svg", //inlocuit soon
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(value: string | null): value is Theme {
  return value !== null && THEMES.includes(value as Theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
  });

  const [customColors, setCustomColorsState] = useState(() => {
    const stored = localStorage.getItem("fiicoder_custom_colors");
    return stored ? JSON.parse(stored) : { bg: "#090812", accent: "#ff5eb6" };
  });

  useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_STORAGE_KEY, theme);

        if (theme === 'custom') {
            document.documentElement.style.setProperty('--bg-color', customColors.bg);
            document.documentElement.style.setProperty('--accent', customColors.accent);

            const hexColor = customColors.bg.replace('#', '');
            const redChannel = parseInt(hexColor.substring(0, 2), 16);
            const greenChannel = parseInt(hexColor.substring(2, 4), 16);
            const blueChannel = parseInt(hexColor.substring(4, 6), 16);

            const brightnessScore = (redChannel * 299 + greenChannel * 587 + blueChannel * 114) / 1000;
            const isLightBackground = brightnessScore > 128;

            if (isLightBackground) {
                // Dacă utilizatorul alege un fundal deschis, textul devine închis
                document.documentElement.style.setProperty('--text', '#2d2530');
                document.documentElement.style.setProperty('--text-h', '#120c14');
                document.documentElement.style.setProperty('color-scheme', 'light');
            } else {
                // Dacă fundalul este întunecat, păstrăm textul deschis la culoare
                document.documentElement.style.setProperty('--text', '#e5e9f0');
                document.documentElement.style.setProperty('--text-h', '#ffffff');
                document.documentElement.style.setProperty('color-scheme', 'dark');
            }

            localStorage.setItem('fiicoder_custom_colors', JSON.stringify(customColors));
        } else {
            document.documentElement.style.removeProperty('--bg-color');
            document.documentElement.style.removeProperty('--accent');
            document.documentElement.style.removeProperty('--text');
            document.documentElement.style.removeProperty('--text-h');
            document.documentElement.style.removeProperty('color-scheme');
        }

        const existingFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        const favicon = existingFavicon ?? document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';
        favicon.href = THEME_FAVICONS[theme];

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
      setCustomColors: (bg: string, accent: string) =>
        setCustomColorsState({ bg, accent }),
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
