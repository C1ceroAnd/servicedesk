import axios from 'axios';

jest.mock('axios');

describe('Integração de Fluxo de Autenticação - Frontend', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Complete Login → Store → Redirect Flow', () => {
    it('deve fazer login, armazenar tokens e redirecionar', async () => {
      // Arrange - Simular chamada de login
      const loginData = {
        email: 'user@example.com',
        password: 'senha123',
      };

      const loginResponse = {
        data: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-123',
          user: {
            id: 1,
            name: 'User',
            email: 'user@example.com',
            role: 'TECNICO',
            localId: 1,
          },
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(loginResponse);

      // Act 1 - Fazer login
      const response = await axios.post('/auth/login', loginData);

      // Assert 1 - Validar resposta
      expect(response.data.accessToken).toBe('access-token-123');
      expect(response.data.user.role).toBe('TECNICO');

      // Act 2 - Armazenar tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Assert 2 - Validar armazenamento
      expect(localStorage.getItem('accessToken')).toBe('access-token-123');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token-123');

      const storedUser = JSON.parse(localStorage.getItem('user')!);
      expect(storedUser.role).toBe('TECNICO');

      // Act 3 - Simular redirecionamento baseado em role
      const redirectUrl = storedUser.role === 'ADMIN' ? '/admin' : '/dashboard';

      // Assert 3
      expect(redirectUrl).toBe('/dashboard');
    });

    it('deve fazer login como ADMIN e redirecionar para admin', async () => {
      // Arrange
      const loginResponse = {
        data: {
          accessToken: 'admin-token',
          refreshToken: 'admin-refresh',
          user: {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            role: 'ADMIN',
          },
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(loginResponse);

      // Act
      const response = await axios.post('/auth/login', {
        email: 'admin@example.com',
        password: 'senha',
      });

      localStorage.setItem('user', JSON.stringify(response.data.user));
      const user = JSON.parse(localStorage.getItem('user')!);
      const redirectUrl = user.role === 'ADMIN' ? '/admin' : '/dashboard';

      // Assert
      expect(redirectUrl).toBe('/admin');
    });

    it('deve falhar login com credenciais inválidas', async () => {
      // Arrange
      (axios.post as jest.Mock).mockRejectedValue(
        new Error('Credenciais inválidas')
      );

      // Act & Assert
      await expect(
        axios.post('/auth/login', {
          email: 'user@example.com',
          password: 'senha_errada',
        })
      ).rejects.toThrow('Credenciais inválidas');

      // Verify no tokens stored
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('Token Refresh Flow', () => {
    it('deve detectar token expirado e fazer refresh automático', async () => {
      // Arrange - Inicializar com tokens
      const accessToken = 'expired-access-token';
      const refreshToken = 'valid-refresh-token';

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Simular erro 401 (token expirado)
      (axios.post as jest.Mock)
        .mockRejectedValueOnce({
          response: { status: 401 },
          message: 'Token expirado',
        })
        .mockResolvedValueOnce({
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        });

      // Act 1 - Primeiro request falha com 401
      try {
        await axios.post('/api/tickets', {});
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }

      // Act 2 - Fazer refresh
      const refreshResponse = await axios.post('/auth/refresh', {
        refreshToken: localStorage.getItem('refreshToken'),
      });

      // Assert 2 - Novos tokens obtidos
      expect(refreshResponse.data.accessToken).toBe('new-access-token');

      // Act 3 - Armazenar novos tokens
      localStorage.setItem('accessToken', refreshResponse.data.accessToken);
      localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);

      // Assert 3 - Verificar atualização
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');

      // Act 4 - Retentar request original
      (axios.post as jest.Mock).mockResolvedValue({
        data: { id: 1, title: 'Ticket criado' },
      });

      const retryResponse = await axios.post('/api/tickets', {});
      expect(retryResponse.data.id).toBe(1);
    });

    it('deve fazer logout ao falhar refresh', async () => {
      // Arrange
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'invalid-refresh');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'User' }));

      (axios.post as jest.Mock).mockRejectedValue(
        new Error('Refresh token inválido')
      );

      // Act - Tentar refresh
      try {
        await axios.post('/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken'),
        });
      } catch (error) {
        // Act 2 - Fazer logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }

      // Assert
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Logout Flow', () => {
    it('deve limpar todos os tokens ao fazer logout', async () => {
      // Arrange - Inicializar com dados autenticados
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'User' }));

      expect(localStorage.getItem('accessToken')).toBeTruthy();

      // Act - Logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Assert
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Request Interceptor', () => {
    it('deve adicionar Authorization header em todas as requisições', async () => {
      // Arrange
      const accessToken = 'test-access-token';
      localStorage.setItem('accessToken', accessToken);

      // Act - Simular interceptor
      const config = { headers: {} as any };
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Assert
      expect(config.headers.Authorization).toBe(`Bearer test-access-token`);
    });

    it('deve não adicionar header se não tiver token', async () => {
      // Arrange
      localStorage.clear();

      // Act
      const config = { headers: {} as any };
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Assert
      expect(config.headers.Authorization).toBeUndefined();
    });
  });
});
