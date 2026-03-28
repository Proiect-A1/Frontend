import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../language/LanguageUsed"; 

export default function Navbar() {
  const location = useLocation();
  
  const { lang, setLang } = useLanguage();

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    const baseClasses =
      "px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200";
    return isActive
      ? `${baseClasses} bg-pink-500/25 border-pink-300 text-pink-100`
      : `${baseClasses} bg-transparent border-pink-400/50 text-pink-200 hover:bg-pink-500/15 hover:text-pink-100 hover:-translate-y-1`;
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-6 pt-4">
      <nav className="w-full">
        <div className="bg-[#12101c]/80 backdrop-blur-md border-2 border-pink-500/35 rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.45)] px-5 py-2.5 flex items-center justify-between card-glow">
          <h2 className="font-semibold text-pink-300 text-xl tracking-tight">
            {`<_fiicoder>`}
          </h2>
          
          <div className="flex gap-3 items-center">
            <Link to="/problems" className={getNavLinkClass("/problems")}>
              {lang === "RO" ? "Arhivă Probleme" : "Problem Archive"}
            </Link>
            
            <Link to="/login" className={getNavLinkClass("/login")}>
              {lang === "RO" ? "Autentificare" : "Authentication"}
            </Link>

            <div className="relative flex items-center bg-[#0f0c18] border-2 border-pink-400/50 rounded-full p-1 h-9.5 w-24 overflow-hidden">
              <div
                className={`absolute top-1 bottom-1 w-10 bg-pink-500/40 border border-pink-400/60 rounded-full transition-all duration-300 ease-out ${
                   // Indicatorul se va mișca acum bazat pe starea GLOBALĂ
                   lang === "RO" ? "left-1" : "left-11.5"
                }`}
              />
              <button
                onClick={() => setLang("RO")} // Schimbă global în RO
                className={`relative z-10 flex-1 text-[10px] font-bold transition-colors duration-300 ${
                  lang === "RO" ? "text-pink-100" : "text-pink-400/60"
                }`}
              >
                RO
              </button>
              <button
                onClick={() => setLang("EN")} // Schimbă global în EN
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