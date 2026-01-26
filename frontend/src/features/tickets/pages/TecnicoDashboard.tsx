import { useEffect, useState } from 'react';
import { FiInbox, FiTool, FiUser, FiArchive, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { useLocals } from '../../locals/hooks/useLocals';
import { TicketTable, TicketFilters } from '../components';
import { StatsGrid } from '../../../shared/components';

export function TecnicoDashboard() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [localFilter, setLocalFilter] = useState('');
  const [tab, setTab] = useState<'pendentes' | 'em_atendimento' | 'meus_atendimentos' | 'historico'>('pendentes');
  const [success, setSuccess] = useState('');
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTicketId, setRejectTicketId] = useState<number | null>(null);

  const ticketsHook = useTickets();
  const localsHook = useLocals();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      ticketsHook.loadTickets(),
      localsHook.loadLocals()
    ]);
  };

  const handleAccept = async (id: number) => {
    const result = await ticketsHook.acceptTicket(id);
    if (result.success) {
      setSuccess(`Ticket #${id} aceito com sucesso!`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const handleComplete = async (id: number) => {
    setConfirmId(id);
  };
  const confirmFinalize = async () => {
    if (confirmId == null) return;
    const result = await ticketsHook.finalizeTicket(confirmId);
    if (result.success) {
      setSuccess(`Ticket #${confirmId} finalizado com sucesso!`);
      setTimeout(() => setSuccess(''), 3000);
    }
    setConfirmId(null);
  };

  const handleClearHistory = () => {
    setShowClearHistoryModal(true);
  };

  const confirmClearHistory = async () => {
    if (!user) return;
    const result = await ticketsHook.clearCompletedTickets(user.id);
    if (result.success) {
      setSuccess('Histórico limpo com sucesso!');
      setShowClearHistoryModal(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleReject = (id: number) => {
    setRejectTicketId(id);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (rejectTicketId === null) return;
    const result = await ticketsHook.rejectTicket(rejectTicketId);
    if (result.success) {
      setSuccess(`Ticket #${rejectTicketId} devolvido para pendentes!`);
      setShowRejectModal(false);
      setRejectTicketId(null);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const filteredTickets = ticketsHook.filterTickets({
    status: statusFilter,
    tecnicoId: '',
    localId: localFilter
  });

  const pendingTickets = filteredTickets.filter(t => t.status === 'PENDING');
  const allInProgressTickets = filteredTickets.filter(t => t.status === 'IN_PROGRESS');
  const myInProgressTickets = filteredTickets.filter(
    t => t.status === 'IN_PROGRESS' && t.tecnicoId === user?.id
  );
  const completedTickets = filteredTickets.filter(
    t => (t.status === 'COMPLETED' || t.status === 'CANCELLED') && t.tecnicoId === user?.id
  );

  const stats = {
    total: pendingTickets.length + myInProgressTickets.length + completedTickets.length,
    pending: pendingTickets.length,
    inProgress: myInProgressTickets.length,
    completed: completedTickets.length
  };

  const error = ticketsHook.error || localsHook.error;
  const loading = ticketsHook.loading || localsHook.loading;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Painel do Técnico</h1>
          <p className="page-subtitle">Gerencie seus atendimentos</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <StatsGrid stats={stats} />

      <div className="card">
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', margin: '-20px -20px 16px -20px' }}>
          <button
            className={`tab-button ${tab === 'pendentes' ? 'active' : ''}`}
            onClick={() => setTab('pendentes')}
            style={{ flex: 1, padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <FiInbox size={18} /> Pendentes ({pendingTickets.length})
          </button>
          <button
            className={`tab-button ${tab === 'em_atendimento' ? 'active' : ''}`}
            onClick={() => setTab('em_atendimento')}
            style={{ flex: 1, padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <FiTool size={18} /> Em Atendimento ({allInProgressTickets.length})
          </button>
          <button
            className={`tab-button ${tab === 'meus_atendimentos' ? 'active' : ''}`}
            onClick={() => setTab('meus_atendimentos')}
            style={{ flex: 1, padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <FiUser size={18} /> Meus ({myInProgressTickets.length})
          </button>
          <button
            className={`tab-button ${tab === 'historico' ? 'active' : ''}`}
            onClick={() => setTab('historico')}
            style={{ flex: 1, padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <FiArchive size={18} /> Histórico ({completedTickets.length})
          </button>
        </div>

        <TicketFilters
          statusFilter={statusFilter}
          tecnicoFilter=""
          localFilter={localFilter}
          onStatusChange={setStatusFilter}
          onTecnicoChange={() => {}}
          onLocalChange={setLocalFilter}
          technicians={[]}
          locals={localsHook.locals}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Carregando...</p>
          </div>
        ) : (
          <>
            {tab === 'pendentes' && (
              <>
                <TicketTable
                  tickets={pendingTickets}
                  onAccept={handleAccept}
                  showActions={true}
                  emptyMessage="Nenhum chamado pendente no momento"
                />
              </>
            )}

            {tab === 'em_atendimento' && (
              <>
                <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>Visualize todos os chamados em atendimento para controlar quem está atendendo cada um.</p>
                <TicketTable
                  tickets={allInProgressTickets}
                  emptyMessage="Nenhum chamado em atendimento no momento"
                />
              </>
            )}

            {tab === 'meus_atendimentos' && (
              <>
                <TicketTable
                  tickets={myInProgressTickets}
                  onComplete={handleComplete}
                  onReject={handleReject}
                  showActions={true}
                  emptyMessage="Você não tem chamados em atendimento"
                />
              </>
            )}

            {tab === 'historico' && (
              <>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Finalizados & Cancelados ({completedTickets.length})</span>
                  {completedTickets.length > 0 && (
                    <button onClick={handleClearHistory} className="btn-ghost" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><FiTrash2 size={14} /> Limpar</button>
                  )}
                </h3>
                <TicketTable
                  tickets={completedTickets}
                  emptyMessage="Nenhum chamado finalizado"
                />
              </>
            )}
          </>
        )}
      {confirmId !== null && (
        <div className="modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Finalização</h3>
              <button className="modal-close" onClick={() => setConfirmId(null)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Deseja finalizar o ticket #{confirmId}? Esta ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-success" onClick={confirmFinalize}>Finalizar</button>
                <button className="btn-ghost" onClick={() => setConfirmId(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClearHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowClearHistoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Limpeza</h3>
              <button className="modal-close" onClick={() => setShowClearHistoryModal(false)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Deseja limpar seus chamados finalizados? Esta ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-danger" onClick={confirmClearHistory}>Limpar</button>
                <button className="btn-ghost" onClick={() => setShowClearHistoryModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Desistência</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Deseja desistir do ticket #{rejectTicketId}? O chamado voltará ao status pendente e outro técnico poderá assumi-lo. Esta ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-danger" onClick={confirmReject}>Desistir</button>
                <button className="btn-ghost" onClick={() => setShowRejectModal(false)}>Voltar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
