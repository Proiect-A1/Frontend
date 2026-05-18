import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import SearchInput from "./SearchInput";
import { problemService } from "../services/problemService";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const { isAuthenticated, username, isAdmin, isProfessor, logout } = useAuth();

  const { theme, themes, setTheme, customColors, setCustomColors } = useTheme();

  const formatThemeLabel = (themeName: string) =>
    themeName.charAt(0).toUpperCase() + themeName.slice(1);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isMobileThemeOpen, setIsMobileThemeOpen] = useState(false);

  const [navSearch, setNavSearch] = useState("");
  const [navSuggestions, setNavSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    problemService
      .getAllProblems(1, 200)
      .then((data) => {
        if (!mounted) return;
        setNavSuggestions(data.map((d) => d.title));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleNavSearchEnter = async () => {
    const trimmed = navSearch.trim();
    if (!trimmed) return;

    const matchedSuggestion = navSuggestions.find((title) =>
      title.toLowerCase().includes(trimmed.toLowerCase()),
    );

    if (matchedSuggestion) {
      navigate(`/problems/${matchedSuggestion}`);
      return;
    }

    try {
      const problem = await problemService.getProblemByTitle(trimmed);
      if (problem?.title) navigate(`/problems/${problem.title}`);
    } catch {
      // ignore if not found
    }
  };

  // Split into two refs: one for the trigger button, one for the panel.
  // The panel lives outside the pill to avoid the overflow-hidden on the
  // lang-toggle sibling clipping the absolutely-positioned dropdown.
  const themeButtonRef = useRef<HTMLDivElement>(null);
  const themePanelRef = useRef<HTMLDivElement>(null);
  const mobileThemeDropdownRef = useRef<HTMLDivElement>(null);

  const themeLogo: Record<string, string> = {
    rose: "/logo.svg",
    nord: "/logo_nord.svg",
    cream: "/logo_cream.svg",
    sage: "/logo_sage.svg",
  };
  const logoSrc = themeLogo[theme] || "/logo.svg";

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    const baseClasses =
      "px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0";
    return isActive
      ? `${baseClasses} bg-(--accent)/25 border-(--accent) text-(--text-h)`
      : `${baseClasses} bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5`;
  };

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMobileOpen(false);
    setIsThemeOpen(false);
    setIsMobileThemeOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Close desktop theme dropdown when clicking outside both the
      // trigger button and the panel (they are now separate DOM subtrees).
      if (
        themeButtonRef.current &&
        !themeButtonRef.current.contains(target) &&
        themePanelRef.current &&
        !themePanelRef.current.contains(target)
      ) {
        setIsThemeOpen(false);
      }
      if (
        mobileThemeDropdownRef.current &&
        !mobileThemeDropdownRef.current.contains(target)
      ) {
        setIsMobileThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full px-4 md:px-6 pt-4">
      <nav className="w-full relative">
        <div className="bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-full px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-3 transition-transform duration-200 hover:scale-105"
            >
              {theme === "custom" ? (
                <svg
                  className="theme-logo h-10 w-10 md:h-12 md:w-12 theme-logo-glow"
                  viewBox="2.5229450154783466 65.87558809587485 252.37708872055313 121.06515820573098"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* s0 - Culoarea cea mai deschisă (lumină) */}
                  <path
                    style={{
                      fill: "color-mix(in srgb, var(--accent) 65%, white 35%)",
                    }}
                    fillRule="evenodd"
                    d="m17.3 109.25c-13.11 9.81-11.44 18.37-3.9 31.5 10.98 19.14 27.93 26.49 49.35 31.28 23.25 5.2 56.87-25.08 73.85-38.63 9.92-7.92 18.84-16.75 27.13-26.28 1.01-1.16 7-5.69 6.74-7.59-1.23-9-21.08-15.19-27.74-17.53-25.2-8.88-67.63-9.77-92.39 0.84-11.77 5.05-26.1 11.77-34.93 21.32-2.89 3.12-6.21 7.03-6.98 11.4-0.13 0.75 0.67 6.65-0.55 5.4"
                  />
                  {/* s1 - Culoarea de bază (Accentul ales din slider) */}
                  <path
                    style={{ fill: "var(--accent)" }}
                    d="m55.22 98.48c1.9-6.86 15.7-8.67 25.44-9.95 24.97-3.05 49.07 0.62 70.8 10 7.76-0.71 14.7 11.59 37.64 9.2 8.74-0.91 15.88-3.54 21.18-5.5 23.94-8.86 35.47-22.28 38-20.03 3.33 2.98-20.45 22.76-19.1 48.87 0.97 18.99 14.99 30.67 11.14 34.53-3.47 3.48-14.1-6.78-36.5-12.65-18.05-4.73-32.33-3.63-39.8-2.98-13.53 1.17-37.72 5.58-38.26 13.1-0.48 6.64 17.91 10.82 17.04 14.73-0.36 1.6-4.05 3.75-55.12-1.29-24.25-2.39-29.9-3.51-31.67-7.76-4.33-10.29 21.15-22.26 18.88-40.46-1.94-15.46-22.1-21.04-19.67-29.81z"
                  />
                  {/* s2 - Culoarea medie/închisă (umbra primară) */}
                  <path
                    style={{
                      fill: "color-mix(in srgb, var(--accent) 55%, black 45%)",
                    }}
                    d="m227.99 136.58c-7.77-6.17-12.46-6.76-56.22-0.73-30.61 4.22-34.17 5.02-39.81 7.32-19.74 8.07-18.24 15.5-32.1 18.64-11.41 2.57-22.11-0.28-38.2-6.8-4.25 5.07-7.45 9.55-5.69 13.75 7.28 2.15 18.21 5.12 31.67 7.76 2.87 0.56 50.96 9.82 53.15 2.79 1.33-4.26-15.81-9.28-15.07-16.24 1-9.43 34.19-16.1 62.98-13.22 22.99 2.31 40.61 10.45 50.94 16.21-0.72-19.1-8.02-26.61-11.65-29.48z"
                  />
                  {/* s3 - Contururile și detaliile foarte închise */}
                  <path
                    style={{
                      fill: "color-mix(in srgb, var(--accent) 30%, black 70%)",
                    }}
                    d="m242.42 171.6c-1.86 0.91-4.46 1.31-8 0.21-2.3-0.71-4.86-1.96-8.1-3.53-5.71-2.78-13.55-6.59-24.08-9.35-17.37-4.55-31.1-3.37-37.7-2.8-7.43 0.64-11.97 1.55-20.51 3.34-6.73 1.42-11.05 2.63-11.03 3.99 0.02 0.72 1.28 0.99 5.77 3.34 3.16 1.64 4.74 2.45 5.76 3.32 0.24 0.2 5.21 4.6 4.28 9.03-0.95 4.6-7.59 6.82-10.67 7.25-3.52 0.5-8.25 0.65-14.06 0.46-10.94-0.38-24.61-1.93-37.52-4.27-14.84-2.7-28.85-5.23-45.21-13.49-16.73-8.45-35.69-18.02-38.49-36.23-3.42-22.21 19.84-40.26 28.61-47.05 18.5-14.37 37.62-17.42 44.82-18.57 21.35-3.41 40.52 0.16 52.85 3.76 1.61 0.48 3.02 1.59 3.81 3.21 1.51 3.07 0.24 6.77-2.82 8.28-1.45 0.7-3.04 0.8-4.47 0.38-11.1-3.24-28.35-6.47-47.43-3.43-6.34 1.01-23.19 3.7-39.19 16.12-3.74 2.9-10.7 8.3-16.21 14.99-6.1 7.41-8.71 14.28-7.77 20.43 1.84 11.93 17.1 19.63 31.86 27.08 14.01 7.05 29.13 10.95 44.58 11.51-25.27-3.49-17.18-1.53-2.73 0.86 15.13 2.49 38.34 5.73 38.65 4.13 0.07-0.32-0.86-0.51-2.28-1.58-3.59-2.71-5.76-7.45-5.55-10.35 0.61-8.39 10.99-12.27 18.76-14.43 10.54-2.96 21.91-4.1 25.14-4.37 7.28-0.64 22.44-1.94 41.9 3.15 11.28 2.96 19.55 6.9 25.67 9.86-3.32-6.12-7.5-14.71-8.06-25.45-0.81-15.89 6.72-29.16 12.79-38.26l-3.71 1.85c-4.54 2.26-10.2 5.08-17.2 8.49-13.18 6.41-17.49 8.46-20.55 8.97-13.49 2.26-22.5-4.04-32.93-11.34-2.73-1.91-5.55-3.88-8.68-5.88-0.91-0.57-1.7-1.42-2.22-2.49-1.51-3.06-0.24-6.76 2.82-8.26 2-0.98 4.27-0.79 6.02 0.32 3.38 2.16 6.44 4.3 9.14 6.19 10.33 7.22 15.66 10.63 23.78 9.28 1.74-0.38 8.91-3.87 17.21-7.91 6.95-3.37 12.58-6.18 17.1-8.43 7.11-3.55 11.4-5.69 14.49-6.93 2.32-0.93 7.76-3.12 11.66 0.91 1.53 1.57 3.65 5.09 0.7 10.88-1.07 2.1-2.71 4.48-4.63 7.23-5.64 8.14-14.17 20.44-13.44 34.74 0.47 9.17 4.47 16.39 7.68 22.2 1.43 2.58 2.66 4.81 3.4 6.93 1.88 5.39-0.27 8.64-1.73 10.09-0.6 0.61-1.36 1.17-2.23 1.59q-0.02 0.02-0.05 0.03z"
                  />
                  <path
                    style={{
                      fill: "color-mix(in srgb, var(--accent) 30%, black 70%)",
                    }}
                    d="m145.08 88q0 0 0 0c-1.74 0.85-3.68 0.82-5.31 0.06l-0.49-0.22c-1.25-0.57-2.33-1.56-2.99-2.9-1.5-3.07-0.23-6.77 2.83-8.27 1.72-0.84 3.65-0.81 5.27-0.08l0.57 0.26c1.23 0.57 2.3 1.56 2.95 2.88 1.5 3.07 0.24 6.77-2.83 8.27z"
                  />
                  <path
                    style={{
                      fill: "color-mix(in srgb, var(--accent) 30%, black 70%)",
                    }}
                    d="m48.56 131.24c1.53 0.12 3.17-0.17 4.7-0.92 4.6-2.25 6.5-7.81 4.25-12.4-1.51-3.06-4.48-4.93-7.65-5.16-1.59-0.12-3.22 0.17-4.76 0.92-4.59 2.25-6.49 7.8-4.24 12.4 1.51 3.06 4.47 4.93 7.65 5.16z"
                  />
                </svg>
              ) : (
                <img
                  src={logoSrc}
                  alt="Logo"
                  className="theme-logo h-10 w-10 md:h-12 md:w-12 object-contain theme-logo-glow"
                />
              )}
              <div className="page-line-vertical"></div>
              <h2 className="font-semibold text-(--accent) text-lg md:text-xl tracking-tight">
                {`<_fiicoder>`}
              </h2>
            </Link>

            {/* left area: search (desktop) */}
            <div className="hidden xl:flex items-center">
              <div className="w-64">
                <SearchInput
                  value={navSearch}
                  onChange={setNavSearch}
                  placeholder={
                    lang === "RO" ? "Caută problemă..." : "Search problem..."
                  }
                  suggestions={navSuggestions}
                  onEnter={handleNavSearchEnter}
                  onSelectSuggestion={(s) => navigate(`/problems/${s}`)}
                />
              </div>
            </div>
          </div>

          {/* desktop navigation — collapses at 1400 px to avoid logo overlap */}
          <div className="hidden xl:flex gap-3 items-center flex-nowrap whitespace-nowrap">
            <Link to="/problems" className={getNavLinkClass("/problems")}>
              {t.archiveBtn}
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/classes" className={getNavLinkClass("/classes")}>
                  {lang === "RO" ? "Clase" : "Classes"}
                </Link>
                {(isAdmin || isProfessor) && (
                  <Link to="/propose" className={getNavLinkClass("/propose")}>
                    {lang === "RO" ? "Propune" : "Propose"}
                  </Link>
                )}
              </>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={`${getNavLinkClass("/profile")} min-w-0`}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white uppercase bg-(--accent) shadow-sm shadow-(--accent)/20">
                    {username?.charAt(0) || "?"}
                  </div>
                  <span className="text-sm font-bold text-(--text) max-w-25 truncate">
                    {username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--status-error) 50%, transparent)",
                    color: "var(--status-error)",
                    backgroundColor:
                      "color-mix(in srgb, var(--status-error) 10%, transparent)",
                  }}
                  className="px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 hover:bg-black/5 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  {t.disconnectBtn}
                </button>
              </>
            ) : (
              <Link to="/login" className={getNavLinkClass("/login")}>
                {t.loginBtn}
              </Link>
            )}

            {/* lang toggle desktop */}
            <div className="relative flex items-center bg-(--surface-input) border-2 border-(--accent)/50 rounded-full p-1 h-9.5 w-24 overflow-hidden whitespace-nowrap">
              <div
                className={`absolute top-1 bottom-1 w-10 bg-(--accent)/40 border border-(--accent)/60 rounded-full transition-all duration-300 ease-out ${
                  lang === "RO" ? "left-1" : "left-11.5"
                }`}
              />
              <button
                onClick={() => setLang("RO")}
                className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-300 ${
                  lang === "RO" ? "text-(--text-h)" : "text-(--text-muted)"
                }`}
              >
                RO
              </button>
              <button
                onClick={() => setLang("EN")}
                className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-300 ${
                  lang === "EN" ? "text-(--text-h)" : "text-(--text-muted)"
                }`}
              >
                EN
              </button>
            </div>

            <div className="page-line-vertical"></div>

            {/* theme toggle — trigger only; the panel is rendered
                            as a sibling of the pill below to avoid clipping */}
            <div ref={themeButtonRef}>
              <button
                onClick={() => setIsThemeOpen((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border-2 border-(--accent)/40 text-(--text-h) bg-(--accent)/10 transition-all duration-200 hover:bg-(--accent)/20 whitespace-nowrap"
              >
                {lang === "RO" ? "Temă:" : "Theme:"} {formatThemeLabel(theme)}
                <motion.span animate={{ rotate: isThemeOpen ? 180 : 0 }}>
                  ▼
                </motion.span>
              </button>
            </div>
          </div>

          {/* mobile hamburger */}
          <button
            className="xl:hidden p-2 text-(--text) hover:text-(--text-h) focus:outline-none"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        <AnimatePresence>
          {isThemeOpen && (
            <motion.div
              ref={themePanelRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="hidden xl:block absolute right-5 top-full mt-3 w-40 bg-(--surface-dropdown) border border-(--accent)/40 rounded-2xl shadow-xl overflow-hidden z-50"
            >
              {themes.map((themeName) => (
                <div
                  key={themeName}
                  className="flex flex-col border-b border-(--accent)/10 last:border-none"
                >
                  <button
                    onClick={() => {
                      setTheme(themeName);
                      if (themeName !== "custom") {
                        setIsThemeOpen(false);
                      }
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      theme === themeName
                        ? "text-(--text-h) bg-(--accent)/20 font-bold"
                        : "text-(--text-muted) hover:bg-(--accent)/10 hover:text-(--text-h)"
                    }`}
                  >
                    {formatThemeLabel(themeName)}
                  </button>

                  {themeName === "custom" && theme === "custom" && (
                    <div className="px-4 py-3 flex flex-col gap-3 bg-black/10 border-t border-(--accent)/20">
                      <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                        <input
                          type="color"
                          value={customColors.bg}
                          onChange={(event) =>
                            setCustomColors(
                              event.target.value,
                              customColors.accent,
                            )
                          }
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                        />
                        <span>{lang === "RO" ? "Fundal" : "Background"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                        <input
                          type="color"
                          value={customColors.accent}
                          onChange={(event) =>
                            setCustomColors(customColors.bg, event.target.value)
                          }
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                        />
                        <span>Accent</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/*  Mobile dropdown */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="xl:hidden absolute top-full left-0 right-0 mt-6 p-6 bg-(--surface-card) backdrop-blur-xl border-2 border-(--accent) rounded-3xl flex flex-col gap-4"
            >
              <Link
                to="/problems"
                onClick={closeMenu}
                className={getNavLinkClass("/problems") + " text-center"}
              >
                {t.archiveBtn}
              </Link>

              {isAuthenticated && (
                <Link
                  to="/classes"
                  onClick={closeMenu}
                  className={getNavLinkClass("/classes") + " text-center"}
                >
                  {lang === "RO" ? "Clase" : "Classes"}
                </Link>
              )}

              {isAuthenticated && (isAdmin || isProfessor) && (
                <Link
                  to="/propose"
                  onClick={closeMenu}
                  className={getNavLinkClass("/propose") + " text-center"}
                >
                  {lang === "RO" ? "Propune o Problemă" : "Propose Problem"}
                </Link>
              )}

              <div className="w-full h-1 bg-linear-to-r from-transparent via-(--accent)/50 blur-[5px]" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className={getNavLinkClass("/profile") + " text-center"}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-sm font-black text-white uppercase bg-(--accent) shadow-md shadow-(--accent)/20">
                      {username?.charAt(0) || "?"}
                    </div>
                    <span className="text-base font-medium text-(--text) truncate">
                      {username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--status-error) 50%, transparent)",
                      color: "var(--status-error)",
                      backgroundColor:
                        "color-mix(in srgb, var(--status-error) 10%, transparent)",
                    }}
                    className={getNavLinkClass("/logout") + " text-center"}
                  >
                    {t.disconnectBtn}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={getNavLinkClass("/login") + " text-center"}
                >
                  {t.loginBtn}
                </Link>
              )}

              <div className="w-full h-1 bg-linear-to-r from-transparent via-(--accent)/50 blur-[5px]" />

              {/* lang toggle mobile */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                  {lang === "RO" ? "Limbă" : "Language"}
                </span>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setLang("RO");
                      closeMenu();
                    }}
                    className={`px-6 py-2 rounded-full text-sm font-bold border-2 transition-colors ${lang === "RO" ? "border-(--accent) text-(--text-h) bg-(--accent)/20" : "border-(--accent)/20 text-(--text-muted)"}`}
                  >
                    RO
                  </button>
                  <button
                    onClick={() => {
                      setLang("EN");
                      closeMenu();
                    }}
                    className={`px-6 py-2 rounded-full text-sm font-bold border-2 transition-colors ${lang === "EN" ? "border-(--accent) text-(--text-h) bg-(--accent)/20" : "border-(--accent)/20 text-(--text-muted)"}`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* theme toggle mobile */}
              <div className="relative w-full" ref={mobileThemeDropdownRef}>
                <button
                  onClick={() => setIsMobileThemeOpen(!isMobileThemeOpen)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border-2 border-(--accent)/40 text-(--text-h) bg-(--accent)/10 transition-all duration-200 hover:bg-(--accent)/20"
                >
                  {lang === "RO" ? "Temă:" : "Theme:"} {formatThemeLabel(theme)}
                  <motion.span
                    animate={{ rotate: isMobileThemeOpen ? 180 : 0 }}
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isMobileThemeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-(--surface-dropdown) border border-(--accent)/40 rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      {themes.map((themeName) => (
                        <div
                          key={themeName}
                          className="flex flex-col border-b border-(--accent)/10 last:border-none"
                        >
                          <button
                            onClick={() => {
                              setTheme(themeName);
                              if (themeName !== "custom") {
                                setIsMobileThemeOpen(false);
                              }
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                              theme === themeName
                                ? "text-(--text-h) bg-(--accent)/20 font-bold"
                                : "text-(--text-muted) hover:bg-(--accent)/10 hover:text-(--text-h)"
                            }`}
                          >
                            {formatThemeLabel(themeName)}
                          </button>

                          {themeName === "custom" && theme === "custom" && (
                            <div className="px-4 py-3 flex flex-col gap-3 bg-black/15 border-t border-(--accent)/20">
                              <div className="flex items-center gap-2 text-sm text-(--text-muted)">
                                <input
                                  type="color"
                                  value={customColors.bg}
                                  onChange={(event) =>
                                    setCustomColors(
                                      event.target.value,
                                      customColors.accent,
                                    )
                                  }
                                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                                />
                                <span>{lang === "RO" ? "Fundal" : "Background"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-(--text-muted)">
                                <input
                                  type="color"
                                  value={customColors.accent}
                                  onChange={(event) =>
                                    setCustomColors(
                                      customColors.bg,
                                      event.target.value,
                                    )
                                  }
                                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                                />
                                <span>Accent</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
