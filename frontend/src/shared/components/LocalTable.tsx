import { useState } from 'react';
import { FiTrash2, FiX, FiEdit2 } from 'react-icons/fi';
import { Local } from '../../types';

interface LocalTableProps {
  locals: Local[];
  onDelete: (id: number) => void;
  onEdit?: (local: Local) => void;
  emptyMessage?: string;
}

export function LocalTable({ 
  locals, 
  onDelete,
  onEdit,
  emptyMessage = 'Nenhum local cadastrado' 
}: LocalTableProps) {
  const [toDelete, setToDelete] = useState<number | null>(null);
  if (locals.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  const content = (
    <div className="table-container">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              {/* Coluna 'Ativo' removida */}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {locals.map(local => (
              <tr key={local.id}>
                <td>{local.name}</td>
                {/* Coluna 'Ativo' removida */}
                <td style={{ display: 'flex', gap: '12px' }}>
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(local)}
                      className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                    >
                      <FiEdit2 size={14} /> Editar
                    </button>
                  )}
                  <button 
                    onClick={() => setToDelete(local.id)}
                    className="btn-danger"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
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
              <p>Deseja deletar este local? Esta ação não pode ser desfeita.</p>
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