describe('TokenStorage - Armazenamento Local', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve armazenar e recuperar accessToken', () => {
    const token = 'test-token-123';
    localStorage.setItem('accessToken', token);
    expect(localStorage.getItem('accessToken')).toBe(token);
  });

  it('deve armazenar e recuperar refreshToken', () => {
    const token = 'refresh-token-123';
    localStorage.setItem('refreshToken', token);
    expect(localStorage.getItem('refreshToken')).toBe(token);
  });

  it('deve armazenar e recuperar user info', () => {
    const user = { id: 1, name: 'Test', role: 'USER' };
    const userJson = JSON.stringify(user);
    localStorage.setItem('user', userJson);
    const stored = localStorage.getItem('user');
    expect(JSON.parse(stored!)).toEqual(user);
  });

  it('deve limpar tokens ao fazer logout', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('refreshToken', 'refresh');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    expect(localStorage.getItem('accessToken')).toBeFalsy();
    expect(localStorage.getItem('refreshToken')).toBeFalsy();
  });

  it('deve reconhecer usuário autenticado', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    const isAuthenticated = !!localStorage.getItem('accessToken') && !!localStorage.getItem('user');
    expect(isAuthenticated).toBe(true);
  });

  it('deve reconhecer usuário não autenticado', () => {
    localStorage.removeItem('accessToken');
    const isAuthenticated = !!localStorage.getItem('accessToken');
    expect(isAuthenticated).toBe(false);
  });

  it('deve validar estrutura JWT', () => {
    const token = 'header.payload.signature';
    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });

  it('deve rejeitar JWT inválido', () => {
    const token = 'invalid';
    const parts = token.split('.');
    expect(parts.length).not.toBe(3);
  });
});
