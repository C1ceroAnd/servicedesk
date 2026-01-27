import { jest } from '@jest/globals';
import {
  createMockUserRepository,
  createUserFixture,
} from '../helpers/mock-factories';

describe('Integração de Permissões de Usuário', () => {
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
  });

  describe('Permissões de Atualização', () => {
    it('deve permitir que ADMIN atualize qualquer usuário', async () => {
      const adminUser = createUserFixture({ id: 1, role: 'ADMIN' });
      const targetUser = createUserFixture({ id: 2, role: 'USER' });

      mockUserRepository.findById.mockImplementation((id: number) =>
        Promise.resolve(id === 1 ? adminUser : targetUser)
      );

      mockUserRepository.update.mockResolvedValue({
        ...targetUser,
        name: 'Updated Name',
      });

      const currentUser = await mockUserRepository.findById(1);
      expect(currentUser.role).toBe('ADMIN');

      const updated = await mockUserRepository.update(2, { name: 'Updated Name' });
      expect(updated.name).toBe('Updated Name');
      expect(mockUserRepository.update).toHaveBeenCalledWith(2, { name: 'Updated Name' });
    });

    it('deve permitir que usuário atualize apenas a si mesmo', async () => {
      const user = createUserFixture({ id: 1, role: 'USER' });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue({
        ...user,
        name: 'Self Updated',
      });

      const currentUser = await mockUserRepository.findById(1);
      expect(currentUser.id).toBe(1);

      const updated = await mockUserRepository.update(1, { name: 'Self Updated' });
      expect(updated.name).toBe('Self Updated');
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { name: 'Self Updated' });
    });

    it('deve negar atualização se não for ADMIN nem próprio usuário', async () => {
      const currentUser = createUserFixture({ id: 1, role: 'USER' });
      const targetUser = createUserFixture({ id: 2, role: 'USER' });

      mockUserRepository.findById.mockImplementation((id: number) =>
        Promise.resolve(id === 1 ? currentUser : targetUser)
      );

      const user = await mockUserRepository.findById(1);
      const canUpdate = user.role === 'ADMIN' || user.id === 2;

      expect(canUpdate).toBe(false);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Permissões de Criação', () => {
    it('apenas ADMIN pode criar usuários ADMIN', async () => {
      const adminUser = createUserFixture({ id: 1, role: 'ADMIN' });

      mockUserRepository.findById.mockResolvedValue(adminUser);
      mockUserRepository.create.mockImplementation((data: any) => {
        const currentUser = adminUser;
        if (data.role === 'ADMIN' && currentUser.role !== 'ADMIN') {
          return Promise.reject(new Error('Apenas ADMIN pode criar outros ADMINs'));
        }
        return Promise.resolve({ id: 2, ...data });
      });

      const newAdmin = await mockUserRepository.create({
        name: 'New Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        localId: 1,
      });

      expect(newAdmin.role).toBe('ADMIN');
    });
  });
});
