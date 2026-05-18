import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { profileService } from '../services/profileService';
import { getGravatarUrl, getDiceBearUrl } from '../utils/gravatar';

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
  gravatarUrl: string | null;
  dicebearUrl: string | null;
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
  gravatarUrl: null,
  dicebearUrl: null,
  isAdmin: false,
  isProfessor: false,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const TOKEN_KEY = 'fiicoder_jwt';
const USERNAME_KEY = 'fiicoder_username';
const GRAVATAR_KEY = 'fiicoder_gravatar';
const DICEBEAR_KEY = 'fiicoder_dicebear';

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

  const [gravatarUrl, setGravatarUrl] = useState<string | null>(() => {
    return localStorage.getItem(GRAVATAR_KEY);
  });

  const [dicebearUrl, setDicebearUrl] = useState<string | null>(() => {
    return localStorage.getItem(DICEBEAR_KEY);
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
        const gravatar = getGravatarUrl(profile.email);
        const dicebear = getDiceBearUrl(profile.email);
        setGravatarUrl(gravatar);
        setDicebearUrl(dicebear);
        localStorage.setItem(GRAVATAR_KEY, gravatar);
        localStorage.setItem(DICEBEAR_KEY, dicebear);
      })
      .catch(() => {});
  }, [token]);

  const login = useCallback((newToken: string, username?: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.removeItem(GRAVATAR_KEY);
    localStorage.removeItem(DICEBEAR_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setGravatarUrl(null);
    setDicebearUrl(null);
    setStoredUsername(username ?? null);
    if (username) localStorage.setItem(USERNAME_KEY, username);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(GRAVATAR_KEY);
    localStorage.removeItem(DICEBEAR_KEY);
    setStoredUsername(null);
    setGravatarUrl(null);
    setDicebearUrl(null);
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
        gravatarUrl,
        dicebearUrl,
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