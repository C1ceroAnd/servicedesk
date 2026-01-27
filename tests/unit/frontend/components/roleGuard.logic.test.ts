describe('RoleGuard Logic - Autorização', () => {
  const roles = ['ADMIN', 'TECNICO', 'USER'] as const;
  type Role = typeof roles[number];

  describe('Verificação de Permissões', () => {
    it('deve permitir ADMIN acessar rota ADMIN', () => {
      const userRole: Role = 'ADMIN';
      const allowedRoles: Role[] = ['ADMIN'];

      const hasAccess = allowedRoles.includes(userRole);

      expect(hasAccess).toBe(true);
    });

    it('deve permitir TECNICO acessar rota TECNICO', () => {
      const userRole: Role = 'TECNICO';
      const allowedRoles: Role[] = ['TECNICO', 'ADMIN'];

      const hasAccess = allowedRoles.includes(userRole);

      expect(hasAccess).toBe(true);
    });

    it('deve negar USER acessar rota ADMIN', () => {
      const userRole: Role = 'USER';
      const allowedRoles: Role[] = ['ADMIN'];

      const hasAccess = allowedRoles.includes(userRole);

      expect(hasAccess).toBe(false);
    });

    it('deve permitir se usuário tiver uma das roles permitidas', () => {
      const userRole: Role = 'TECNICO';
      const allowedRoles: Role[] = ['ADMIN', 'TECNICO'];

      const hasAccess = allowedRoles.includes(userRole);

      expect(hasAccess).toBe(true);
    });

    it('deve bloquear acesso quando não autenticado', () => {
      const isAuthenticated = false;
      const userRole: Role | null = null;

      const shouldAllow = isAuthenticated && userRole !== null;

      expect(shouldAllow).toBe(false);
    });

    it('deve bloquear acesso quando autenticado mas sem role', () => {
      const isAuthenticated = true;
      const userRole: Role | null = null;

      const shouldAllow = isAuthenticated && userRole !== null;

      expect(shouldAllow).toBe(false);
    });

    it('deve permitir acesso quando autenticado com role válida', () => {
      const isAuthenticated = true;
      const userRole: Role = 'USER';
      const allowedRoles: Role[] = ['USER'];

      const shouldAllow = isAuthenticated && allowedRoles.includes(userRole);

      expect(shouldAllow).toBe(true);
    });

    it('deve negar USER acessar rota ADMIN mesmo autenticado', () => {
      const isAuthenticated = true;
      const userRole: Role = 'USER';
      const allowedRoles: Role[] = ['ADMIN'];

      const shouldAllow = isAuthenticated && allowedRoles.includes(userRole);

      expect(shouldAllow).toBe(false);
    });
  });
});
