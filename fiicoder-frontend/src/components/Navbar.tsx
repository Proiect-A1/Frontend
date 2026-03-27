import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    const baseClasses = "px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200";
    
    return isActive
      ? `${baseClasses} bg-pink-500/25 border-pink-300 text-pink-100`
      : `${baseClasses} bg-transparent border-pink-400/50 text-pink-200 hover:bg-pink-500/15 hover:text-pink-100 hover:-translate-y-1`;
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto bg-[#12101c]/80 backdrop-blur-md border-2 border-pink-500/35 rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.45)] px-5 py-2.5 flex items-center justify-between">
        <h2 className="font-semibold text-pink-300 text-xl tracking-tight">
          {`<_fiicoder`}
        </h2>
        <div className="flex gap-2">
          <Link to="/problems" className={getNavLinkClass("/problems")}>
            Arhivă Probleme
          </Link>
          <Link to="/login" className={getNavLinkClass("/login")}>
            Autentificare
          </Link>
        </div>
      </nav>
    </div>
  );
}