import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
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

// Wrappere defensive pentru Safari private mode / storage corupt.
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
  } catch {
    // ignore
  }
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = safeGet(TOKEN_KEY);
    if (stored && !isTokenExpired(stored)) return stored;
    safeRemove(TOKEN_KEY);
    return null;
  });

  const [storedUsername, setStoredUsername] = useState<string | null>(() => {
    return safeGet(USERNAME_KEY);
  });

  const [gravatarUrl, setGravatarUrl] = useState<string | null>(() => {
    return safeGet(GRAVATAR_KEY);
  });

  const [dicebearUrl, setDicebearUrl] = useState<string | null>(() => {
    return safeGet(DICEBEAR_KEY);
  });

  const payload = token ? decodeJwt(token) : null;
  const userId = payload?.sub ?? null;
  const isAdmin = payload?.role === 'ADMIN';
  const isProfessor = payload?.role === 'PROFESSOR';
  const isAuthenticated = token !== null && !isTokenExpired(token);

  useEffect(() => {
    if (!token || isTokenExpired(token) || !storedUsername) return;

    profileService.getProfile(storedUsername)
      .then((profile) => {
        setStoredUsername(profile.username);
        safeSet(USERNAME_KEY, profile.username);
        const gravatar = getGravatarUrl(profile.email);
        const dicebear = getDiceBearUrl(profile.email);
        setGravatarUrl(gravatar);
        setDicebearUrl(dicebear);
        safeSet(GRAVATAR_KEY, gravatar);
        safeSet(DICEBEAR_KEY, dicebear);
      })
      .catch(() => {
        toast.error('Eroare la încărcarea profilului. Încearcă să te reconectezi.');
      });
  }, [token]);

  const login = useCallback((newToken: string, username?: string) => {
    safeSet(TOKEN_KEY, newToken);
    safeRemove(GRAVATAR_KEY);
    safeRemove(DICEBEAR_KEY);
    safeRemove(USERNAME_KEY);
    setGravatarUrl(null);
    setDicebearUrl(null);
    setStoredUsername(username ?? null);
    if (username) safeSet(USERNAME_KEY, username);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    safeRemove(TOKEN_KEY);
    safeRemove(USERNAME_KEY);
    safeRemove(GRAVATAR_KEY);
    safeRemove(DICEBEAR_KEY);
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