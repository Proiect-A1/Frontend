import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireStaff?: boolean;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireStaff = false, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isProfessor } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireStaff && !isAdmin && !isProfessor) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
