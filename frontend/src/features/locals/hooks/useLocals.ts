import { useState, useCallback } from 'react';
import { localsService } from '../../../services/domainService';
import { Local } from '../../../types';

export function useLocals() {
  const [locals, setLocals] = useState<Local[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLocals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await localsService.list();
      setLocals(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLocal = useCallback(async (name: string) => {
    setError('');
    try {
      await localsService.create(name);
      await loadLocals();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar local';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadLocals]);

  const updateLocal = useCallback(async (id: number, data: { name?: string }) => {
    setError('');
    try {
      await localsService.update(id, data);
      await loadLocals();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar local';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadLocals]);

  const deleteLocal = useCallback(async (id: number) => {
    setError('');
    try {
      await localsService.delete(id);
      await loadLocals();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar local';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadLocals]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    locals,
    loading,
    error,
    clearError,
    loadLocals,
    createLocal,
    updateLocal,
    deleteLocal
  };
}
