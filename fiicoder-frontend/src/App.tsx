import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import ProblemList from "./pages/ProblemList";
import ProblemDetails from "./pages/ProblemDetails";
  
const pageVariants: Variants = {
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
      type: "spring", 
      stiffness: 200,  
      damping: 20, 
      duration: 0.3,    
      ease: "easeIn"   
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
        className="max-w-6xl mx-auto px-4 pt-28 pb-6"
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
      <div className="h-screen w-full text-pink-100 font-sans site-hero overflow-hidden">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}