import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { profileService } from '../services/profileService';

interface JwtPayload {
  sub: string;
  role: string;
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

interface AuthContextType {
  token: string | null;
  username: string | null;
  userId: string | null;
  isAdmin: boolean;
  isProfessor: boolean;
  isAuthenticated: boolean;
  login: (token: string, username?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  userId: null,
  isAdmin: false,
  isProfessor: false,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const TOKEN_KEY = 'fiicoder_jwt';
const USERNAME_KEY = 'fiicoder_username';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored && !isTokenExpired(stored)) return stored;
    localStorage.removeItem(TOKEN_KEY);
    return null;
  });

  const [storedUsername, setStoredUsername] = useState<string | null>(() => {
    return localStorage.getItem(USERNAME_KEY);
  });

  const payload = token ? decodeJwt(token) : null;
  const userId = payload?.sub ?? null;
  const isAdmin = payload?.role === 'ADMIN';
  const isProfessor = payload?.role === 'PROFESSOR';
  const isAuthenticated = token !== null && !isTokenExpired(token);

  useEffect(() => {
    if (!token || isTokenExpired(token)) return;

    profileService.getMyProfile()
      .then((profile) => {
        setStoredUsername(profile.username);
        localStorage.setItem(USERNAME_KEY, profile.username);
      })
      .catch(() => {
      });
  }, [token]);

  const login = useCallback((newToken: string, username?: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    if (username) {
      localStorage.setItem(USERNAME_KEY, username);
      setStoredUsername(username);
    }
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setStoredUsername(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        username: storedUsername,
        userId,
        isAdmin,
        isProfessor,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}