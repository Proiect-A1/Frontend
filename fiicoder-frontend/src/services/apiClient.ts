const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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
      ...(init?.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) ${response.statusText}`);
  }

  // Some endpoints may return no content (204).
  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
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
