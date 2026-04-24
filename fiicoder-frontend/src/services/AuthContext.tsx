import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// Helpers to decode a JWT payload

interface JwtPayload {
  sub: string;       // username
  iat: number;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}

// Context structure

interface AuthContextType {
  token: string | null;
  username: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  userId: null,
  isAuthenticated: false,
  login: () => { },
  logout: () => { },
});

// Local-storage key

const TOKEN_KEY = 'fiicoder_jwt';

// Provider

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored && !isTokenExpired(stored)) return stored;
    // Clean up stale token
    localStorage.removeItem(TOKEN_KEY);
    return null;
  });

  const username = token ? (decodeJwt(token)?.sub ?? null) : null;
  const userId = token ? (decodeJwt(token)?.sub ?? null) : null;
  const isAuthenticated = token !== null;

  const login = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  // Periodically check for token expiry (every 60s)
  useEffect(() => {
    const id = setInterval(() => {
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, username, userId, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook

export function useAuth() {
  return useContext(AuthContext);
}
