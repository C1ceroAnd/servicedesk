import api from './api';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'TECNICO' | 'USER';
    localId?: number;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: string, localId?: number) => {
    const response = await api.post('/auth/register', { name, email, password, role, localId });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<RefreshResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },
};
