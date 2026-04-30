import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const THEMES = ["rose", "nord"] as const;
export type Theme = (typeof THEMES)[number];
const DEFAULT_THEME: Theme = THEMES[0];

interface ThemeContextValue {
  theme: Theme;
  themes: readonly Theme[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "fiicoder_theme";
const THEME_FAVICONS: Record<Theme, string> = {
  rose: "/logo.svg",
  nord: "/logo_nord.svg",
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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const existingFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const favicon = existingFavicon ?? document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    favicon.href = THEME_FAVICONS[theme];

    if (!existingFavicon) {
      document.head.appendChild(favicon);
    }
  }, [theme]);

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
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
