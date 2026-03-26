import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import ProblemList from "./pages/ProblemList";
  
const pageVariants = {
  initial: { y: "-300px", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit:    { y: "0px", opacity: 0 },
};

const pageTransition = {
  duration: 0.3,
  ease: "easeInOut",
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        className="max-w-6xl mx-auto px-4 py-6"
        style={{ position: "relative" }}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/problems" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/problems" element={<ProblemList />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full text-pink-900 font-sans site-hero">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}