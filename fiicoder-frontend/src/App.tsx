import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { pageVariants } from "./utils/motionConfig";

// Lazy load pages - se vor încărca doar când e nevoie
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const ProblemList = lazy(() => import("./pages/ProblemList"));
const ProblemDetails = lazy(() => import("./pages/ProblemDetails"));
const ClassesHub = lazy(() => import("./pages/ClassesHub"));
const ClassDetails = lazy(() => import("./pages/ClassDetails"));

// Loading component for Suspense fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-pink-300">Loading...</div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        className="w-full flex-1 min-h-0 px-6 pt-6 pb-6 overflow-hidden"
        style={{ position: "relative" }}
        variants={pageVariants as Variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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