import { useState, useCallback } from 'react';
import { ticketsService } from '../../../services/domainService';
import { TicketWithRelations, TicketFilters } from '../../../types';

export function useTickets() {
  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ticketsService.list();
      setTickets(data as TicketWithRelations[]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterTickets = useCallback((filters: TicketFilters) => {
    return tickets.filter(ticket => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.tecnicoId && ticket.tecnicoId?.toString() !== filters.tecnicoId) return false;
      if (filters.localId && ticket.localId?.toString() !== filters.localId) return false;
      return true;
    });
  }, [tickets]);

  const acceptTicket = useCallback(async (ticketId: number) => {
    setError('');
    try {
      await ticketsService.accept(ticketId);
      await loadTickets();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao aceitar chamado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadTickets]);

  const finalizeTicket = useCallback(async (ticketId: number) => {
    setError('');
    try {
      await ticketsService.finalize(ticketId);
      await loadTickets();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao finalizar chamado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadTickets]);

  const cancelTicket = useCallback(async (ticketId: number) => {
    setError('');
    try {
      await ticketsService.cancel(ticketId);
      await loadTickets();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao cancelar chamado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadTickets]);

  const rejectTicket = useCallback(async (ticketId: number) => {
    setError('');
    try {
      await ticketsService.reject(ticketId);
      await loadTickets();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao rejeitar chamado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadTickets]);

  const createTicket = useCallback(async (title: string, description: string, localId?: number | string) => {
    setError('');
    try {
      let localNum: number | undefined = undefined;
      if (typeof localId === 'string' && localId.trim()) {
        const parsed = parseInt(localId, 10);
        if (!Number.isNaN(parsed)) localNum = parsed;
      } else if (typeof localId === 'number') {
        localNum = localId;
      }
      await ticketsService.create(title, description, localNum);
      await loadTickets();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar chamado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadTickets]);

  const getStats = useCallback(() => {
    const pending = tickets.filter(t => t.status === 'PENDING').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const completed = tickets.filter(t => t.status === 'COMPLETED' || t.status === 'CANCELLED').length;
    
    return { total: tickets.length, pending, inProgress, completed };
  }, [tickets]);

  const clearCompletedTickets = useCallback(async (userId: number) => {
    setError('');
    try {
      await ticketsService.clearUserCompleted(userId);
      await loadTickets();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao limpar histórico';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadTickets]);

  return {
    tickets,
    loading,
    error,
    loadTickets,
    filterTickets,
    acceptTicket,
    finalizeTicket,
    cancelTicket,
    rejectTicket,
    createTicket,
    getStats,
    clearCompletedTickets
  };
}
