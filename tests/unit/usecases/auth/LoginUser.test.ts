import { LoginUser, LoginInput } from '../../../../src/application/usecases/auth/LoginUser';
import { IUserRepository } from '../../../../src/application/ports/repositories';
import { IPasswordHasher } from '../../../../src/application/ports/providers';
import type { JwtTokenProvider } from '../../../../src/infrastructure/providers/JwtTokenProvider';

describe('LoginUser', () => {
  let loginUser: LoginUser;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockTokenProvider: jest.Mocked<JwtTokenProvider>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockTokenProvider = {
      sign: jest.fn(),
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      signTokenPair: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as any;

    loginUser = new LoginUser(mockUserRepository, mockPasswordHasher, mockTokenProvider as any);
  });

  it('deve fazer login com credenciais válidas', async () => {
    const input: LoginInput = {
      email: 'user@example.com',
      password: 'senha123',
    };

    const mockUser = {
      id: 1,
      email: 'user@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      role: 'CLIENTE' as const,
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockTokenProvider.signTokenPair.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await loginUser.execute(input);

    expect(result.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      localId: mockUser.localId,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    });
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(input.password, mockUser.password);
  });

  it('deve lançar erro se o email não existir', async () => {
    const input: LoginInput = {
      email: 'naoexiste@example.com',
      password: 'senha123',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(loginUser.execute(input)).rejects.toThrow('Credenciais inválidas');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
  });

  it('deve lançar erro se a senha estiver incorreta', async () => {
    const input: LoginInput = {
      email: 'user@example.com',
      password: 'senhaErrada',
    };

    const mockUser = {
      id: 1,
      email: 'user@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      role: 'CLIENTE' as const,
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(false);

    await expect(loginUser.execute(input)).rejects.toThrow('Credenciais inválidas');
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(input.password, mockUser.password);
    expect(mockTokenProvider.signTokenPair).not.toHaveBeenCalled();
  });
});
