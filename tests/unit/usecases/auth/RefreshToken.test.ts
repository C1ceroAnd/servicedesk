import { RefreshToken } from '../../../../src/application/usecases/auth/RefreshToken';
import type { JwtTokenProvider } from '../../../../src/infrastructure/providers/JwtTokenProvider';

describe('RefreshToken', () => {
  let refreshToken: RefreshToken;
  let mockTokenProvider: jest.Mocked<JwtTokenProvider>;

  beforeEach(() => {
    mockTokenProvider = {
      sign: jest.fn(),
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      signTokenPair: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as any;

    refreshToken = new RefreshToken(mockTokenProvider as any);
  });

  it('deve gerar novo par de tokens a partir de refresh token válido', async () => {
    const oldRefreshToken = 'valid-refresh-token';
    const payload = {
      id: 1,
      email: 'user@example.com',
      role: 'USER',
    };

    mockTokenProvider.verifyRefreshToken.mockReturnValue(payload);
    mockTokenProvider.signTokenPair.mockReturnValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const result = await refreshToken.execute(oldRefreshToken);

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(mockTokenProvider.verifyRefreshToken).toHaveBeenCalledWith(oldRefreshToken);
    expect(mockTokenProvider.signTokenPair).toHaveBeenCalledWith({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
  });

  it('deve lançar erro se refresh token for inválido', async () => {
    const invalidToken = 'invalid-refresh-token';

    mockTokenProvider.verifyRefreshToken.mockImplementation(() => {
      throw new Error('Token inválido');
    });

    await expect(refreshToken.execute(invalidToken)).rejects.toThrow('Token inválido');
    expect(mockTokenProvider.signTokenPair).not.toHaveBeenCalled();
  });

  it('deve lançar erro se refresh token estiver expirado', async () => {
    const expiredToken = 'expired-refresh-token';

    mockTokenProvider.verifyRefreshToken.mockImplementation(() => {
      throw new Error('Token expirado');
    });

    await expect(refreshToken.execute(expiredToken)).rejects.toThrow('Token expirado');
    expect(mockTokenProvider.signTokenPair).not.toHaveBeenCalled();
  });
});
