import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ProblemList from "./pages/ProblemList";
import ProblemDetails from "./pages/ProblemDetails";

const pageVariants: Variants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
<motion.main
        key={location.pathname}
        className="w-full px-6 pt-6 pb-6" 
        style={{ position: "relative" }}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problems/:problemId" element={<ProblemDetails />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-full text-pink-100 font-sans site-hero overflow-y-auto xl:overflow-hidden custom-scrollbar">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}