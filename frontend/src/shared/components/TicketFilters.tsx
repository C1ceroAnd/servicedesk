import { User, Local } from '../../types';
import { FiFilter } from 'react-icons/fi';

interface TicketFiltersProps {
  statusFilter: string;
  tecnicoFilter: string;
  localFilter: string;
  onStatusChange: (value: string) => void;
  onTecnicoChange: (value: string) => void;
  onLocalChange: (value: string) => void;
  technicians: User[];
  locals: Local[];
}

export function TicketFilters({
  statusFilter,
  tecnicoFilter,
  localFilter,
  onStatusChange,
  onTecnicoChange,
  onLocalChange,
  technicians,
  locals
}: TicketFiltersProps) {
  return (
    <div className="filters-section">
      <div className="filters-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiFilter size={18} /> Filtros:</div>
      <div className="filters-grid">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Status</label>
          <select value={statusFilter} onChange={e => onStatusChange(e.target.value)}>
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="IN_PROGRESS">Em Atendimento</option>
            <option value="COMPLETED">Finalizado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Técnico</label>
          <select value={tecnicoFilter} onChange={e => onTecnicoChange(e.target.value)}>
            <option value="">Todos</option>
            {technicians.map(tec => (
              <option key={tec.id} value={tec.id}>{tec.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Local</label>
          <select value={localFilter} onChange={e => onLocalChange(e.target.value)}>
            <option value="">Todos</option>
            {locals.map(local => (
              <option key={local.id} value={local.id}>{local.name}</option>
            ))}
          </select>
        </div>

        {/* Filtro de prioridade removido */}
      </div>
    </div>
  );
}
