import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// forma unui JWT
interface JwtPayload {
  sub: string;       // userId-ul (UUID) venit de la backend în 'sub'
  role: string;      
  iat: number;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Decodăm partea de payload a JWT-ului
    const payload = JSON.parse(atob(parts[1]));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  // payload.exp este în secunde, Date.now() e în milisecunde
  return Date.now() >= payload.exp * 1000;
}

interface AuthContextType {
  token: string | null;
  username: string | null;
  userId: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (token: string, username?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  userId: null,
  isAdmin: false,
  isAuthenticated: false,
  login: () => { },
  logout: () => { },
});

const TOKEN_KEY = 'fiicoder_jwt';
const USERNAME_KEY = 'fiicoder_username';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored && !isTokenExpired(stored)) return stored;
    // curat token-ul expirat la init
    localStorage.removeItem(TOKEN_KEY);
    return null;
  });
  const [storedUsername, setStoredUsername] = useState<string | null>(() => {
    return localStorage.getItem(USERNAME_KEY);
  });

  const payload = token ? decodeJwt(token) : null;
  
  // scot valorile din payload
  const userId = payload?.sub ?? null;
  const username = storedUsername;
  const isAdmin = payload?.role === 'ADMIN'; 
  const isAuthenticated = token !== null && !isTokenExpired(token);

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

  // check if token is expired every 60s (might remove later)
  useEffect(() => {
    const id = setInterval(() => {
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, username, userId, isAdmin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}