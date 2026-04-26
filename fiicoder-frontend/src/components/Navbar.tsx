import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../services/AuthContext";
import { useTheme } from "../services/ThemeContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const { isAuthenticated, username, logout } = useAuth();
  const { theme, themes, toggleTheme } = useTheme();
  const currentThemeIndex = themes.indexOf(theme);
  const nextTheme = themes[(currentThemeIndex + 1) % themes.length];
  const formatThemeLabel = (themeName: string) =>
    themeName.charAt(0).toUpperCase() + themeName.slice(1);

  // State pentru meniul de telefon
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const logoSrc = theme === "rose" ? "/logo.svg" : "/logo_nord.svg";

const getNavLinkClass = (path: string) => {
  const isActive = location.pathname.startsWith(path);
  
  const baseClasses = "px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 flex items-center justify-center gap-2";
  
  return isActive
    ? `${baseClasses} bg-pink-500/25 border-pink-300 text-pink-100`
    : `${baseClasses} bg-transparent border-pink-400/50 text-pink-200 hover:bg-pink-500/15 hover:text-pink-100 hover:-translate-y-0.5`;
};

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setIsMobileOpen(false);

  return (
    <div className="sticky top-0 z-50 w-full px-4 md:px-6 pt-4">
      <nav className="w-full relative">
        <div className="theme-surface-card backdrop-blur-md border-2 border-pink-500/35 rounded-full px-5 py-2.5 flex items-center justify-between card-glow">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 transition-transform duration-200 hover:scale-105"
          >
            <img
              src={logoSrc}
              alt="Logo"
              className="theme-logo h-10 w-10 md:h-12 md:w-12 object-contain theme-logo-glow"
            />
            <div className="page-line-vertical"></div>
            <h2 className="font-semibold text-pink-300 text-lg md:text-xl tracking-tight">
              {`<_fiicoder>`}
            </h2>
          </Link>

          {/* desktop navigation */}
          <div className="hidden lg:flex gap-3 items-center">
            <Link to="/problems" className={getNavLinkClass("/problems")}>
              {t.archiveBtn}
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/classes" className={getNavLinkClass("/classes")}>
                  {lang === "RO" ? "Clase" : "Classes"}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <>
                <Link to="/profile" className={getNavLinkClass("/profile")}>
                  <div className="w-5 h-5 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {username?.charAt(0) || "?"}
                  </div>
                  <span className="text-sm font-medium text-pink-200 max-w-25 truncate">
                    {username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border-2 border-red-400/50 text-red-300 bg-red-500/10 transition-all duration-200 hover:bg-red-500/20 hover:border-red-400 hover:-translate-y-0.5"
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
            <div className="relative flex items-center theme-surface-input border-2 border-pink-400/50 rounded-full p-1 h-9.5 w-24 overflow-hidden">
              <div
                className={`absolute top-1 bottom-1 w-10 bg-pink-500/40 border border-pink-400/60 rounded-full transition-all duration-300 ease-out ${
                  lang === "RO" ? "left-1" : "left-11.5"
                }`}
              />
              <button
                onClick={() => setLang("RO")}
                className={`relative z-10 flex-1 text-[10px] font-bold transition-colors duration-300 ${
                  lang === "RO" ? "text-pink-100" : "text-pink-400/60"
                }`}
              >
                RO
              </button>
              <button
                onClick={() => setLang("EN")}
                className={`relative z-10 flex-1 text-[10px] font-bold transition-colors duration-300 ${
                  lang === "EN" ? "text-pink-100" : "text-pink-400/60"
                }`}
              >
                EN
              </button>
            </div>
            <div className="page-line-vertical"></div>
            <button
              onClick={toggleTheme}
              className="px-4 py-1.5 rounded-full text-xs font-bold border-2 border-pink-400/40 text-pink-100 bg-pink-500/10 transition-all duration-200 hover:bg-pink-500/20"
              title={`Switch to ${formatThemeLabel(nextTheme)}`}
            >
              {formatThemeLabel(nextTheme)}
            </button>
          </div>

          {/* mobile hamburger menu button */}
          <button
            className="lg:hidden p-2 text-pink-200 hover:text-pink-100 focus:outline-none"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? (
              // X icon
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
              // hamburger menu
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

        {/* dropdown menu for mobile */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-3 p-6 theme-surface-card backdrop-blur-xl border-2 border-pink-500/35 rounded-3xl flex flex-col gap-4 shadow-2xl z-10 lg:hidden"
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

              <div className="w-full h-1 bg-linear-to-r from-transparent via-pink-500/50 blur-[5px]" />

              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-center gap-3 px-3 py-2.5 rounded-2xl border-2 border-pink-400/30 bg-pink-500/10">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {username?.charAt(0) || "?"}
                    </div>
                    <span className="text-base font-medium text-pink-200 truncate">
                      {username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 rounded-2xl text-sm font-bold border-2 border-red-400/50 text-red-300 bg-red-500/10 hover:bg-red-500/20"
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

              <div className="w-full h-1 bg-linear-to-r from-transparent via-pink-500/50 blur-[5px]" />

              {/* lang toggle mobile */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setLang("RO");
                    closeMenu();
                  }}
                  className={`px-6 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${lang === "RO" ? "border-pink-400 text-pink-100 bg-pink-500/20" : "border-pink-500/20 text-pink-300/60"}`}
                >
                  RO
                </button>
                <button
                  onClick={() => {
                    setLang("EN");
                    closeMenu();
                  }}
                  className={`px-6 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${lang === "EN" ? "border-pink-400 text-pink-100 bg-pink-500/20" : "border-pink-500/20 text-pink-300/60"}`}
                >
                  EN
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    toggleTheme();
                    closeMenu();
                  }}
                  className="px-6 py-2 rounded-xl text-sm font-bold border-2 border-pink-400/40 text-pink-100 bg-pink-500/15 hover:bg-pink-500/25 transition-colors"
                >
                  {`Switch to ${formatThemeLabel(nextTheme)}`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
