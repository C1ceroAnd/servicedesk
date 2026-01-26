import { useState, useCallback } from 'react';
import { usersService } from '../../../services/domainService';
import { User } from '../../../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await usersService.list();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (
    name: string,
    email: string,
    role: 'USER' | 'TECNICO',
    localId?: string
  ) => {
    setError('');
    try {
      const result = await usersService.create(name, email, role, localId);
      await loadUsers();
      return { success: true, tempPassword: result?.tempPassword };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar usuário';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (
    id: number,
    data: { name?: string; email?: string; role?: string; localId?: number | null }
  ) => {
    setError('');
    try {
      await usersService.update(id, data);
      await loadUsers();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar usuário';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadUsers]);

  const deleteUser = useCallback(async (id: number) => {
    setError('');
    try {
      await usersService.delete(id);
      await loadUsers();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar usuário';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadUsers]);

  const resetUserPassword = useCallback(async (id: number) => {
    setError('');
    try {
      const result = await usersService.resetPassword(id);
      await loadUsers();
      return { success: true, data: result };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao resetar senha';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadUsers]);

  const getUsersByRole = useCallback((role: 'USER' | 'TECNICO' | 'ADMIN') => {
    return users.filter(u => u.role === role);
  }, [users]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    users,
    loading,
    error,
    clearError,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    getUsersByRole
  };
}
