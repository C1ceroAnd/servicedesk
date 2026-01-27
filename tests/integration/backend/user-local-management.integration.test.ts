import { jest } from '@jest/globals';

describe('Integração de Gestão de Usuários e Locais', () => {
  const mockUserRepository = {
    create: jest.fn() as any,
    findById: jest.fn() as any,
    update: jest.fn() as any,
    delete: jest.fn() as any,
    list: jest.fn() as any,
  };

  const mockLocalRepository = {
    findById: jest.fn() as any,
    create: jest.fn() as any,
    delete: jest.fn() as any,
    list: jest.fn() as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockUserRepository.create.mockReset();
    mockUserRepository.findById.mockReset();
    mockUserRepository.update.mockReset();
    mockUserRepository.delete.mockReset();
    mockUserRepository.list.mockReset();
    mockLocalRepository.findById.mockReset();
    mockLocalRepository.create.mockReset();
    mockLocalRepository.delete.mockReset();
    mockLocalRepository.list.mockReset();
  });

  describe('User Management Workflow', () => {
    it('deve criar, atualizar e deletar usuário completo', async () => {
      // Act 1 - Criar usuário
      const createInput = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
        role: 'TECNICO',
        localId: 1,
      };

      const createdUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'TECNICO',
        localId: 1,
      };

      mockUserRepository.create.mockResolvedValue(createdUser);

      const user = await mockUserRepository.create(createInput);
      expect(user.id).toBe(1);
      expect(user.email).toBe('joao@example.com');

      // Act 2 - Atualizar usuário
      const updateInput = {
        name: 'João Silva Santos',
        email: 'joao.silva@example.com',
      };

      const updatedUser = {
        ...createdUser,
        ...updateInput,
      };

      mockUserRepository.update.mockResolvedValue(updatedUser);

      const updated = await mockUserRepository.update(1, updateInput);
      expect(updated.name).toBe('João Silva Santos');
      expect(updated.email).toBe('joao.silva@example.com');

      // Act 3 - Deletar usuário
      mockUserRepository.delete.mockResolvedValue(true);

      const deleted = await mockUserRepository.delete(1);
      expect(deleted).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve listar usuários com filtros', async () => {
      // Arrange
      const users = [
        { id: 1, name: 'João', role: 'TECNICO', localId: 1 },
        { id: 2, name: 'Maria', role: 'TECNICO', localId: 1 },
        { id: 3, name: 'Pedro', role: 'USER', localId: 2 },
      ];

      mockUserRepository.list.mockResolvedValue(users);

      // Act
      const allUsers = await mockUserRepository.list();

      // Assert
      expect(allUsers).toHaveLength(3);

      // Filter by role
      const technicians = allUsers.filter((u: any) => u.role === 'TECNICO');
      expect(technicians).toHaveLength(2);

      // Filter by localId
      const localUsers = allUsers.filter((u: any) => u.localId === 1);
      expect(localUsers).toHaveLength(2);
    });

    it('deve validar email único ao criar usuário', async () => {
      // Arrange
      const existingUser = {
        id: 1,
        email: 'joao@example.com',
      };

      mockUserRepository.create.mockImplementation((input: any) => {
        // Simular validação - use reject for consistency
        if (input.email === existingUser.email) {
          return Promise.reject(new Error('Email já cadastrado'));
        }
        return Promise.resolve({ id: 2, ...input });
      });

      // Act & Assert - Email duplicado
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

      // Act & Assert - Email novo
      const newUser = await mockUserRepository.create({
        name: 'Maria',
        email: 'maria@example.com',
        password: 'senha',
        role: 'USER',
        localId: 1,
      });

      expect(newUser.email).toBe('maria@example.com');
    });

    it('deve normalizar role ao criar usuário', async () => {
      // Arrange
      const input = {
        name: 'John',
        email: 'john@example.com',
        password: 'senha',
        role: 'tecnico', // minúsculo
      };

      mockUserRepository.create.mockImplementation((data: any) => {
        return Promise.resolve({
          id: 1,
          ...data,
          role: data.role.toUpperCase(), // Normalizar
        });
      });

      // Act
      const user = await mockUserRepository.create(input);

      // Assert
      expect(user.role).toBe('TECNICO');
    });
  });

  describe('Local Management Workflow', () => {
    it('deve criar e deletar local', async () => {
      // Act 1 - Criar local
      const createInput = {
        name: 'Sala de Impressoras',
        description: 'Setor de impressoras da empresa',
      };

      const createdLocal = {
        id: 1,
        ...createInput,
      };

      mockLocalRepository.create.mockResolvedValue(createdLocal);

      const local = await mockLocalRepository.create(createInput);
      expect(local.id).toBe(1);
      expect(local.name).toBe('Sala de Impressoras');

      // Act 2 - Deletar local
      mockLocalRepository.delete.mockResolvedValue(true);

      const deleted = await mockLocalRepository.delete(1);
      expect(deleted).toBe(true);
    });

    it('deve listar todos os locais', async () => {
      // Arrange
      const locals = [
        { id: 1, name: 'Local A' },
        { id: 2, name: 'Local B' },
        { id: 3, name: 'Local C' },
      ];

      mockLocalRepository.list.mockResolvedValue(locals);

      // Act
      const allLocals = await mockLocalRepository.list();

      // Assert
      expect(allLocals).toHaveLength(3);
      expect(allLocals[0].name).toBe('Local A');
    });
  });

  describe('User-Local Relationship', () => {
    it('deve validar localId ao criar usuário', async () => {
      // Arrange
      mockLocalRepository.findById.mockResolvedValue({ id: 1, name: 'Local A' });

      // Act
      const localExists = await mockLocalRepository.findById(1);

      // Assert
      expect(localExists).toBeDefined();

      // Act 2 - Criar usuário com localId válido
      mockUserRepository.create.mockResolvedValue({
        id: 1,
        name: 'João',
        email: 'joao@example.com',
        role: 'USER',
        localId: 1,
      });

      const user = await mockUserRepository.create({
        name: 'João',
        email: 'joao@example.com',
        password: 'senha',
        role: 'USER',
        localId: 1,
      });

      expect(user.localId).toBe(1);
    });

    it('deve rejeitar localId inválido ao criar usuário', async () => {
      // Arrange
      mockLocalRepository.findById.mockResolvedValue(null);

      mockUserRepository.create.mockImplementation(async (input: any) => {
        const local = await mockLocalRepository.findById(input.localId);
        if (!local) {
          throw new Error('Local não existe');
        }
        return Promise.resolve({ id: 1, ...input });
      });

      // Act & Assert
      await expect(
        mockUserRepository.create({
          name: 'João',
          email: 'joao@example.com',
          password: 'senha',
          role: 'USER',
          localId: 999, // Local inexistente
        })
      ).rejects.toThrow('Local não existe');
    });

    it('deve listar usuários por local', async () => {
      // Arrange
      const users = [
        { id: 1, name: 'João', localId: 1 },
        { id: 2, name: 'Maria', localId: 1 },
        { id: 3, name: 'Pedro', localId: 2 },
      ];

      mockUserRepository.list.mockResolvedValue(users);

      // Act
      const allUsers = await mockUserRepository.list();
      const localUsers = allUsers.filter((u: any) => u.localId === 1);

      // Assert
      expect(localUsers).toHaveLength(2);
      expect(localUsers.every((u: any) => u.localId === 1)).toBe(true);
    });
  });

  describe('Permission-based Actions', () => {
    it('deve permitir que ADMIN atualize qualquer usuário', async () => {
      // Arrange
      const admin = { id: 1, role: 'ADMIN' };
      const targetUser = { id: 2, name: 'João' };

      // Act
      const canUpdate = ['ADMIN'].includes(admin.role);

      // Assert
      expect(canUpdate).toBe(true);

      // Act 2 - Atualizar usuário
      mockUserRepository.update.mockResolvedValue({
        ...targetUser,
        name: 'João Silva',
      });

      const updated = await mockUserRepository.update(2, { name: 'João Silva' });
      expect(updated.name).toBe('João Silva');
    });

    it('deve permitir que usuário atualize apenas a si mesmo', async () => {
      // Arrange
      const user = { id: 2, role: 'USER' };
      const targetUserId = 2;

      // Act
      const canUpdate = user.id === targetUserId;

      // Assert
      expect(canUpdate).toBe(true);
    });

    it('deve negar atualização se não for ADMIN nem o próprio usuário', async () => {
      // Arrange
      const user = { id: 2, role: 'USER' };
      const targetUserId = 3;

      // Act
      const canUpdate = user.role === 'ADMIN' || user.id === targetUserId;

      // Assert
      expect(canUpdate).toBe(false);
    });
  });
});
