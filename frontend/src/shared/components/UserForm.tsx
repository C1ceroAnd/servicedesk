import { useState, FormEvent, useEffect } from 'react';
import { Modal } from './Modal';
import { UserFormData, User } from '../../types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  role: 'USER' | 'TECNICO';
  editingUser?: User | null;
  locals?: { id: number; name: string }[];
}

export function UserForm({ isOpen, onClose, onSubmit, role, editingUser, locals = [] }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role,
    localId: ''
  });

  useEffect(() => {
    if (editingUser && isOpen) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        role: (editingUser.role === 'USER' || editingUser.role === 'TECNICO') ? editingUser.role : 'USER',
        localId: editingUser.localId?.toString() || ''
      });
    } else if (!editingUser && isOpen) {
      setFormData({
        name: '',
        email: '',
        role,
        localId: ''
      });
    }
  }, [editingUser, isOpen, role]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    if (!editingUser) {
      setFormData({ name: '', email: '', role, localId: '' });
    }
  };

  const title = editingUser ? 'Editar Usuário' : (role === 'TECNICO' ? 'Criar Novo Técnico' : 'Criar Novo Usuário');

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        {/* Campo de senha removido: senha será gerada automaticamente */}

        {role !== 'TECNICO' && (
          <div className="form-group">
            <label>Local {editingUser ? '(deixe em branco para não alterar)' : '*'}</label>
            <select
              value={formData.localId}
              onChange={(e) => setFormData({ ...formData, localId: e.target.value })}
              required={!editingUser}
            >
              <option value="">Selecione um local</option>
              {locals.map(local => (
                <option key={local.id} value={local.id.toString()}>{local.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button type="submit" className="btn-success">
            {editingUser ? 'Salvar Alterações' : (role === 'TECNICO' ? 'Criar Técnico' : 'Criar Usuário')}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
