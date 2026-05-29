const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'fiicoder_jwt';

const CF_ACCESS_CLIENT_ID = import.meta.env.VITE_CF_ACCESS_CLIENT_ID;
const CF_ACCESS_CLIENT_SECRET = import.meta.env.VITE_CF_ACCESS_CLIENT_SECRET;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    ...(CF_ACCESS_CLIENT_ID ? { 'CF-Access-Client-Id': CF_ACCESS_CLIENT_ID } : {}),
    ...(CF_ACCESS_CLIENT_SECRET ? { 'CF-Access-Client-Secret': CF_ACCESS_CLIENT_SECRET } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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
    const errorBody = await response.json().catch(() => null);

    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }

    if (response.status === 403 && errorBody?.message === 'Account is banned') {
      localStorage.removeItem(TOKEN_KEY);
      const reason = errorBody?.banReason ? `&reason=${encodeURIComponent(errorBody.banReason)}` : '';
      window.location.href = `/login?banned=true${reason}`;
    }

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
