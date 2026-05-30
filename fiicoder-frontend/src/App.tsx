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
const Leaderboard = lazyWithRetry(() => import("./pages/leaderboard/Leaderboard"));

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-(--accent)/10 border-2 border-(--accent)/30 flex items-center justify-center">
        <span className="text-3xl font-black text-(--accent)/50">404</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-(--text-h) mb-2">Pagina nu există</h1>
        <p className="text-sm text-(--text-muted)">URL-ul acesta nu corespunde niciunei pagini.</p>
      </div>
      <a href="/" className="px-5 py-2 rounded-full border-2 border-(--accent)/50 bg-(--accent)/10 text-sm font-bold text-(--text-h) hover:bg-(--accent)/20 transition-colors">
        Înapoi acasă
      </a>
    </div>
  );
}

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
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/profile/:username" element={<Profile />} />
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
            <Route path="*" element={<NotFound />} />
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
