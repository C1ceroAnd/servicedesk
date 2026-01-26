import { useState } from 'react';
import { FiTrash2, FiEye, FiX, FiEdit2 } from 'react-icons/fi';
import { User, Local } from '../../types';

interface UserTableProps {
  users: User[];
  locals?: Local[];
  onDelete: (id: number) => void;
  onViewDetails?: (user: User) => void;
  onEdit?: (user: User) => void;
  emptyMessage?: string;
  showLocal?: boolean;
}

export function UserTable({ 
  users, 
  locals = [], 
  onDelete, 
  onViewDetails,
  onEdit,
  emptyMessage = 'Nenhum usuário cadastrado',
  showLocal = true 
}: UserTableProps) {
  const [toDelete, setToDelete] = useState<number | null>(null);
  if (users.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  const getLocalName = (localId?: number) => {
    if (!localId) return '-';
    return locals.find(l => l.id === localId)?.name || '-';
  };

  const content = (
    <div className="table-container">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              {showLocal && <th>Local</th>}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {showLocal && <td>{getLocalName(user.localId)}</td>}
                <td style={{ display: 'flex', gap: '12px' }}>
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(user)}
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Editar usuário"
                    >
                      <FiEdit2 size={14} /> Editar
                    </button>
                  )}
                  {onViewDetails && (
                    <button 
                      onClick={() => onViewDetails(user)}
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Ver detalhes do usuário"
                    >
                      <FiEye size={14} /> Detalhes
                    </button>
                  )}
                  <button 
                    onClick={() => setToDelete(user.id)}
                    className="btn-danger"
                    style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Deletar usuário"
                  >
                    <FiTrash2 size={14} /> Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      {content}
      {toDelete !== null && (
        <div className="modal-overlay" onClick={() => setToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={() => setToDelete(null)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Deseja deletar este usuário? Esta ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-danger" onClick={() => { onDelete(toDelete!); setToDelete(null); }}>Deletar</button>
                <button className="btn-ghost" onClick={() => setToDelete(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
