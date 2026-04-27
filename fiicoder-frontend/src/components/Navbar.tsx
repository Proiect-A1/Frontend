import { useState, useRef, useEffect } from "react";
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
  
  // Am extras și setTheme din context
  const { theme, themes, setTheme } = useTheme();
  
  const formatThemeLabel = (themeName: string) =>
    themeName.charAt(0).toUpperCase() + themeName.slice(1);

  // State pentru meniul de telefon
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // State pentru dropdown-ul de teme pe desktop
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  // Ref pentru a putea închide dropdown-ul de teme când dăm click în afara lui
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const logoSrc = theme === "rose" ? "/logo.svg" : "/logo_nord.svg";

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    
    const baseClasses = "px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center gap-2";
    
    return isActive
      ? `${baseClasses} bg-pink-500/25 border-pink-300 text-pink-100`
      : `${baseClasses} bg-transparent border-pink-400/50 text-pink-200 hover:bg-pink-500/15 hover:text-pink-100 hover:-translate-y-0.5`;
  };

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMobileOpen(false);
    setIsThemeOpen(false);
  };

  // Efect pentru a închide dropdown-ul de teme la click pe afară
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase outline-2 outline-offset-1 outline-(--accent)">
                    {username?.charAt(0) || "?"}
                  </div>
                  <span className="text-sm font-bold text-pink-200 max-w-25 truncate">
                    {username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-full text-sm font-bold border-2 border-red-400/50 text-red-300 bg-red-500/10 transition-all duration-200 hover:bg-red-500/20 hover:border-red-400 hover:-translate-y-0.5"
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
                className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-300 ${
                  lang === "RO" ? "text-pink-100" : "text-pink-400/60"
                }`}
              >
                RO
              </button>
              <button
                onClick={() => setLang("EN")}
                className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-300 ${
                  lang === "EN" ? "text-pink-100" : "text-pink-400/60"
                }`}
              >
                EN
              </button>
            </div>
            
            <div className="page-line-vertical"></div>
            
            {/* theme toggle desktop */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border-2 border-pink-400/40 text-pink-100 bg-pink-500/10 transition-all duration-200 hover:bg-pink-500/20"
              >
                {lang === "RO" ? "Temă:" : "Theme:"} {formatThemeLabel(theme)}
                <motion.span animate={{ rotate: isThemeOpen ? 180 : 0 }}>
                  ▼
                </motion.span>
              </button>

              <AnimatePresence>
                {isThemeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-32 theme-surface-dropdown border border-pink-500/40 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    {themes.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          theme === t
                            ? "text-pink-100 bg-pink-500/20 font-bold"
                            : "text-pink-200/70 hover:bg-pink-500/10 hover:text-pink-100"
                        }`}
                      >
                        {formatThemeLabel(t)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase outline-2 outline-offset-1 outline-(--accent)">
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
              <div className="flex flex-col items-center gap-2">
                 <span className="text-xs uppercase tracking-widest text-pink-300/60 font-bold">
                    {lang === "RO" ? "Limbă" : "Language"}
                 </span>
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
              </div>

              {/* theme toggle mobile */}
              <div className="flex flex-col items-center gap-2 mt-2">
                 <span className="text-xs uppercase tracking-widest text-pink-300/60 font-bold">
                    {lang === "RO" ? "Temă" : "Theme"}
                 </span>
                 <div className="flex justify-center gap-4">
                    {themes.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          closeMenu();
                        }}
                        className={`px-6 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                          theme === t 
                            ? "border-pink-400 text-pink-100 bg-pink-500/20" 
                            : "border-pink-500/20 text-pink-300/60 hover:bg-pink-500/10"
                        }`}
                      >
                        {formatThemeLabel(t)}
                      </button>
                    ))}
                 </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}