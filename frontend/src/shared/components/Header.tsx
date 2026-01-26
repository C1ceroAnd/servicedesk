import { FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  userName: string;
  userRole: 'ADMIN' | 'TECNICO' | 'USER';
  onLogout: () => void;
}

export function Header({ userName, userRole, onLogout }: HeaderProps) {

  const roleLabel = {
    ADMIN: 'Administrador',
    TECNICO: 'Técnico',
    USER: 'Usuário'
  }[userRole] || userRole;

  const roleBadgeClass = {
    ADMIN: 'role-badge-admin',
    TECNICO: 'role-badge-tecnico',
    USER: 'role-badge-user'
  }[userRole] || '';

  const initials = userName
    ? userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('')
    : 'SD';

  return (
    <header className="app-header">
      <div className="app-header__bar">
        <div className="app-header__brand">
          <div className="app-header__logo">SD</div>
          <div>
            <div className="app-header__title">ServiceDesk</div>
            <div className="app-header__subtitle">Sistema de Chamados</div>
          </div>
        </div>

        <div className="app-header__actions">
          <div className="app-header__user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="app-header__avatar">{initials}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="app-header__name">{userName}</div>
              <span className={`role-badge ${roleBadgeClass}`}>{roleLabel}</span>
            </div>
          </div>

          <button className="btn-ghost" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiLogOut size={18} /> Sair
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
