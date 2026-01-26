import { useEffect, useState } from 'react';
import { FiInbox, FiArchive, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { TicketTable } from '../components';
import { TicketForm, StatsCard } from '../../../shared/components';
import { useLocals } from '../../locals/hooks/useLocals';

export function UserDashboard() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTicketId, setCancelTicketId] = useState<number | null>(null);
  const [tab, setTab] = useState<'abertos' | 'historico'>('abertos');
  const [success, setSuccess] = useState('');

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

  const handleCreateTicket = async (formData: any) => {
    const result = await ticketsHook.createTicket(
      formData.title,
      formData.description,
      user?.localId?.toString() || ''
    );

    if (result.success) {
      setSuccess('Ticket criado com sucesso!');
      setShowModal(false);
      setTimeout(() => setSuccess(''), 1500);
    }
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

  const handleCancel = (id: number) => {
    setCancelTicketId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (cancelTicketId === null) return;
    const result = await ticketsHook.cancelTicket(cancelTicketId);
    if (result.success) {
      setSuccess(`Ticket #${cancelTicketId} cancelado com sucesso!`);
      setShowCancelModal(false);
      setCancelTicketId(null);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const userTickets = ticketsHook.tickets.filter(t => t.userId === user?.id);
  const openTickets = userTickets.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status));
  const closedTickets = userTickets.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status));
  const displayTickets = tab === 'abertos' ? openTickets : closedTickets;

  const error = ticketsHook.error || localsHook.error;
  const loading = ticketsHook.loading || localsHook.loading;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meus Tickets</h1>
          <p className="page-subtitle">Bem-vindo, {user?.name}!</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Novo Ticket
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px',
        marginBottom: '24px' 
      }}>
        <StatsCard label="Total" value={userTickets.length} />
        <StatsCard label="Abertos" value={openTickets.length} />
        <StatsCard label="Finalizados" value={closedTickets.length} />
      </div>

      <TicketForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateTicket}
        locals={localsHook.locals}
        userLocalId={user?.localId}
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            className={`tab-button ${tab === 'abertos' ? 'active' : ''}`}
            onClick={() => setTab('abertos')}
            style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px' }}
          >
            <FiInbox size={18} /> Abertos ({openTickets.length})
          </button>
          <button 
            className={`tab-button ${tab === 'historico' ? 'active' : ''}`}
            onClick={() => setTab('historico')}
            style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px' }}
          >
            <FiArchive size={18} /> Histórico ({closedTickets.length})
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {tab === 'historico' && closedTickets.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleClearHistory} className="btn-ghost" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiTrash2 size={16} /> Limpar Histórico
              </button>
            </div>
          )}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '16px', color: '#6b7280' }}>Carregando...</p>
            </div>
          ) : (
            <TicketTable 
              tickets={displayTickets}
              onCancel={tab === 'abertos' ? handleCancel : undefined}
              showActions={tab === 'abertos'}
              emptyMessage={tab === 'abertos' 
                ? 'Você não tem tickets abertos. Clique em "+ Novo Ticket" para criar um.' 
                : 'Você ainda não tem tickets finalizados.'}
            />
          )}
        </div>
      </div>

      {showClearHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowClearHistoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Limpeza</h3>
              <button className="modal-close" onClick={() => setShowClearHistoryModal(false)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Deseja limpar o histórico de tickets finalizados? Os tickets continuarão no sistema mas não aparecerão mais no seu histórico.</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-danger" onClick={confirmClearHistory}>Limpar</button>
                <button className="btn-ghost" onClick={() => setShowClearHistoryModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Cancelamento</h3>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Deseja cancelar o ticket #{cancelTicketId}? Esta ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-danger" onClick={confirmCancel}>Cancelar Ticket</button>
                <button className="btn-ghost" onClick={() => setShowCancelModal(false)}>Voltar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
