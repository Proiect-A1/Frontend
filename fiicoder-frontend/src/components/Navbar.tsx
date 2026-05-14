import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, translations } from '../language/Language';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const { lang, setLang } = useLanguage();
    const t = translations[lang];
    const { isAuthenticated, username, isAdmin, isProfessor, logout } = useAuth();

    // Am extras și setTheme din context
    const { theme, themes, setTheme } = useTheme();

    const formatThemeLabel = (themeName: string) =>
        themeName.charAt(0).toUpperCase() + themeName.slice(1);

    // State pentru meniul de telefon
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    // State pentru dropdown-ul de teme pe desktop
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    // State pentru dropdown-ul de teme pe mobil
    const [isMobileThemeOpen, setIsMobileThemeOpen] = useState(false);
    // Ref pentru a putea închide dropdown-ul de teme când dăm click în afara lui
    const themeDropdownRef = useRef<HTMLDivElement>(null);
    const mobileThemeDropdownRef = useRef<HTMLDivElement>(null);

    const themeLogo: Record<string, string> = {
        rose: '/logo.svg',
        nord: '/logo_nord.svg',
        cream: '/logo_cream.svg',
        sage: '/logo_sage.svg',
    };
    const logoSrc = themeLogo[theme] || '/logo.svg';

    // State to force mobile layout below a simple width threshold
    const [forceMobile, setForceMobile] = useState(false);

    const getNavLinkClass = (path: string) => {
        const isActive = location.pathname.startsWith(path);

        const baseClasses =
            'px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0';

        return isActive
            ? `${baseClasses} bg-(--accent)/25 border-(--accent) text-(--text-h)`
            : `${baseClasses} bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5`;
    };

    const handleLogout = () => {
        logout();
        setIsMobileOpen(false);
        navigate('/login');
    };

    const closeMenu = () => {
        setIsMobileOpen(false);
        setIsThemeOpen(false);
        setIsMobileThemeOpen(false);
    };

    // Efect pentru a închide dropdown-urile de teme la click pe afară
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                themeDropdownRef.current &&
                !themeDropdownRef.current.contains(event.target as Node)
            ) {
                setIsThemeOpen(false);
            }
            if (
                mobileThemeDropdownRef.current &&
                !mobileThemeDropdownRef.current.contains(event.target as Node)
            ) {
                setIsMobileThemeOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Simple collapse: switch to mobile layout when window width is below threshold
    useEffect(() => {
        const COLLAPSE_AT = 1180; // px, adjust as needed
        const onResize = () => setForceMobile(window.innerWidth < COLLAPSE_AT);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div className="sticky top-0 z-50 w-full px-4 md:px-6 pt-4">
            <nav className="w-full relative">
                <div className="bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-full px-5 py-2.5 flex items-center justify-between">
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
                        <h2 className="font-semibold text-(--accent) text-lg md:text-xl tracking-tight">
                            {`<_fiicoder>`}
                        </h2>
                    </Link>

                    {/* desktop navigation */}
                    <div
                        className={`${forceMobile ? 'hidden' : 'hidden lg:flex'} gap-3 items-center flex-nowrap whitespace-nowrap`}
                    >
                        <Link to="/problems" className={getNavLinkClass('/problems')}>
                            {t.archiveBtn}
                        </Link>

                        {isAuthenticated && (
                            <>
                                <Link to="/classes" className={getNavLinkClass('/classes')}>
                                    {lang === 'RO' ? 'Clase' : 'Classes'}
                                </Link>
                                {(isAdmin || isProfessor) && (
                                    <Link to="/propose" className={getNavLinkClass('/propose')}>
                                        {lang === 'RO' ? 'Propune' : 'Propose'}
                                    </Link>
                                )}
                            </>
                        )}

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className={`${getNavLinkClass('/profile')} min-w-0`}
                                >
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white uppercase bg-(--accent) shadow-sm shadow-(--accent)/20">
                                        {username?.charAt(0) || '?'}
                                    </div>
                                    <span className="text-sm font-bold text-(--text) max-w-25 truncate">
                                        {username}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        borderColor:
                                            'color-mix(in srgb, var(--status-error) 50%, transparent)',
                                        color: 'var(--status-error)',
                                        backgroundColor:
                                            'color-mix(in srgb, var(--status-error) 10%, transparent)',
                                    }}
                                    className="px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 hover:bg-black/5 hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                    {t.disconnectBtn}
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className={getNavLinkClass('/login')}>
                                {t.loginBtn}
                            </Link>
                        )}

                        {/* lang toggle desktop */}
                        <div className="relative flex items-center bg-(--surface-input) border-2 border-(--accent)/50 rounded-full p-1 h-9.5 w-24 overflow-hidden whitespace-nowrap">
                            <div
                                className={`absolute top-1 bottom-1 w-10 bg-(--accent)/40 border border-(--accent)/60 rounded-full transition-all duration-300 ease-out ${
                                    lang === 'RO' ? 'left-1' : 'left-11.5'
                                }`}
                            />
                            <button
                                onClick={() => setLang('RO')}
                                className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-300 ${
                                    lang === 'RO' ? 'text-(--text-h)' : 'text-(--text-muted)'
                                }`}
                            >
                                RO
                            </button>
                            <button
                                onClick={() => setLang('EN')}
                                className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-300 ${
                                    lang === 'EN' ? 'text-(--text-h)' : 'text-(--text-muted)'
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
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border-2 border-(--accent)/40 text-(--text-h) bg-(--accent)/10 transition-all duration-200 hover:bg-(--accent)/20 whitespace-nowrap"
                            >
                                {lang === 'RO' ? 'Temă:' : 'Theme:'} {formatThemeLabel(theme)}
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
                                        className="absolute right-0 top-full mt-3 w-32 bg-(--surface-dropdown) border border-(--accent)/40 rounded-2xl shadow-xl overflow-hidden z-50"
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
                                                        ? 'text-(--text-h) bg-(--accent)/20 font-bold'
                                                        : 'text-(--text-muted) hover:bg-(--accent)/10 hover:text-(--text-h)'
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
                        className={`${forceMobile ? '' : 'lg:hidden'} p-2 text-(--text) hover:text-(--text-h) focus:outline-none`}
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
                            className="absolute top-full left-0 right-0 mt-3 p-6 bg-(--surface-card) backdrop-blur-xl border-2 border-(--accent) rounded-xl flex flex-col gap-4 shadow-2xl z-10 lg:hidden"
                        >
                            <Link
                                to="/problems"
                                onClick={closeMenu}
                                className={getNavLinkClass('/problems') + ' text-center'}
                            >
                                {t.archiveBtn}
                            </Link>

                            {isAuthenticated && (
                                <Link
                                    to="/classes"
                                    onClick={closeMenu}
                                    className={getNavLinkClass('/classes') + ' text-center'}
                                >
                                    {lang === 'RO' ? 'Clase' : 'Classes'}
                                </Link>
                            )}

                            {isAuthenticated && (isAdmin || isProfessor) && (
                                <Link
                                    to="/propose"
                                    onClick={closeMenu}
                                    className={getNavLinkClass('/propose') + ' text-center'}
                                >
                                    {lang === 'RO' ? 'Propune o Problemă' : 'Propose Problem'}
                                </Link>
                            )}

                            <div className="w-full h-1 bg-linear-to-r from-transparent via-(--accent)/50 blur-[5px]" />

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/profile"
                                        onClick={closeMenu}
                                        className="flex items-center justify-center gap-3 px-3 py-2.5 rounded-2xl border-2 border-(--accent)/30 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white uppercase bg-(--accent) shadow-md shadow-(--accent)/20">
                                            {username?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-base font-medium text-(--text) truncate">
                                            {username}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            borderColor:
                                                'color-mix(in srgb, var(--status-error) 50%, transparent)',
                                            color: 'var(--status-error)',
                                            backgroundColor:
                                                'color-mix(in srgb, var(--status-error) 10%, transparent)',
                                        }}
                                        className="px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all duration-200 hover:bg-black/5"
                                    >
                                        {t.disconnectBtn}
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={closeMenu}
                                    className={getNavLinkClass('/login') + ' text-center'}
                                >
                                    {t.loginBtn}
                                </Link>
                            )}

                            <div className="w-full h-1 bg-linear-to-r from-transparent via-(--accent)/50 blur-[5px]" />

                            {/* lang toggle mobile */}
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                                    {lang === 'RO' ? 'Limbă' : 'Language'}
                                </span>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            setLang('RO');
                                            closeMenu();
                                        }}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${lang === 'RO' ? 'border-(--accent) text-(--text-h) bg-(--accent)/20' : 'border-(--accent)/20 text-(--text-muted)'}`}
                                    >
                                        RO
                                    </button>
                                    <button
                                        onClick={() => {
                                            setLang('EN');
                                            closeMenu();
                                        }}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${lang === 'EN' ? 'border-(--accent) text-(--text-h) bg-(--accent)/20' : 'border-(--accent)/20 text-(--text-muted)'}`}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>

                            {/* theme toggle mobile */}
                            <div className="relative w-full" ref={mobileThemeDropdownRef}>
                                <button
                                    onClick={() => setIsMobileThemeOpen(!isMobileThemeOpen)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 border-(--accent)/40 text-(--text-h) bg-(--accent)/10 transition-all duration-200 hover:bg-(--accent)/20"
                                >
                                    {lang === 'RO' ? 'Temă:' : 'Theme:'} {formatThemeLabel(theme)}
                                    <motion.span animate={{ rotate: isMobileThemeOpen ? 180 : 0 }}>
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
                                            {themes.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => {
                                                        setTheme(t);
                                                        setIsMobileThemeOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                                        theme === t
                                                            ? 'text-(--text-h) bg-(--accent)/20 font-bold'
                                                            : 'text-(--text-muted) hover:bg-(--accent)/10 hover:text-(--text-h)'
                                                    }`}
                                                >
                                                    {formatThemeLabel(t)}
                                                </button>
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
