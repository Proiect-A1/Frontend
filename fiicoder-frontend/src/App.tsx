import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ProblemList from "./pages/ProblemList";
import ProblemDetails from "./pages/ProblemDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import ClassesHub from "./pages/ClassesHub";
import ClassDetails from "./pages/ClassDetails";

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
        className="w-full flex-1 min-h-0 px-6 pt-6 pb-6 overflow-hidden"
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
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassesHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:groupId"
            element={
              <ProtectedRoute>
                <ClassDetails />
              </ProtectedRoute>
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
      <div className="h-screen w-full flex flex-col overflow-hidden text-pink-100 font-sans site-hero custom-scrollbar">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}