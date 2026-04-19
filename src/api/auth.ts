import api from './client';
import { AuthTokens, LoginRequest, RegisterRequest, User } from '../types';

export const authApi = {
  login: (body: LoginRequest) =>
    api.post<{ user: User; access_token: string; refresh_token: string }>('/auth/login', body),

  register: (body: RegisterRequest) =>
    api.post<{ user: User; access_token: string; refresh_token: string }>('/auth/register', body),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refresh_token: string) =>
    api.post<{ access_token: string; refresh_token: string }>('/auth/refresh', { refresh_token }),

  requestPasswordReset: (email: string) =>
    api.post('/auth/password-reset/request', { email }),

  confirmPasswordReset: (token: string, new_password: string) =>
    api.post('/auth/password-reset/confirm', { token, new_password }),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  getMe: () => api.get<User>('/auth/me'),

  updateProfile: (updates: Partial<User>) =>
    api.patch<User>('/auth/me', updates),

  deleteAccount: () => api.delete('/auth/me'),
};
