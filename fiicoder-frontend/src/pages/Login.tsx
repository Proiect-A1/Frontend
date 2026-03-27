import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    navigate("/problems");
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow">
      <h1 className="text-3xl font-bold text-pink-200 mb-2">
        {isLogin ? "Autentificare" : "Înregistrare"}
      </h1>
      <div className="page-line" />
      
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-1">
            Email sau Nume utilizator
          </label>
          <input 
            type="text" 
            required 
            placeholder="ex: fiicoder"
            className="w-full rounded-lg border-2 border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-1">
            Parolă
          </label>
          <input 
            type="password" 
            required 
            placeholder="••••••••"
            className="w-full rounded-lg border-2 border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
        
        <button 
          type="submit"
          className="mt-4 w-full rounded-lg border-2 border-pink-400/50 bg-pink-500/20 px-4 py-2.5 text-sm font-bold text-pink-100 transition hover:bg-pink-500/30 hover:-translate-y-0.5"
        >
          {isLogin ? "Intră în cont" : "Creează cont"}
        </button>
      </form>

      {/* Link de comutare intre login si register */}
      <div className="mt-6 text-center text-sm text-pink-200/70">
        {isLogin ? "Nu ai un cont? " : "Ai deja un cont? "}
        <button 
          type="button" 
          onClick={() => setIsLogin(!isLogin)}
          className="font-semibold text-pink-300 underline underline-offset-4 hover:text-pink-100 transition-colors"
        >
          {isLogin ? "Înregistrează-te" : "Autentifică-te"}
        </button>
      </div>
    </div>
  );
}