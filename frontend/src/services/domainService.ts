import api from './api';

export interface Local {
  id: number;
  name: string;
  active?: boolean;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  userId: number;
  localId: number;
  tecnicoId?: number;
  createdAt: string;
  dataAceito?: string;
  dataFechamento?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'TECNICO' | 'ADMIN';
  localId?: number;
}

export const localsService = {
  list: async () => {
    const response = await api.get<Local[]>('/locals');
    return response.data;
  },

  create: async (name: string) => {
    const response = await api.post('/locals', { name });
    return response.data;
  },

  update: async (id: number, data: { name?: string }) => {
    const response = await api.patch(`/locals/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/locals/${id}`);
  },
};

export const ticketsService = {
  list: async (status?: string, localId?: number, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (localId) params.append('localId', localId.toString());
    if (search) params.append('search', search);

    const response = await api.get<Ticket[]>(`/tickets?${params.toString()}`);
    return response.data;
  },

  create: async (title: string, description: string, localId?: number) => {
    const response = await api.post('/tickets', { title, description, localId });
    return response.data;
  },

  accept: async (id: number) => {
    const response = await api.patch(`/tickets/${id}/accept`);
    return response.data;
  },

  finalize: async (id: number) => {
    const response = await api.patch(`/tickets/${id}/finalize`);
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await api.patch(`/tickets/${id}/cancel`);
    return response.data;
  },

  reject: async (id: number) => {
    const response = await api.patch(`/tickets/${id}/reject`);
    return response.data;
  },

  clearUserCompleted: async (userId: number) => {
    const response = await api.delete(`/tickets/user/${userId}/completed`);
    return response.data;
  },
};

export const usersService = {
  list: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  create: async (name: string, email: string, role: 'USER' | 'TECNICO' | 'ADMIN', localId?: number | string) => {
    const response = await api.post('/users', { name, email, role, localId });
    return response.data;
  },

  update: async (id: number, data: { name?: string; email?: string; role?: string; localId?: number | null }) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  },

  resetPassword: async (id: number) => {
    const response = await api.patch(`/users/${id}/reset-password`);
    return response.data;
  },
};
