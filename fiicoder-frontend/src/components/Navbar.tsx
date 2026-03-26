import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <div className="px-4 pt-4">
      <nav
        className="
        mx-auto max-w-6xl
        bg-white/75 backdrop-blur-md
        border border-pink-200
        rounded-full shadow-[0_4px_24px_rgba(236,72,153,0.1)]
        px-5 py-2.5
        flex items-center justify-between
      "
      >
        <h2 className="font-semibold text-pink-600 text-xl tracking-tight">
          _fiicoder
        </h2>

        <div className="flex gap-2">
          <Link
            to="/problems"
            className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200
              ${
                location.pathname === "/problems"
                  ? "bg-pink-200 border-pink-400 text-pink-800"
                  : "bg-transparent border-pink-300 text-pink-700 hover:bg-pink-100 hover:-translate-y-px"
              }`}
          >
            Arhivă Probleme
          </Link>
          <Link
            to="/login"
            className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200
              ${
                location.pathname === "/login"
                  ? "bg-pink-200 border-pink-400 text-pink-800"
                  : "bg-transparent border-pink-300 text-pink-700 hover:bg-pink-100 hover:-translate-y-px"
              }`}
          >
            Autentificare
          </Link>
        </div>
      </nav>
    </div>
  );
}
