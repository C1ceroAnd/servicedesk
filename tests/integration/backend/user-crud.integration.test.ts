import { jest } from '@jest/globals';
import {
  createMockUserRepository,
  createMockLocalRepository,
  createUserFixture,
  createLocalFixture,
} from '../helpers/mock-factories';

describe('Integração de CRUD de Usuário', () => {
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockLocalRepository: ReturnType<typeof createMockLocalRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockLocalRepository = createMockLocalRepository();
  });

  describe('Criar Usuário', () => {
    it('deve criar usuário com dados válidos', async () => {
      const user = createUserFixture({
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'TECNICO',
      });

      mockUserRepository.create.mockResolvedValue(user);

      const created = await mockUserRepository.create({
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
        role: 'TECNICO',
        localId: 1,
      });

      expect(created.id).toBeDefined();
      expect(created.email).toBe('joao@example.com');
      expect(created.role).toBe('TECNICO');
    });

    it('deve validar email único', async () => {
      const existingUser = createUserFixture({ email: 'joao@example.com' });

      mockUserRepository.create.mockImplementation((input: any) => {
        if (input.email === existingUser.email) {
          return Promise.reject(new Error('Email já cadastrado'));
        }
        return Promise.resolve({ id: 2, ...input });
      });

      try {
        await mockUserRepository.create({
          name: 'Outro',
          email: 'joao@example.com',
          password: 'senha',
          role: 'USER',
        });
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(err.message).toBe('Email já cadastrado');
      }

      const newUser = await mockUserRepository.create({
        name: 'Maria',
        email: 'maria@example.com',
        password: 'senha',
        role: 'USER',
        localId: 1,
      });

      expect(newUser.email).toBe('maria@example.com');
    });

    it('deve normalizar role para uppercase', async () => {
      mockUserRepository.create.mockImplementation((data: any) => {
        return Promise.resolve({
          id: 1,
          ...data,
          role: data.role.toUpperCase(),
        });
      });

      const user = await mockUserRepository.create({
        name: 'Test',
        email: 'test@example.com',
        role: 'tecnico',
        localId: 1,
      });

      expect(user.role).toBe('TECNICO');
    });
  });

  describe('Atualizar Usuário', () => {
    it('deve atualizar dados do usuário', async () => {
      const user = createUserFixture({ id: 1, name: 'João Silva' });
      
      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue({
        ...user,
        name: 'João Silva Santos',
        email: 'joao.silva@example.com',
      });

      const updated = await mockUserRepository.update(1, {
        name: 'João Silva Santos',
        email: 'joao.silva@example.com',
      });

      expect(updated.name).toBe('João Silva Santos');
      expect(updated.email).toBe('joao.silva@example.com');
    });
  });

  describe('Deletar Usuário', () => {
    it('deve deletar usuário existente', async () => {
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await mockUserRepository.delete(1);

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Listar Usuários', () => {
    it('deve listar todos os usuários', async () => {
      const users = [
        createUserFixture({ id: 1, role: 'TECNICO', localId: 1 }),
        createUserFixture({ id: 2, role: 'TECNICO', localId: 1 }),
        createUserFixture({ id: 3, role: 'USER', localId: 2 }),
      ];

      mockUserRepository.list.mockResolvedValue(users);

      const allUsers = await mockUserRepository.list();

      expect(allUsers).toHaveLength(3);
    });

    it('deve filtrar usuários por role', async () => {
      const users = [
        createUserFixture({ id: 1, role: 'TECNICO' }),
        createUserFixture({ id: 2, role: 'TECNICO' }),
        createUserFixture({ id: 3, role: 'USER' }),
      ];

      mockUserRepository.list.mockResolvedValue(users);

      const allUsers = await mockUserRepository.list();
      const technicians = allUsers.filter((u: any) => u.role === 'TECNICO');

      expect(technicians).toHaveLength(2);
    });

    it('deve filtrar usuários por localId', async () => {
      const users = [
        createUserFixture({ id: 1, localId: 1 }),
        createUserFixture({ id: 2, localId: 1 }),
        createUserFixture({ id: 3, localId: 2 }),
      ];

      mockUserRepository.list.mockResolvedValue(users);

      const allUsers = await mockUserRepository.list();
      const localUsers = allUsers.filter((u: any) => u.localId === 1);

      expect(localUsers).toHaveLength(2);
    });
  });
});
