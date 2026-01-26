import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/contexts';
import { useAuth } from './features/auth/hooks';
import { Header } from './shared/components';
import { AppRouter } from './app/AppRouter';

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div>
      <Header 
        userName={user?.name || 'Usuário'} 
        userRole={user?.role || 'USER'}
        onLogout={logout}
      />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

function AppContent() {
  useAuth();
  return <AppRouter />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <AppContent />
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
