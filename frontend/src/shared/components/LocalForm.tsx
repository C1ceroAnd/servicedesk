import { useState, FormEvent, useEffect } from 'react';
import { Modal } from './Modal';
import { Local } from '../../types';

interface LocalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<void>;
  editingLocal?: Local | null;
}

export function LocalForm({ isOpen, onClose, onSubmit, editingLocal }: LocalFormProps) {
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    if (editingLocal && isOpen) {
      setFormData({ name: editingLocal.name });
    } else if (!editingLocal && isOpen) {
      setFormData({ name: '' });
    }
  }, [editingLocal, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    if (!editingLocal) {
      setFormData({ name: '' });
    }
  };

  return (
    <Modal isOpen={isOpen} title={editingLocal ? 'Editar Local' : 'Criar Novo Local'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome *</label>
          <input
            type="text"
            placeholder="ex: Matriz, Filial, Sala 101"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Campo de endereço removido */}

        {/* Campo 'ativo' removido */}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button type="submit" className="btn-success">
            {editingLocal ? 'Salvar Alterações' : 'Criar Local'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
