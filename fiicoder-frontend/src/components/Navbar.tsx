import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className="
        mx-auto
        bg-[#12101c]/80 backdrop-blur-md
        border border-pink-500/35
        rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.45)]
        px-5 py-2.5
        flex items-center justify-between
      "
      >
        <h2 className="font-semibold text-pink-300 text-xl tracking-tight">
          _fiicoder
        </h2>

        <div className="flex gap-2">
          <Link
            to="/problems"
            className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200
              ${
                location.pathname === "/problems"
                  ? "bg-pink-500/25 border-pink-300 text-pink-100"
                  : "bg-transparent border-pink-400/50 text-pink-200 hover:bg-pink-500/15 hover:text-pink-100 hover:-translate-y-px"
              }`}
          >
            Arhivă Probleme
          </Link>
          <Link
            to="/login"
            className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200
              ${
                location.pathname === "/login"
                  ? "bg-pink-500/25 border-pink-300 text-pink-100"
                  : "bg-transparent border-pink-400/50 text-pink-200 hover:bg-pink-500/15 hover:text-pink-100 hover:-translate-y-px"
              }`}
          >
            Autentificare
          </Link>
        </div>
      </nav>
    </div>
  );
}
