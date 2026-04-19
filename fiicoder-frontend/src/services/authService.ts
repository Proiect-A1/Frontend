// Types matching the backend DTOs

import { apiClient } from "./apiClient";

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
    try {
      // folosim 'any' temporar pentru a acoperi modificarile din backend
      const response = await apiClient.post<any>('/auth/login', request);
      
      // tratez atat json cat si string ca raspuns
      if (typeof response === 'string') return response;
      return response.token || response.accessToken || response.jwt || "";
      
    } catch (err: any) {
      throw new AuthError(
        err.body?.message || err.body?.error || 'Login failed',
        err.status || 500,
        err.body
      );
    }
  },

  // POST /api/auth/register
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      return await apiClient.post<RegisterResponse>('/auth/register', request);
    } catch (err: any) {
      const errorMessage = err.status === 409 
        ? (err.body?.error || 'Username or email already used')
        : (err.status === 400 && err.body?.errors ? 'Validation failed' : (err.body?.message || err.body?.error || 'Registration failed'));
        
      throw new AuthError(errorMessage, err.status || 500, err.body);
    }
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
