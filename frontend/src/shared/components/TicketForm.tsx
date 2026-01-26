import { useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { TicketFormData, Local } from '../../types';

interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TicketFormData) => Promise<void>;
  locals: Local[];
  userLocalId?: number;
}

export function TicketForm({ isOpen, onClose, onSubmit, locals, userLocalId }: TicketFormProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    localId: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ title: '', description: '', localId: '' });
  };

  return (
    <Modal isOpen={isOpen} title="Criar Novo Chamado" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
          />
        </div>

        {/* Prioridade removida para simplificar criação de chamados */}

        {!userLocalId && (
          <div className="form-group">
            <label>Local *</label>
            <select
              value={formData.localId}
              onChange={(e) => setFormData({ ...formData, localId: e.target.value })}
              required
            >
              <option value="">Selecione um local</option>
              {locals.map(local => (
                <option key={local.id} value={local.id}>
                  {local.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button type="submit" className="btn-success">
            Criar Chamado
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
