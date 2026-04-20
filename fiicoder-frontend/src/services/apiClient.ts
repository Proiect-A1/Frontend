const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'fiicoder_jwt';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<TResponse>(
  endpoint: string,
  method: HttpMethod,
  body?: unknown,
  init?: RequestInit,
): Promise<TResponse> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    // extrag detaliile erorii
    const errorBody = await response.json().catch(() => null);
    throw { status: response.status, body: errorBody, message: response.statusText };
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
