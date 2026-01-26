import { useState } from 'react';

interface TicketCardProps {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  local?: { name: string };
  user?: { name: string; email: string };
  tecnico?: { name: string };
  solution?: string;
  closedAt?: string;
  onAccept?: () => void;
  onFinalize?: () => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

const statusLabel: Record<TicketCardProps['status'], string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Atendimento',
  COMPLETED: 'Finalizado',
};


export function TicketCard({
  id,
  title,
  description,
  status,
  createdAt,
  local,
  user,
  tecnico,
  solution,
  closedAt,
  onAccept,
  onFinalize,
  showActions = false,
  variant = 'default',
}: TicketCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [solutionText] = useState('');

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>#{id}</span>
            <span className={`status-badge status-${status.toLowerCase().replace('_', '-')}`}>{statusLabel[status]}</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>{title}</h3>
        </div>
      </div>

      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: '4px 0 12px 0', lineHeight: 1.5 }}>
        {variant === 'compact' ? description.slice(0, 120) + (description.length > 120 ? '…' : '') : description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
        {local && (
          <span>
            <strong>Local:</strong> {local.name}
          </span>
        )}
        {user && (
          <span>
            <strong>Solicitante:</strong> {user.name}
          </span>
        )}
        {tecnico && (
          <span>
            <strong>Técnico:</strong> {tecnico.name}
          </span>
        )}
        <span>
          <strong>Criado:</strong> {formatDate(createdAt)}
        </span>
      </div>

      {solution && (
        <div className="success" style={{ margin: '12px 0', padding: '12px', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-success)' }}>Solução:</p>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-text)' }}>{solution}</p>
          {closedAt && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Finalizado em: {formatDate(closedAt)}
            </p>
          )}
        </div>
      )}

      {showActions && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {status === 'PENDING' && onAccept && (
            <button className="btn-success" onClick={onAccept}>
              ✓ Aceitar Chamado
            </button>
          )}
          {status === 'IN_PROGRESS' && onFinalize && (
            <button className="btn-primary" onClick={() => onFinalize()}>
              ✓ Finalizar Chamado
            </button>
          )}
        </div>
      )}

      {!tecnico && status === 'PENDING' && !showActions && (
        <div className="info" style={{ marginTop: '8px', color: 'var(--color-warning)' }}>
          Aguardando atendimento...
        </div>
      )}
    </div>
  );
}

export default TicketCard;
