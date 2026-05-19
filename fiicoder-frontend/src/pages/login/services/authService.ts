import { apiClient } from "../../../services/apiClient";

export interface LoginRequest {
  email: string;
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

export interface LoginResponse {
  token: string;
}

export interface ValidationErrors {
  errors: Record<string, string>;
}

export interface ApiError {
  error: string;
  message?: string;
}

export const authService = {
  // POST /api/auth/login
  async login(request: LoginRequest): Promise<string> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', request);
      return response.token;
    } catch (err: any) {
      if (err.status === 403) {
        throw new AuthError('banned', 403, err.body);
      }
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