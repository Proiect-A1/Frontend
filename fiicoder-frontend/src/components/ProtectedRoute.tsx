import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireStaff?: boolean;
}

/**
 * Wraps a route so that unauthenticated users are redirected to /login.
 */
export default function ProtectedRoute({ children, requireStaff = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isProfessor } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireStaff && !isAdmin && !isProfessor) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
