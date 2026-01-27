import { RegisterUser, RegisterInput } from '../../../../src/application/usecases/auth/RegisterUser';
import { IUserRepository, ILocalRepository } from '../../../../src/application/ports/repositories';
import { IPasswordHasher } from '../../../../src/application/ports/providers';

describe('RegisterUser', () => {
  let registerUser: RegisterUser;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockLocalRepository: jest.Mocked<ILocalRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockLocalRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      listActive: jest.fn(),
      delete: jest.fn(),
      hasOpenTickets: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    registerUser = new RegisterUser(mockUserRepository, mockLocalRepository, mockPasswordHasher);
  });

  it('deve registrar um novo usuário ADMIN sem localId', async () => {
    const input: RegisterInput = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'senha123',
      role: 'ADMIN',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
    mockUserRepository.create.mockResolvedValue({
      id: 1,
      name: input.name,
      email: input.email,
      password: 'hashedPassword',
      role: 'ADMIN',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await registerUser.execute(input);

    expect(result.role).toBe('ADMIN');
    expect(result.localId).toBeNull();
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(input.password);
    expect(mockUserRepository.create).toHaveBeenCalled();
  });

  it('deve registrar um novo usuário USER com localId', async () => {
    const input: RegisterInput = {
      name: 'User',
      email: 'user@example.com',
      password: 'senha123',
      role: 'USER',
      localId: 1,
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockLocalRepository.findById.mockResolvedValue({
      id: 1,
      name: 'Local Teste',
      address: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
    mockUserRepository.create.mockResolvedValue({
      id: 2,
      name: input.name,
      email: input.email,
      password: 'hashedPassword',
      role: 'USER',
      localId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await registerUser.execute(input);

    expect(result.role).toBe('USER');
    expect(result.localId).toBe(1);
    expect(mockLocalRepository.findById).toHaveBeenCalledWith(1);
  });

  it('deve lançar erro se email já existir', async () => {
    const input: RegisterInput = {
      name: 'User',
      email: 'existing@example.com',
      password: 'senha123',
      role: 'ADMIN',
    };

    mockUserRepository.findByEmail.mockResolvedValue({
      id: 1,
      name: 'Existing User',
      email: input.email,
      password: 'hashedPassword',
      role: 'USER',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(registerUser.execute(input)).rejects.toThrow('Email já cadastrado');
    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
  });

  it('deve lançar erro se USER não tiver localId', async () => {
    const input: RegisterInput = {
      name: 'User',
      email: 'user@example.com',
      password: 'senha123',
      role: 'USER',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(registerUser.execute(input)).rejects.toThrow('localId é obrigatório para USER');
  });

  it('deve lançar erro se localId for inválido', async () => {
    const input: RegisterInput = {
      name: 'User',
      email: 'user@example.com',
      password: 'senha123',
      role: 'USER',
      localId: 999,
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockLocalRepository.findById.mockResolvedValue(null);

    await expect(registerUser.execute(input)).rejects.toThrow('Local inválido');
  });
});
