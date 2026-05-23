import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Suspense } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { pageVariants } from "./utils/motionConfig";
import { lazyWithRetry } from "./utils/lazyWithRetry";

// Lazy load pages - se vor încărca doar când e nevoie. Folosim lazyWithRetry
// ca sa supravietuim la chunk-uri esuate dupa un deploy nou.
const Landing = lazyWithRetry(() => import("./pages/landing/Landing"));
const Login = lazyWithRetry(() => import("./pages/login/Login"));
const ProblemList = lazyWithRetry(() => import("./pages/problemList/ProblemList"));
const ProblemDetails = lazyWithRetry(() => import("./pages/problemDetails/ProblemDetails"));
const ClassesHub = lazyWithRetry(() => import("./pages/classesHub/ClassesHub"));
const ClassDetails = lazyWithRetry(() => import("./pages/classDetails/ClassDetails"));
const Profile = lazyWithRetry(() => import("./pages/profile/Profile"));
const AdminPanel = lazyWithRetry(() => import("./pages/adminPanel/AdminPanel"));
const ProposeProblem = lazyWithRetry(() => import("./pages/proposeProblem/ProposeProblem"));

// Loading component for Suspense fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-(--text-muted)">Loading...</div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        className="w-full px-4 md:px-6 pt-6 pb-4 md:pb-6 xl:flex-1 xl:min-h-0 xl:py-6 xl:flex xl:flex-col"
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
            <Route path="/problems/:problemTitle" element={<ProblemDetails />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/propose"
              element={
                <ProtectedRoute requireStaff>
                  <ProposeProblem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/propose/:proposalId"
              element={
                <ProtectedRoute requireStaff>
                  <ProposeProblem />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPanel />
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
      <div className="flex-1 flex flex-col xl:overflow-hidden text-(--text) font-sans custom-scrollbar">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
