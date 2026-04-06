import { apiClient } from './apiClient';

// ── Types matching the backend DTOs ──────────────────────────────

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  data: unknown;
}

// Backend error shapes
export interface ValidationErrors {
  errors: Record<string, string>;
}

export interface ApiError {
  error: string;
  message?: string;
}

// ── Auth Service ─────────────────────────────────────────────────

export const authService = {
  /**
   * POST /api/auth/login
   * Backend returns the JWT token as a plain string (not JSON).
   */
  async login(request: LoginRequest): Promise<string> {
    const url = `/auth/login`;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || '/api'}${url}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      if (response.status === 401) {
        throw new AuthError('Invalid credentials!', 401, body);
      }
      if (response.status === 400 && body?.errors) {
        throw new AuthError('Validation failed', 400, body);
      }
      throw new AuthError(
        body?.message || body?.error || 'Login failed',
        response.status,
        body,
      );
    }

    const body = await response.json();
    return body.token;
  },

  /**
   * POST /api/auth/register
   * Backend returns { message, data } with status 201.
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const url = `/auth/register`;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || '/api'}${url}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      if (response.status === 409) {
        throw new AuthError(
          body?.error || 'Username or email already used',
          409,
          body,
        );
      }
      if (response.status === 400 && body?.errors) {
        throw new AuthError('Validation failed', 400, body);
      }
      throw new AuthError(
        body?.message || body?.error || 'Registration failed',
        response.status,
        body,
      );
    }

    return (await response.json()) as RegisterResponse;
  },
};

// ── Custom error class ───────────────────────────────────────────

export class AuthError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown = null) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.body = body;
  }
}
