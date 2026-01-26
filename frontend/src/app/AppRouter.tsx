import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from '../shared/components';
import { AdminDashboard } from '../features/users/pages';
import { TecnicoDashboard, UserDashboard } from '../features/tickets/pages';
import { LoginPage } from '../features/auth/pages';
import { useAuth } from '../features/auth/hooks';

export function AppRouter() {
  const { isAuthenticated, user } = useAuth();

  // Send each role to its home dashboard
  const homePath = !user
    ? '/'
    : user.role === 'ADMIN'
      ? '/admin'
      : user.role === 'TECNICO'
        ? '/tecnico'
        : '/user';

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Default redirect based on role */}
      <Route path="/" element={<Navigate to={homePath} replace />} />

      <Route
        path="/admin"
        element={
          <RoleGuard allow={['ADMIN']}>
            <AdminDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/tecnico"
        element={
          <RoleGuard allow={['TECNICO']}>
            <TecnicoDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/user"
        element={
          <RoleGuard allow={['USER']}>
            <UserDashboard />
          </RoleGuard>
        }
      />

      {/* Catch-all goes to the proper home */}
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}
