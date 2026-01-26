import { useState } from 'react';
import { FiCheckCircle, FiX, FiCheck, FiRefreshCcw } from 'react-icons/fi';
import { TicketWithRelations } from '../../../types';

interface TicketTableProps {
  tickets: TicketWithRelations[];
  onAccept?: (ticketId: number) => void;
  onComplete?: (ticketId: number) => void;
  onCancel?: (ticketId: number) => void;
  onReject?: (ticketId: number) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const getStatusLabel = (status: string) => {
  const labels = {
    PENDING: 'Pendente',
    IN_PROGRESS: 'Em Progresso',
    COMPLETED: 'Finalizado',
    CANCELLED: 'Cancelado'
  };
  return labels[status as keyof typeof labels] || status;
};

export function TicketTable({ 
  tickets, 
  onAccept, 
  onComplete, 
  onCancel,
  onReject,
  showActions = false,
  emptyMessage = 'Nenhum chamado encontrado'
}: TicketTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<TicketWithRelations | null>(null);
  
  if (tickets.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Solicitante</th>
              <th>E-mail</th>
              <th>Local</th>
              <th>Técnico</th>
              <th>E-mail Técnico</th>
              <th>Status</th>
              {/* Prioridade removida */}
              <th>Aberto em</th>
              <th>Aceito em</th>
              <th>Fechado em</th>
              {showActions && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} style={{ cursor: 'pointer' }}>
                <td>{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>{ticket.user?.name || '-'}</td>
                <td>{ticket.user?.email || '-'}</td>
                <td>{ticket.local?.name || '-'}</td>
                <td>{ticket.tecnico?.name || '-'}</td>
                <td>{ticket.tecnico?.email || '-'}</td>
                <td>
                  <span className={`status-badge status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </td>
                {/* coluna de prioridade removida */}
                <td>{formatDateTime(ticket.createdAt)}</td>
                <td>{formatDateTime(ticket.dataAceito)}</td>
                <td>{formatDateTime(ticket.dataFechamento)}</td>
                {showActions && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {ticket.status === 'PENDING' && onAccept && (
                        <button onClick={() => onAccept(ticket.id)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}>
                          <FiCheck size={16} /> Aceitar
                        </button>
                      )}
                      {ticket.status === 'PENDING' && onCancel && (
                        <button onClick={() => onCancel(ticket.id)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}>
                          <FiX size={16} /> Cancelar
                        </button>
                      )}
                      {ticket.status === 'IN_PROGRESS' && onComplete && (
                        <button onClick={() => onComplete(ticket.id)} className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}>
                          <FiCheckCircle size={16} /> Finalizar
                        </button>
                      )}
                      {ticket.status === 'IN_PROGRESS' && onReject && (
                        <button onClick={() => onReject(ticket.id)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}>
                          <FiRefreshCcw size={16} /> Desistir
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Detalhes do Chamado #{selectedTicket.id}</h3>
              <button className="modal-close" onClick={() => setSelectedTicket(null)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Título</label>
                  <p style={{ color: '#f8fafc', fontSize: '16px' }}>{selectedTicket.title}</p>
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Descrição</label>
                  <p style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedTicket.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Status</label>
                    <span className={`status-badge status-${selectedTicket.status.toLowerCase().replace('_', '-')}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Local</label>
                    <p style={{ color: '#e5e7eb' }}>{selectedTicket.local?.name || '-'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Solicitante</label>
                    <p style={{ color: '#e5e7eb' }}>{selectedTicket.user?.name || '-'}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>E-mail</label>
                    <p style={{ color: '#e5e7eb' }}>{selectedTicket.user?.email || '-'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Técnico</label>
                    <p style={{ color: '#e5e7eb' }}>{selectedTicket.tecnico?.name || '-'}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>E-mail Técnico</label>
                    <p style={{ color: '#e5e7eb' }}>{selectedTicket.tecnico?.email || '-'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Aberto em</label>
                    <p style={{ color: '#e5e7eb', fontSize: '13px' }}>{formatDateTime(selectedTicket.createdAt)}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Aceito em</label>
                    <p style={{ color: '#e5e7eb', fontSize: '13px' }}>{formatDateTime(selectedTicket.dataAceito)}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9ba3b4', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Fechado em</label>
                    <p style={{ color: '#e5e7eb', fontSize: '13px' }}>{formatDateTime(selectedTicket.dataFechamento)}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <button className="btn-ghost" onClick={() => setSelectedTicket(null)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
