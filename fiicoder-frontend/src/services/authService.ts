import { apiClient } from './apiClient';

// Types matching the backend DTOs

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

// Authentication API calls

export const authService = {
  // POST /api/auth/login
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

    // Extract token from JSON if available, otherwise use raw text
    const rawText = await response.text();
    try {
      const data = JSON.parse(rawText);
      return data.token || rawText; // Fallback to raw text if token property doesn't exist
    } catch {
      return rawText; // Fallback for plain text response
    }
  },

  // POST /api/auth/register
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

// Custom error class for authentication failures

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
