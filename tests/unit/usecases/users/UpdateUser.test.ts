import { UpdateUser } from '../../../../src/application/usecases/users/UpdateUser';
import { IUserRepository, ILocalRepository } from '../../../../src/application/ports/repositories';
import { IPasswordHasher } from '../../../../src/application/ports/providers';

describe('UpdateUser', () => {
  let updateUser: UpdateUser;
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

    updateUser = new UpdateUser(mockUserRepository, mockLocalRepository, mockPasswordHasher);
  });

  it('deve atualizar nome do usuário', async () => {
    const userId = 1;
    const updates = { name: 'Novo Nome' };

    mockUserRepository.update.mockResolvedValue({
      id: userId,
      name: 'Novo Nome',
      email: 'user@example.com',
      password: 'hashedPassword',
      role: 'USER',
      localId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateUser.execute(userId, updates);

    expect(result.name).toBe('Novo Nome');
    expect(mockUserRepository.update).toHaveBeenCalled();
  });

  it('deve atualizar email se não estiver em uso', async () => {
    const userId = 1;
    const updates = { email: 'newemail@example.com' };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.update.mockResolvedValue({
      id: userId,
      name: 'User',
      email: 'newemail@example.com',
      password: 'hashedPassword',
      role: 'USER',
      localId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateUser.execute(userId, updates);

    expect(result.email).toBe('newemail@example.com');
  });

  it('deve lançar erro se email já está em uso', async () => {
    const userId = 1;
    const updates = { email: 'existing@example.com' };

    mockUserRepository.findByEmail.mockResolvedValue({
      id: 2,
      email: 'existing@example.com',
    } as any);

    await expect(updateUser.execute(userId, updates)).rejects.toThrow('Email já cadastrado');
  });

  it('deve atualizar senha com hash', async () => {
    const userId = 1;
    const updates = { password: 'novaSenha123' };

    mockPasswordHasher.hash.mockResolvedValue('newHashedPassword');
    mockUserRepository.update.mockResolvedValue({
      id: userId,
      name: 'User',
      email: 'user@example.com',
      password: 'newHashedPassword',
      role: 'USER',
      localId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await updateUser.execute(userId, updates);

    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('novaSenha123');
  });

  it('deve atualizar role de USER para ADMIN', async () => {
    const userId = 1;
    const updates = { role: 'ADMIN' };

    mockUserRepository.update.mockResolvedValue({
      id: userId,
      name: 'User',
      email: 'user@example.com',
      password: 'hashedPassword',
      role: 'ADMIN',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateUser.execute(userId, updates);

    expect(result.role).toBe('ADMIN');
  });
});
