import { JwtTokenProvider } from '../../../../src/infrastructure/providers/JwtTokenProvider';

describe('Provedor de Token JWT', () => {
  let provider: JwtTokenProvider;

  beforeEach(() => {
    provider = new JwtTokenProvider();
  });

  describe('sign', () => {
    it('deve gerar um token JWT válido', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = provider.sign(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('deve permitir opções customizadas', () => {
      const payload = { userId: 1 };
      const token = provider.sign(payload, { expiresIn: '1h' });

      expect(token).toBeDefined();
    });
  });

  describe('verifyAccessToken', () => {
    it('deve verificar um token de acesso válido', () => {
      const payload = { userId: 1, role: 'ADMIN' };
      const token = provider.signAccessToken(payload);
      const decoded = provider.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect((decoded as any).userId).toBe(1);
    });

    it('deve lançar erro para token de acesso inválido', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        provider.verifyAccessToken(invalidToken);
      }).toThrow('Token de acesso inválido');
    });
  });

  describe('verifyRefreshToken', () => {
    it('deve verificar um refresh token válido', () => {
      const payload = { userId: 1 };
      const token = provider.signRefreshToken(payload);
      const decoded = provider.verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect((decoded as any).userId).toBe(1);
    });

    it('deve lançar erro para refresh token inválido', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        provider.verifyRefreshToken(invalidToken);
      }).toThrow();
    });
  });

  describe('signTokenPair', () => {
    it('deve gerar par de tokens (access + refresh)', () => {
      const payload = { userId: 1 };
      const tokenPair = provider.signTokenPair(payload);

      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(typeof tokenPair.accessToken).toBe('string');
      expect(typeof tokenPair.refreshToken).toBe('string');
    });
  });
});
