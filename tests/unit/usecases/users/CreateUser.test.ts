import { CreateUser } from '../../../../src/application/usecases/users/CreateUser';
import { IUserRepository, ILocalRepository } from '../../../../src/application/ports/repositories';
import { IPasswordHasher } from '../../../../src/application/ports/providers';

describe('CreateUser', () => {
  let createUser: CreateUser;
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

    createUser = new CreateUser(mockUserRepository, mockLocalRepository, mockPasswordHasher);
  });

  it('deve criar um novo usuário ADMIN sem localId', async () => {
    const params = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'senha123',
      role: 'ADMIN',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
    mockUserRepository.create.mockResolvedValue({
      id: 1,
      name: params.name,
      email: params.email,
      password: 'hashedPassword',
      role: 'ADMIN',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createUser.execute(params);

    expect(result.role).toBe('ADMIN');
    expect(result.localId).toBeNull();
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(params.email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(params.password);
  });

  it('deve criar usuário USER com localId numérico existente', async () => {
    const params = {
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
      name: params.name,
      email: params.email,
      password: 'hashedPassword',
      role: 'USER',
      localId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createUser.execute(params);

    expect(result.localId).toBe(1);
    expect(mockLocalRepository.findById).toHaveBeenCalledWith(1);
  });

  it('deve criar local se localId for string não existente', async () => {
    const params = {
      name: 'User',
      email: 'user@example.com',
      password: 'senha123',
      role: 'USER',
      localId: 'Novo Local',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockLocalRepository.findByName.mockResolvedValue(null);
    mockLocalRepository.create.mockResolvedValue({
      id: 5,
      name: 'Novo Local',
      address: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
    mockUserRepository.create.mockResolvedValue({
      id: 3,
      name: params.name,
      email: params.email,
      password: 'hashedPassword',
      role: 'USER',
      localId: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createUser.execute(params);

    expect(result.localId).toBe(5);
    expect(mockLocalRepository.findByName).toHaveBeenCalledWith('Novo Local');
    expect(mockLocalRepository.create).toHaveBeenCalledWith({ name: 'Novo Local' });
  });

  it('deve lançar erro se email já existir', async () => {
    const params = {
      name: 'User',
      email: 'existing@example.com',
      password: 'senha123',
      role: 'ADMIN',
    };

    mockUserRepository.findByEmail.mockResolvedValue({
      id: 1,
      name: 'Existing User',
      email: params.email,
      password: 'hashedPassword',
      role: 'USER',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(createUser.execute(params)).rejects.toThrow('Email já cadastrado');
  });

  it('deve lançar erro se USER não tiver localId', async () => {
    const params = {
      name: 'User',
      email: 'user@example.com',
      password: 'senha123',
      role: 'USER',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(createUser.execute(params)).rejects.toThrow('localId é obrigatório para USER');
  });

  it('deve lançar erro se localId numérico for inválido', async () => {
    const params = {
      name: 'User',
      email: 'user@example.com',
      password: 'senha123',
      role: 'USER',
      localId: 999,
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockLocalRepository.findById.mockResolvedValue(null);

    await expect(createUser.execute(params)).rejects.toThrow('Local inválido');
  });
});
