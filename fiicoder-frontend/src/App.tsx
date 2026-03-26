import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import ProblemList from "./pages/ProblemList";

export default function App() {
  return (
    <BrowserRouter>
      {/* Containerul principal al aplicației. min-h-screen asigură că acoperă tot ecranul */}
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        
        {/* Navbar-ul stă deasupra rutelor, deci va fi vizibil pe absolut orice pagină */}
        <Navbar />

        {/* Aici este zona dinamică unde se schimbă paginile */}
        <main className="max-w-6xl mx-auto">
          <Routes>
            {/* Dacă cineva intră pe "localhost:5173/", îl redirecționăm automat către "/problems" */}
            <Route path="/" element={<Navigate to="/problems" replace />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/problems" element={<ProblemList />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}