import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import ProblemList from "./pages/ProblemList";
import ProblemDetails from "./pages/ProblemDetails";
  
const pageVariants = {
  initial: { 
    y: -60,         
    opacity: 0, 
    scale: 0.97     
  },
  animate: { 
    y: 0,            
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      type: "spring",    
      stiffness: 260,   
      damping: 20,      
      mass: 1 
    } 
  },
  exit: { 
    y: 30,           
    opacity: 0, 
    scale: 0.95,
    transition: { 
      duration: 0.2, 
      ease: "easeIn" 
    } 
  },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        className="max-w-6xl mx-auto px-4 pt-24 pb-6"
        style={{ position: "relative" }}
        
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={
            <Navigate to="/login" replace />
            } 
          />
          <Route path="/login" element={
            <Login />
            } 
          />
          <Route path="/problems" element={
            <ProblemList />
            } 
          />
          <Route path="/problems/:problemId" element={
            <ProblemDetails />
            } 
          />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full text-pink-100 font-sans site-hero">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}