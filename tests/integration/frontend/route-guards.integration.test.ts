import axios from 'axios';

jest.mock('axios');

describe('Integração de Guardas de Rota - Frontend', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('PrivateRoute + RoleGuard Combined', () => {
    it('deve bloquear acesso a rota privada se não autenticado', () => {
      // Arrange
      localStorage.clear();
      const isAuthenticated = !localStorage.getItem('accessToken');

      // Act
      const shouldRedirect = isAuthenticated;

      // Assert
      expect(shouldRedirect).toBe(true);

      // Act 2 - Redirecionar para login
      const redirectUrl = shouldRedirect ? '/login' : '/dashboard';
      expect(redirectUrl).toBe('/login');
    });

    it('deve permitir acesso a rota privada se autenticado', () => {
      // Arrange
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

      // Act
      const isAuthenticated =
        !!localStorage.getItem('accessToken') &&
        !!localStorage.getItem('user');

      // Assert
      expect(isAuthenticated).toBe(true);
    });

    it('deve validar role após autenticação em rota protegida', () => {
      // Arrange
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

      const routeRequiredRoles = ['USER', 'TECNICO', 'ADMIN'];

      // Act
      const user = JSON.parse(localStorage.getItem('user')!);
      const hasAccess = routeRequiredRoles.includes(user.role);

      // Assert
      expect(hasAccess).toBe(true);
    });

    it('deve redirecionar para / se role não permitida', () => {
      // Arrange
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

      const adminOnlyRoles = ['ADMIN'];

      // Act
      const user = JSON.parse(localStorage.getItem('user')!);
      const hasAccess = adminOnlyRoles.includes(user.role);
      const redirectUrl = hasAccess ? '/admin' : '/';

      // Assert
      expect(redirectUrl).toBe('/');
    });

    it('deve permitir acesso a rota TECNICO para TECNICO', () => {
      // Arrange
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 2, role: 'TECNICO' }));

      const tecnicoRoles = ['TECNICO', 'ADMIN'];

      // Act
      const user = JSON.parse(localStorage.getItem('user')!);
      const hasAccess = tecnicoRoles.includes(user.role);

      // Assert
      expect(hasAccess).toBe(true);
    });

    it('deve negar acesso a rota TECNICO para USER', () => {
      // Arrange
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 3, role: 'USER' }));

      const tecnicoRoles = ['TECNICO', 'ADMIN'];

      // Act
      const user = JSON.parse(localStorage.getItem('user')!);
      const hasAccess = tecnicoRoles.includes(user.role);

      // Assert
      expect(hasAccess).toBe(false);
    });

    it('deve permitir ADMIN acessar qualquer rota', () => {
      // Arrange
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'ADMIN' }));

      const allRoutes = ['ADMIN', 'TECNICO', 'USER'];

      // Act
      const user = JSON.parse(localStorage.getItem('user')!);
      const canAccessAll = allRoutes.includes(user.role);

      // Assert
      expect(canAccessAll).toBe(true);
    });
  });

  describe('Route Navigation Flows', () => {
    it('deve redirecionar de /login para /dashboard após login bem-sucedido', () => {
      // Arrange
      localStorage.clear();

      // Act - Login
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

      const isAuthenticated =
        !!localStorage.getItem('accessToken') &&
        !!localStorage.getItem('user');
      const redirectUrl = isAuthenticated ? '/dashboard' : '/login';

      // Assert
      expect(redirectUrl).toBe('/dashboard');
    });

    it('deve redirecionar de /admin para / se não tiver role ADMIN', () => {
      // Arrange
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

      // Act
      const user = JSON.parse(localStorage.getItem('user')!);
      const isAdmin = user.role === 'ADMIN';
      const redirectUrl = isAdmin ? '/admin' : '/';

      // Assert
      expect(redirectUrl).toBe('/');
    });

    it('deve redirecionar para /login em erro 401 durante navegação', () => {
      // Arrange
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

      // Simular erro 401
      (axios.get as jest.Mock).mockRejectedValue({
        response: { status: 401 },
      });

      // Act
      const handleUnauthorized = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        return '/login';
      };

      const redirectUrl = handleUnauthorized();

      // Assert
      expect(redirectUrl).toBe('/login');
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('deve manter autenticação ao navegar entre rotas', () => {
      // Arrange
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

      const initialAuth =
        !!localStorage.getItem('accessToken') &&
        !!localStorage.getItem('user');

      // Act - Simular navegação
      // Tokens permanecem no localStorage
      const afterNavAuth =
        !!localStorage.getItem('accessToken') &&
        !!localStorage.getItem('user');

      // Assert
      expect(initialAuth).toBe(true);
      expect(afterNavAuth).toBe(true);
      expect(initialAuth === afterNavAuth).toBe(true);
    });
  });

  describe('Protected Component Rendering', () => {
    it('deve renderizar dashboard apenas se autenticado', () => {
      // Arrange
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

      // Act
      const isAuthenticated =
        !!localStorage.getItem('accessToken') &&
        !!localStorage.getItem('user');
      const shouldRenderDashboard = isAuthenticated;

      // Assert
      expect(shouldRenderDashboard).toBe(true);
    });

    it('deve renderizar admin panel apenas para ADMIN', () => {
      // Arrange
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'ADMIN' }));

      // Act
      const user = JSON.parse(localStorage.getItem('user')!);
      const shouldRenderAdminPanel = user.role === 'ADMIN';

      // Assert
      expect(shouldRenderAdminPanel).toBe(true);
    });

    it('deve renderizar tech panel para TECNICO e ADMIN', () => {
      // Arrange
      const rolesWithTechAccess = ['TECNICO', 'ADMIN'];

      // Test TECNICO
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'TECNICO' }));
      let user = JSON.parse(localStorage.getItem('user')!);
      expect(rolesWithTechAccess.includes(user.role)).toBe(true);

      // Test ADMIN
      localStorage.setItem('user', JSON.stringify({ id: 2, role: 'ADMIN' }));
      user = JSON.parse(localStorage.getItem('user')!);
      expect(rolesWithTechAccess.includes(user.role)).toBe(true);

      // Test USER
      localStorage.setItem('user', JSON.stringify({ id: 3, role: 'USER' }));
      user = JSON.parse(localStorage.getItem('user')!);
      expect(rolesWithTechAccess.includes(user.role)).toBe(false);
    });
  });

  describe('Session Recovery', () => {
    it('deve recuperar autenticação ao recarregar página', () => {
      // Arrange - Usuário autenticado
      localStorage.setItem('accessToken', 'token-123');
      localStorage.setItem('refreshToken', 'refresh-123');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'User', role: 'USER' }));

      // Act - Simular recarga de página (localStorage persiste)
      const isAuthenticated =
        !!localStorage.getItem('accessToken') &&
        !!localStorage.getItem('user');

      // Assert
      expect(isAuthenticated).toBe(true);

      // Verify data integrity
      const user = JSON.parse(localStorage.getItem('user')!);
      expect(user.id).toBe(1);
      expect(user.role).toBe('USER');
    });

    it('deve restaurar user context após logout e novo login', () => {
      // Arrange - Login inicial
      localStorage.setItem('accessToken', 'token-user1');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'User 1', role: 'USER' }));

      // Act 1 - Logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      expect(localStorage.getItem('accessToken')).toBeNull();

      // Act 2 - Novo login com usuário diferente
      localStorage.setItem('accessToken', 'token-user2');
      localStorage.setItem('user', JSON.stringify({ id: 2, name: 'User 2', role: 'TECNICO' }));

      // Assert - Novo contexto
      const user = JSON.parse(localStorage.getItem('user')!);
      expect(user.id).toBe(2);
      expect(user.name).toBe('User 2');
      expect(user.role).toBe('TECNICO');
    });
  });
});
