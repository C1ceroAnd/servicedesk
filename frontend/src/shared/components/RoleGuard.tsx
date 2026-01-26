import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { ReactNode } from 'react';

type Role = 'ADMIN' | 'TECNICO' | 'USER';

export function RoleGuard({ children, allow }: { children: ReactNode; allow: Role[] }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !allow.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
