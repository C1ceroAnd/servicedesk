import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiCopy, FiAlertCircle, FiRefreshCw, FiX, FiArchive, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTickets } from '../../tickets/hooks/useTickets';
import { useUsers } from '../hooks/useUsers';
import { useLocals } from '../../locals/hooks/useLocals';
import { TicketTable, TicketFilters } from '../../tickets/components';
import { UserTable, UserForm, LocalTable, LocalForm, StatsGrid } from '../../../shared/components';
import { UserFormData, User, Local } from '../../../types';

export function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'tickets' | 'users' | 'tecnicos' | 'locais'>('tickets');
  const [ticketsView, setTicketsView] = useState<'ativos' | 'historico'>('ativos');
  const [showUserModal, setShowUserModal] = useState(false);
  const [userRole, setUserRole] = useState<'USER' | 'TECNICO'>('USER');
  const [success, setSuccess] = useState('');
  const [credentialsModal, setCredentialsModal] = useState<{name: string; email: string; tempPassword: string} | null>(null);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<{field: string; visible: boolean}>({field: '', visible: false});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [editingLocal, setEditingLocal] = useState<Local | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [tecnicoFilter, setTecnicoFilter] = useState('');
  const [localFilter, setLocalFilter] = useState('');

  // Custom hooks
  const ticketsHook = useTickets();
  const usersHook = useUsers();
  const localsHook = useLocals();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      ticketsHook.loadTickets(),
      usersHook.loadUsers(),
      localsHook.loadLocals()
    ]);
  };

  const handleCreateUser = async (formData: UserFormData) => {
    if (editingUser) {
      // Modo de edição
      const result = await usersHook.updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        localId: formData.role === 'USER' && formData.localId ? parseInt(formData.localId) : undefined
      });

      if (result.success) {
        setSuccess('Usuário atualizado com sucesso!');
        setShowUserModal(false);
        setEditingUser(null);
        await loadAllData();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setSuccess('Erro ao atualizar usuário');
        setTimeout(() => setSuccess(''), 2000);
      }
    } else {
      // Modo de criação
      const result = await usersHook.createUser(
        formData.name,
        formData.email,
        formData.role,
        formData.role === 'USER' ? formData.localId : undefined
      );

      if (result.success) {
        setSuccess('Usuário criado com sucesso!');
        setShowUserModal(false);
        if (result.tempPassword) {
          setCredentialsModal({ name: formData.name, email: formData.email, tempPassword: result.tempPassword });
        }
        await loadAllData();
        setTimeout(() => setSuccess(''), 2000);
      }
    }
  };

  const handleDeleteUser = async (id: number) => {
    const result = await usersHook.deleteUser(id);
    if (result.success) {
      setSuccess('Usuário deletado com sucesso');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      // Auto-clear error after 5 seconds
      setTimeout(() => usersHook.clearError(), 5000);
    }
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
    setTempPassword(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserRole(user.role === 'TECNICO' ? 'TECNICO' : 'USER');
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleEditLocal = (local: Local) => {
    setEditingLocal(local);
    setShowLocalModal(true);
  };

  const handleCloseLocalModal = () => {
    setShowLocalModal(false);
    setEditingLocal(null);
  };

  const handleCreateLocal = async (formData: { name: string }) => {
    if (editingLocal) {
      // Modo de edição
      const result = await localsHook.updateLocal(editingLocal.id, { name: formData.name });
      if (result.success) {
        setSuccess('Local atualizado com sucesso!');
        setShowLocalModal(false);
        setEditingLocal(null);
        await loadAllData();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setSuccess('Erro ao atualizar local');
        setTimeout(() => setSuccess(''), 2000);
      }
    } else {
      // Modo de criação
      const result = await localsHook.createLocal(formData.name);
      if (result.success) {
        setSuccess('Local criado com sucesso!');
        setShowLocalModal(false);
        await loadAllData();
        setTimeout(() => setSuccess(''), 2000);
      }
    }
  };

  const handleDeleteLocal = async (id: number) => {
    const result = await localsHook.deleteLocal(id);
    if (result.success) {
      setSuccess('Local deletado com sucesso');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      // Auto-clear error after 5 seconds
      setTimeout(() => localsHook.clearError(), 5000);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setResettingPassword(true);
    const result = await usersHook.resetUserPassword(selectedUser.id);
    setResettingPassword(false);
    if (result.success) {
      setTempPassword(result.data.tempPassword);
    }
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback({ field, visible: true });
    setTimeout(() => setCopyFeedback({ field: '', visible: false }), 2000);
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

  // Operações diretas com Locais removidas

  // Derived data
  const commonUsers = usersHook.getUsersByRole('USER');
  const technicians = usersHook.getUsersByRole('TECNICO');
  const filteredTickets = ticketsHook.filterTickets({ 
    status: statusFilter, 
    tecnicoId: tecnicoFilter, 
    localId: localFilter
  });
  const openTickets = filteredTickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedTickets = filteredTickets.filter(t => t.status === 'COMPLETED' || t.status === 'CANCELLED');
  const stats = ticketsHook.getStats();

  const error = ticketsHook.error || usersHook.error || localsHook.error;
  const loading = ticketsHook.loading || usersHook.loading || localsHook.loading;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Painel Administrativo</h1>
          <p className="page-subtitle">Gerencie chamados, usuários, técnicos e locais</p>
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <StatsGrid stats={stats} />

      <UserForm
        isOpen={showUserModal}
        onClose={handleCloseUserModal}
        onSubmit={handleCreateUser}
        role={userRole}
        editingUser={editingUser}
        locals={localsHook.locals}
      />

      <LocalForm
        isOpen={showLocalModal}
        onClose={handleCloseLocalModal}
        onSubmit={handleCreateLocal}
        editingLocal={editingLocal}
      />

      {/* Criação de Local dissociado removida */}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            className={`tab-button ${tab === 'tickets' ? 'active' : ''}`}
            onClick={() => setTab('tickets')}
            style={{ flex: 1, padding: '12px' }}
          >
            Chamados ({ticketsHook.tickets.length})
          </button>
          <button 
            className={`tab-button ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
            style={{ flex: 1, padding: '12px' }}
          >
            Usuários ({commonUsers.length})
          </button>
          <button 
            className={`tab-button ${tab === 'tecnicos' ? 'active' : ''}`}
            onClick={() => setTab('tecnicos')}
            style={{ flex: 1, padding: '12px' }}
          >
            Técnicos ({technicians.length})
          </button>
          <button 
            className={`tab-button ${tab === 'locais' ? 'active' : ''}`}
            onClick={() => setTab('locais')}
            style={{ flex: 1, padding: '12px' }}
          >
            Locais ({localsHook.locals.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Carregando...</p>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {tab === 'tickets' && (
              <div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', margin: '-24px -24px 16px -24px' }}>
                  <button
                    className={`tab-button ${ticketsView === 'ativos' ? 'active' : ''}`}
                    onClick={() => setTicketsView('ativos')}
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Ativos
                  </button>
                  <button
                    className={`tab-button ${ticketsView === 'historico' ? 'active' : ''}`}
                    onClick={() => setTicketsView('historico')}
                    style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <FiArchive size={18} /> Histórico
                  </button>
                </div>
                <TicketFilters
                  statusFilter={statusFilter}
                  tecnicoFilter={tecnicoFilter}
                  localFilter={localFilter}
                  onStatusChange={setStatusFilter}
                  onTecnicoChange={setTecnicoFilter}
                  onLocalChange={setLocalFilter}
                  technicians={technicians}
                  locals={localsHook.locals}
                />
                {ticketsView === 'ativos' && (
                  <>
                    <h3 style={{ margin: '16px 0', fontSize: '18px' }}>
                      Chamados Abertos ({openTickets.length})
                    </h3>
                    <TicketTable tickets={openTickets} />
                  </>
                )}

                {ticketsView === 'historico' && (
                  <>
                    <h3 style={{ margin: '16px 0', fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Histórico (Finalizados/Cancelados) ({completedTickets.length})</span>
                      {completedTickets.length > 0 && (
                        <button onClick={handleClearHistory} className="btn-ghost" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><FiTrash2 size={14} /> Limpar</button>
                      )}
                    </h3>
                    <TicketTable tickets={completedTickets} />
                  </>
                )}
              </div>
            )}

            {tab === 'users' && (
              <div>
                <div className="section-header">
                  <h3 className="section-title">Usuários ({commonUsers.length})</h3>
                  <button 
                    onClick={() => {
                      setUserRole('USER');
                      setShowUserModal(true);
                    }}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FiPlus size={18} /> Novo Usuário
                  </button>
                </div>
                <UserTable 
                  users={commonUsers} 
                  locals={localsHook.locals}
                  onDelete={handleDeleteUser}
                  onEdit={handleEditUser}
                  onViewDetails={handleViewUserDetails}
                  showLocal={true}
                />
              </div>
            )}

            {tab === 'tecnicos' && (
              <div>
                <div className="section-header">
                  <h3 className="section-title">Técnicos ({technicians.length})</h3>
                  <button
                    onClick={() => {
                      setUserRole('TECNICO');
                      setShowUserModal(true);
                    }}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FiPlus size={18} /> Novo Técnico
                  </button>
                </div>
                <UserTable 
                  users={technicians}
                  onDelete={handleDeleteUser}
                  onEdit={handleEditUser}
                  onViewDetails={handleViewUserDetails}
                  showLocal={false}
                />
              </div>
            )}

            {tab === 'locais' && (
              <div>
                <div className="section-header">
                  <h3 className="section-title">Locais ({localsHook.locals.length})</h3>
                  <button
                    onClick={() => {
                      setEditingLocal(null);
                      setShowLocalModal(true);
                    }}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FiPlus size={18} /> Novo Local
                  </button>
                </div>
                <LocalTable 
                  locals={localsHook.locals}
                  onDelete={handleDeleteLocal}
                  onEdit={handleEditLocal}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {credentialsModal && (
        <div className="modal-overlay" onClick={() => setCredentialsModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Credenciais Criadas</h3>
              <button className="modal-close" onClick={() => setCredentialsModal(null)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <p><strong>Nome:</strong> {credentialsModal.name}</p>
              <p><strong>Email:</strong> {credentialsModal.email}</p>
              <p><strong>Senha Temporária:</strong> {credentialsModal.tempPassword}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-ghost" onClick={() => setCredentialsModal(null)}>Fechar</button>
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

      {showUserDetailsModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Usuário</h3>
              <button className="modal-close" onClick={() => setShowUserDetailsModal(false)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Nome</label>
                  <p style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '500' }}>{selectedUser.name}</p>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>E-mail (Login)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ color: '#f8fafc', fontSize: '14px', fontFamily: 'monospace', backgroundColor: '#1f2937', padding: '8px 12px', borderRadius: '4px', flex: 1 }}>{selectedUser.email}</p>
                    <button 
                      className="btn-copy" 
                      onClick={() => handleCopyToClipboard(selectedUser.email, 'email')}
                    >
                      {copyFeedback.field === 'email' && copyFeedback.visible ? (
                        <>✓ Copiado</>
                      ) : (
                        <><FiCopy size={14} /> Copiar</>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Papel</label>
                  <p style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '500' }}>{selectedUser.role === 'USER' ? 'Usuário' : 'Técnico'}</p>
                </div>

                {selectedUser.role === 'USER' && selectedUser.localId && (
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Local</label>
                    <p style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '500' }}>
                      {localsHook.locals.find(l => l.id === selectedUser.localId)?.name || 'N/A'}
                    </p>
                  </div>
                )}

                {tempPassword && (
                  <div style={{ backgroundColor: '#1f2937', border: '1px solid #fbbf24', borderRadius: '6px', padding: '12px' }}>
                    <label style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiAlertCircle size={14} /> Senha Temporária Gerada</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ color: '#fef3c7', fontSize: '14px', fontFamily: 'monospace', backgroundColor: '#111827', padding: '8px 12px', borderRadius: '4px', flex: 1 }}>{tempPassword}</p>
                      <button 
                        className="btn-copy" 
                        onClick={() => handleCopyToClipboard(tempPassword, 'password')}
                      >
                        {copyFeedback.field === 'password' && copyFeedback.visible ? (
                          <>✓ Copiado</>
                        ) : (
                          <><FiCopy size={14} /> Copiar</>
                        )}
                      </button>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '12px', marginTop: '8px' }}>Compartilhe esta senha com o usuário para que ele possa fazer login.</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button 
                    onClick={handleResetPassword}
                    disabled={resettingPassword}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {resettingPassword ? 'Gerando...' : <><FiRefreshCw size={16} /> Resetar Senha</>}
                  </button>
                  <button 
                    onClick={() => setShowUserDetailsModal(false)}
                    className="btn-ghost"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
