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
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme === "custom") {
      document.documentElement.style.setProperty("--bg-color", customColors.bg);
      document.documentElement.style.setProperty(
        "--accent",
        customColors.accent,
      );
      localStorage.setItem(
        "fiicoder_custom_colors",
        JSON.stringify(customColors),
      );
    } else {
      document.documentElement.style.removeProperty("--bg-color");
      document.documentElement.style.removeProperty("--accent");
    }

    const existingFavicon =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const favicon = existingFavicon ?? document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
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
