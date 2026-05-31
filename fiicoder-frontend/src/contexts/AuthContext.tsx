import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getGravatarUrl, getDiceBearUrl } from '../utils/gravatar';
import { profileService } from '../services/profileService';
import { subscribeToken, refreshSession, setAccessToken } from '../services/apiClient';
import { authService } from '../pages/login/services/authService';

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
  isLoading: boolean;
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
  isLoading: true,
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
    // pastram un token expirat ca "marker" de sesiune anterioara — incercam refresh la boot
    return stored && !isTokenExpired(stored) ? stored : null;
  });

  // true cat timp incercam un silent refresh la pornire (ca sa nu redirectionam
  // userul spre /login inainte sa stim daca avem o sesiune valida prin cookie)
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const stored = safeGet(TOKEN_KEY);
    return !!stored && isTokenExpired(stored);
  });

  const [gravatarUrl, setGravatarUrl] = useState<string | null>(() => safeGet(GRAVATAR_KEY));
  const [dicebearUrl, setDicebearUrl] = useState<string | null>(() => safeGet(DICEBEAR_KEY));

  // Decodam JWT-ul o singura data per schimbare de token (atob + JSON.parse sunt
  // suficient de scumpe cat sa nu vrem sa le rulam de 2x pe fiecare render).
  const authState = useMemo(() => {
    const payload = token ? decodeJwt(token) : null;
    return {
      username: payload?.username ?? null,
      userId: payload?.sub ?? null,
      isAdmin: payload?.role === 'ADMIN',
      isProfessor: payload?.role === 'PROFESSOR',
      // folosim exp-ul deja decodat in loc sa mai chemam isTokenExpired (al doilea decode)
      isAuthenticated: payload != null && Date.now() < payload.exp * 1000,
    };
  }, [token]);

  const updateAvatar = useCallback((email: string) => {
    const gravatar = getGravatarUrl(email);
    const dicebear = getDiceBearUrl(email);
    setGravatarUrl(gravatar);
    setDicebearUrl(dicebear);
    safeSet(GRAVATAR_KEY, gravatar);
    safeSet(DICEBEAR_KEY, dicebear);
  }, []);

  const login = useCallback((newToken: string) => {
    safeRemove(GRAVATAR_KEY);
    safeRemove(DICEBEAR_KEY);
    setGravatarUrl(null);
    setDicebearUrl(null);
    // setAccessToken scrie in localStorage si notifica abonatii -> setToken (vezi efectul de mai jos)
    setAccessToken(newToken);
  }, []);

  const logout = useCallback(() => {
    // invalidam refresh token-ul pe server (fire-and-forget); UI-ul se deconecteaza imediat
    void authService.logout();
    safeRemove(GRAVATAR_KEY);
    safeRemove(DICEBEAR_KEY);
    setGravatarUrl(null);
    setDicebearUrl(null);
    setAccessToken(null);
  }, []);

  // Sursa de adevar pentru access token e apiClient (el face silent refresh).
  // Ne abonam ca sa tinem state-ul React sincronizat cu localStorage.
  useEffect(() => {
    const unsubscribe = subscribeToken((t) => {
      setToken(t);
      if (!t) {
        safeRemove(GRAVATAR_KEY);
        safeRemove(DICEBEAR_KEY);
        setGravatarUrl(null);
        setDicebearUrl(null);
      }
    });
    return unsubscribe;
  }, []);

  // La boot: daca avem un token expirat (marker de sesiune anterioara), incercam un
  // silent refresh prin cookie-ul httpOnly inainte sa decidem ca userul e delogat.
  useEffect(() => {
    const stored = safeGet(TOKEN_KEY);
    if (stored && isTokenExpired(stored)) {
      refreshSession().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const username = authState.username;
    if (!token || isTokenExpired(token) || !username) return;
    profileService.getProfile(username)
      .then((profile) => updateAvatar(profile.email))
      .catch(() => {});
  }, [token]);

  // Refresh proactiv: cand access token-ul (15 min) a expirat, incercam sa-l reinnoim
  // prin cookie in loc sa delogam direct. Daca refresh-ul esueaza, apiClient curata token-ul.
  useEffect(() => {
    const id = setInterval(() => {
      if (token && isTokenExpired(token)) void refreshSession();
    }, 60_000);
    return () => clearInterval(id);
  }, [token]);

  // Valoarea contextului e memoizata: useAuth e consumat in tot app-ul (Navbar,
  // ProtectedRoute, majoritatea paginilor), deci un obiect nou la fiecare render
  // ar re-randa toti consumatorii degeaba. login/logout/updateAvatar sunt deja
  // stabile (useCallback), iar authState se schimba doar cand se schimba token-ul.
  const value = useMemo(
    () => ({
      token,
      username: authState.username,
      userId: authState.userId,
      gravatarUrl,
      dicebearUrl,
      isAdmin: authState.isAdmin,
      isProfessor: authState.isProfessor,
      isAuthenticated: authState.isAuthenticated,
      isLoading,
      login,
      logout,
      updateAvatar,
    }),
    [token, authState, gravatarUrl, dicebearUrl, isLoading, login, logout, updateAvatar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
