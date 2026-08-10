import { storage, STORAGE_KEYS } from '../utils/storage';
import { ApiError } from '../utils/httpError';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Cloudflare Access Service Token (necesar pentru a trece de firewall-ul CF).
// Setat prin build-arg in CI (vezi .github/workflows/*.yml) sau .env.local pentru dev.
// NU pune valori hardcodate aici: fiind un build Vite, orice valoare ajunge oricum in
// bundle-ul livrat clientului, deci hardcodarea le expune permanent in istoricul git.
const CF_ACCESS_CLIENT_ID = import.meta.env.VITE_CF_ACCESS_CLIENT_ID || '';
const CF_ACCESS_CLIENT_SECRET = import.meta.env.VITE_CF_ACCESS_CLIENT_SECRET || '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// --- Token store partajat cu AuthContext -----------------------------------
// apiClient e singura sursa de adevar pentru access token: cand il reimprospateaza
// (silent refresh) anunta toti ascultatorii (ex. AuthContext isi actualizeaza state-ul).
type TokenListener = (token: string | null) => void;
const tokenListeners = new Set<TokenListener>();

export function subscribeToken(listener: TokenListener): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

// Access token-ul traieste DOAR in memorie (nu in localStorage), ca sa nu poata fi
// exfiltrat prin XSS. La reload se pierde si e recuperat printr-un silent refresh
// (cookie httpOnly). In localStorage tinem doar un marker non-sensibil ca a existat
// o sesiune, ca AuthContext sa stie sa incerce refresh la boot. GDPR Art. 32.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (token) {
    storage.set(STORAGE_KEYS.session, '1');
  } else {
    storage.remove(STORAGE_KEYS.session);
  }
  tokenListeners.forEach((l) => l(token));
}

const cfHeaders: Record<string, string> = {
  'CF-Access-Client-Id': CF_ACCESS_CLIENT_ID,
  'CF-Access-Client-Secret': CF_ACCESS_CLIENT_SECRET,
};

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return {
    ...cfHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// --- Silent refresh (single-flight) ----------------------------------------
// Daca pica mai multe requesturi pe 401 in acelasi timp, vrem un singur apel la
// /auth/refresh, nu cate unul pentru fiecare. Toate asteapta aceeasi promisiune.
let refreshPromise: Promise<string | null> | null = null;

export function refreshSession(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { ...cfHeaders },
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const data = await res.json().catch(() => null);
        const newToken = data?.token ?? null;
        setAccessToken(newToken);
        return newToken;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Endpoint-urile de auth (login/register/refresh/logout) NU trebuie sa declanseze
// silent refresh pe 401 — un 401 acolo inseamna credentiale gresite / sesiune moarta.
function isAuthEndpoint(endpoint: string): boolean {
  return endpoint.replace(/^\//, '').startsWith('auth/');
}

async function request<TResponse>(
  endpoint: string,
  method: HttpMethod,
  body?: unknown,
  init?: RequestInit,
  isRetry = false,
): Promise<TResponse> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  });

  if (!response.ok) {
    // Access token expirat: incercam un silent refresh si reluam requestul o singura data.
    if (response.status === 401 && !isRetry && !isAuthEndpoint(endpoint)) {
      const newToken = await refreshSession();
      if (newToken) {
        return request<TResponse>(endpoint, method, body, init, true);
      }
    }

    const errorBody = await response.json().catch(() => null);

    if (response.status === 401) {
      setAccessToken(null);
    }

    if (response.status === 403 && errorBody?.message === 'Account is banned') {
      setAccessToken(null);
      const reason = errorBody?.banReason ? `&reason=${encodeURIComponent(errorBody.banReason)}` : '';
      window.location.href = `/login?banned=true${reason}`;
    }

    throw new ApiError(response.status, errorBody, response.statusText);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  // verific daca raspunsul e json sau string si il parsez corespunzator
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  } else {
    return (await response.text()) as unknown as TResponse;
  }
}

export const apiClient = {
  get: <TResponse>(endpoint: string, init?: RequestInit) =>
    request<TResponse>(endpoint, 'GET', undefined, init),
  post: <TResponse>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<TResponse>(endpoint, 'POST', body, init),
  put: <TResponse>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<TResponse>(endpoint, 'PUT', body, init),
  patch: <TResponse>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<TResponse>(endpoint, 'PATCH', body, init),
  delete: <TResponse>(endpoint: string, init?: RequestInit) =>
    request<TResponse>(endpoint, 'DELETE', undefined, init),
};
