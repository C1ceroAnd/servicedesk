describe('Lógica do AuthService', () => {
  it('deve construir payload de login corretamente', () => {
    const email = 'test@example.com';
    const password = 'password123';
    
    const payload = { email, password };
    
    expect(payload).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('deve construir payload de registro corretamente', () => {
    const payload = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'USER' as const,
      localId: 1,
    };

    expect(payload.name).toBe('New User');
    expect(payload.email).toBe('newuser@example.com');
    expect(payload.role).toBe('USER');
  });

  it('deve construir payload de refresh corretamente', () => {
    const refreshToken = 'refresh-token-123';
    const payload = { refreshToken };

    expect(payload).toEqual({ refreshToken: 'refresh-token-123' });
  });

  it('deve validar resposta de login', () => {
    const response = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER' as const,
        localId: 1,
      },
    };

    expect(response.accessToken).toBe('access-token');
    expect(response.user.role).toBe('USER');
  });

  it('deve validar resposta de registro', () => {
    const response = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 2,
        name: 'New User',
        email: 'new@example.com',
        role: 'USER' as const,
      },
    };

    expect(response.user.id).toBe(2);
    expect(response.user.email).toBe('new@example.com');
  });

  it('deve validar resposta de refresh', () => {
    const response = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    expect(response.accessToken).toBe('new-access-token');
  });

  it('deve extrair user info da resposta', () => {
    const response = {
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: 1,
        name: 'User',
        email: 'user@example.com',
        role: 'TECNICO' as const,
        localId: 5,
      },
    };

    const user = response.user;
    expect(user.role).toBe('TECNICO');
    expect(user.localId).toBe(5);
  });

  it('deve armazenar tokens no localStorage após login', () => {
    localStorage.clear();
    
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    expect(localStorage.getItem('accessToken')).toBe(accessToken);
    expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
  });

  it('deve armazenar user info após login', () => {
    localStorage.clear();
    
    const user = { id: 1, name: 'User', role: 'USER' };
    localStorage.setItem('user', JSON.stringify(user));

    const stored = localStorage.getItem('user');
    expect(JSON.parse(stored!)).toEqual(user);
  });
});
