import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-pink-100 p-4 shadow-sm flex items-center justify-between">
      {/* Logo-ul platformei */}
      <h2 className="font-bold text-pink-600 text-2xl tracking-tight">fiicoder</h2>
      
      {/* Link-urile de navigare */}
      <div className="flex gap-6 font-medium text-gray-700">
        <Link to="/problems" className="hover:text-pink-600 transition-colors">
          Arhivă Probleme
        </Link>
        <Link to="/login" className="hover:text-pink-600 transition-colors">
          Autentificare
        </Link>
      </div>
    </nav>
  );
}