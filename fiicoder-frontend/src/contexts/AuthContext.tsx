import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getGravatarUrl, getDiceBearUrl } from '../utils/gravatar';
import { profileService } from '../services/profileService';

interface JwtPayload {
  sub: string;
  role: string;
  username: string;
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
  login: (token: string) => void;
  logout: () => void;
  updateAvatar: (email: string) => void;
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
  updateAvatar: () => {},
});

const TOKEN_KEY = 'fiicoder_jwt';
const GRAVATAR_KEY = 'fiicoder_gravatar';
const DICEBEAR_KEY = 'fiicoder_dicebear';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = safeGet(TOKEN_KEY);
    if (stored && !isTokenExpired(stored)) return stored;
    safeRemove(TOKEN_KEY);
    return null;
  });

  const [gravatarUrl, setGravatarUrl] = useState<string | null>(() => safeGet(GRAVATAR_KEY));
  const [dicebearUrl, setDicebearUrl] = useState<string | null>(() => safeGet(DICEBEAR_KEY));

  const payload = token ? decodeJwt(token) : null;
  const username = payload?.username ?? null;
  const userId = payload?.sub ?? null;
  const isAdmin = payload?.role === 'ADMIN';
  const isProfessor = payload?.role === 'PROFESSOR';
  const isAuthenticated = token !== null && !isTokenExpired(token);

  const updateAvatar = useCallback((email: string) => {
    const gravatar = getGravatarUrl(email);
    const dicebear = getDiceBearUrl(email);
    setGravatarUrl(gravatar);
    setDicebearUrl(dicebear);
    safeSet(GRAVATAR_KEY, gravatar);
    safeSet(DICEBEAR_KEY, dicebear);
  }, []);

  const login = useCallback((newToken: string) => {
    safeSet(TOKEN_KEY, newToken);
    safeRemove(GRAVATAR_KEY);
    safeRemove(DICEBEAR_KEY);
    setGravatarUrl(null);
    setDicebearUrl(null);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    safeRemove(TOKEN_KEY);
    safeRemove(GRAVATAR_KEY);
    safeRemove(DICEBEAR_KEY);
    setGravatarUrl(null);
    setDicebearUrl(null);
    setToken(null);
  }, []);

  useEffect(() => {
    if (!token || isTokenExpired(token) || !username) return;
    profileService.getProfile(username)
      .then((profile) => updateAvatar(profile.email))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const id = setInterval(() => {
      if (token && isTokenExpired(token)) logout();
    }, 60_000);
    return () => clearInterval(id);
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        userId,
        gravatarUrl,
        dicebearUrl,
        isAdmin,
        isProfessor,
        isAuthenticated,
        login,
        logout,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
