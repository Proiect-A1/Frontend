import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage, translations } from "../language/Language"; 
import { useAuth } from "../services/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const { isAuthenticated, username, logout } = useAuth();

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    const baseClasses =
      "px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200";
    return isActive
      ? `${baseClasses} bg-pink-500/25 border-pink-300 text-pink-100`
      : `${baseClasses} bg-transparent border-pink-400/50 text-pink-200 hover:bg-pink-500/15 hover:text-pink-100 hover:-translate-y-1`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-6 pt-4">
      <nav className="w-full">
        <div className="bg-[#12101c]/80 backdrop-blur-md border-2 border-pink-500/35 rounded-full px-5 py-2.5 flex items-center justify-between card-glow">
          <Link
            to="/"
            className="flex items-center gap-3 transition-transform duration-200 hover:scale-105"
          >
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-12 w-12 object-contain drop-shadow-[0_0_8px_rgba(255,94,182,0.6)]"
            />
            <div className="page-line-vertical"></div>
            <h2 className="font-semibold text-pink-300 text-xl tracking-tight">
              {`<_fiicoder>`}
            </h2>
          </Link>

          <div className="flex gap-3 items-center">
            <Link to="/problems" className={getNavLinkClass("/problems")}>
              {t.archiveBtn}
            </Link>

            <div className="page-line-vertical"></div>

            {isAuthenticated ? (
              /* ── Authenticated state: show username + logout ── */
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-pink-400/30 bg-pink-500/10">
                  {/* User avatar circle */}
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {username?.charAt(0) || "?"}
                  </div>
                  <span className="text-sm font-medium text-pink-200 max-w-25 truncate">
                    {username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border-2 border-red-400/50 text-red-300 bg-red-500/10 transition-all duration-200 hover:bg-red-500/20 hover:border-red-400 hover:-translate-y-0.5"
                >
                  {t.disconnectBtn}
                </button>
              </>
            ) : (
              /* ── Unauthenticated state: show login link ── */
              <Link to="/login" className={getNavLinkClass("/login")}>
                {t.loginBtn}
              </Link>
            )}

            <div className="page-line-vertical"></div>

            <div className="relative flex items-center bg-[#0f0c18] border-2 border-pink-400/50 rounded-full p-1 h-9.5 w-24 overflow-hidden">
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
          </div>
        </div>
      </nav>
    </div>
  );
}