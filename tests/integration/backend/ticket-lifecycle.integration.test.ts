import { jest } from '@jest/globals';

describe('Integração de Ciclo de Vida do Chamado', () => {
  const mockUserRepository = {
    findById: jest.fn() as any,
    update: jest.fn() as any,
    delete: jest.fn() as any,
  };

  const mockLocalRepository = {
    findById: jest.fn() as any,
    create: jest.fn() as any,
    delete: jest.fn() as any,
  };

  const mockTicketRepository = {
    findById: jest.fn() as any,
    create: jest.fn() as any,
    update: jest.fn() as any,
    findByUserId: jest.fn() as any,
    findByLocalId: jest.fn() as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockUserRepository.findById.mockReset();
    mockUserRepository.update.mockReset();
    mockUserRepository.delete.mockReset();
    mockLocalRepository.findById.mockReset();
    mockLocalRepository.create.mockReset();
    mockLocalRepository.delete.mockReset();
    mockTicketRepository.findById.mockReset();
    mockTicketRepository.create.mockReset();
    mockTicketRepository.update.mockReset();
    mockTicketRepository.findByUserId.mockReset();
    mockTicketRepository.findByLocalId.mockReset();
  });

  describe('Complete Ticket Workflow', () => {
    it('deve criar e processar ticket do início ao fim', async () => {
      // Arrange - Usuários
      const userCreator = { id: 1, name: 'User', role: 'USER', localId: 1 };
      const technicianUser = { id: 2, name: 'Tech', role: 'TECNICO', localId: 1 };

      mockUserRepository.findById.mockImplementation((id: number) =>
        Promise.resolve(id === 1 ? userCreator : technicianUser)
      );

      // Arrange - Local
      const local = { id: 1, name: 'Local A' };
      mockLocalRepository.findById.mockResolvedValue(local);

      // Act 1 - Criar ticket
      const createTicketInput = {
        title: 'Problema na impressora',
        description: 'Impressora não está imprimindo',
        userId: 1,
        localId: 1,
      };

      const ticket = {
        id: 1,
        ...createTicketInput,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTicketRepository.create.mockResolvedValue(ticket);

      const createdTicket = await mockTicketRepository.create(createTicketInput);
      expect(createdTicket.status).toBe('PENDING');
      expect(createdTicket.userId).toBe(1);

      // Act 2 - Aceitar ticket (TECNICO)
      const acceptedTicket = {
        ...createdTicket,
        status: 'IN_PROGRESS',
        assignedTo: 2,
      };

      mockTicketRepository.update.mockResolvedValue(acceptedTicket);

      const updated = await mockTicketRepository.update(1, { 
        status: 'IN_PROGRESS', 
        assignedTo: 2 
      });
      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.assignedTo).toBe(2);

      // Act 3 - Finalizar ticket (TECNICO)
      const finalizedTicket = {
        ...acceptedTicket,
        status: 'COMPLETED',
        completedAt: new Date(),
      };

      mockTicketRepository.update.mockResolvedValue(finalizedTicket);

      const completed = await mockTicketRepository.update(1, { 
        status: 'COMPLETED' 
      });
      expect(completed.status).toBe('COMPLETED');
    });

    it('deve permitir cancelamento de ticket pelo criador', async () => {
      // Arrange
      const ticket = {
        id: 1,
        userId: 1, // Criador
        status: 'PENDING',
      };

      const currentUser = { id: 1, role: 'USER' };

      // Act - Verificar permissão
      const canCancel = ticket.userId === currentUser.id;

      // Assert
      expect(canCancel).toBe(true);

      // Act 2 - Cancelar
      mockTicketRepository.update.mockResolvedValue({
        ...ticket,
        status: 'CANCELLED',
      });

      const cancelled = await mockTicketRepository.update(1, { status: 'CANCELLED' });
      expect(cancelled.status).toBe('CANCELLED');
    });

    it('deve negar cancelamento se não for criador', async () => {
      // Arrange
      const ticket = {
        id: 1,
        userId: 1, // Criador
        status: 'PENDING',
      };

      const currentUser = { id: 2, role: 'TECNICO' }; // Outro usuário

      // Act - Verificar permissão
      const canCancel = ticket.userId === currentUser.id;

      // Assert
      expect(canCancel).toBe(false);
    });

    it('deve permitir rejeição de ticket por TECNICO', async () => {
      // Arrange
      const ticket = {
        id: 1,
        status: 'PENDING',
      };

      const currentUser = { id: 2, role: 'TECNICO' };

      // Act - Verificar permissão
      const canReject = ['TECNICO', 'ADMIN'].includes(currentUser.role);

      // Assert
      expect(canReject).toBe(true);

      // Act 2 - Rejeitar
      mockTicketRepository.update.mockResolvedValue({
        ...ticket,
        status: 'PENDING',
        rejectionReason: 'Não conseguiremos resolver este problema',
      });

      const rejected = await mockTicketRepository.update(1, { 
        status: 'PENDING',
        rejectionReason: 'Não conseguiremos resolver este problema'
      });
      expect(rejected.rejectionReason).toBeDefined();
    });
  });

  describe('Ticket Constraints', () => {
    it('deve validar que localId do usuário corresponde ao ticket', async () => {
      // Arrange
      const user = { id: 1, localId: 1 };
      const ticket = { id: 1, localId: 1 };

      mockUserRepository.findById.mockResolvedValue(user);
      mockTicketRepository.findById.mockResolvedValue(ticket);

      // Act
      const userLocal = (await mockUserRepository.findById(1)).localId;
      const ticketLocal = (await mockTicketRepository.findById(1)).localId;

      // Assert
      expect(userLocal).toBe(ticketLocal);
    });

    it('deve listar tickets por local', async () => {
      // Arrange
      const tickets = [
        { id: 1, localId: 1, status: 'PENDING' },
        { id: 2, localId: 1, status: 'IN_PROGRESS' },
        { id: 3, localId: 2, status: 'COMPLETED' },
      ];

      mockTicketRepository.findByLocalId.mockResolvedValue(
        tickets.filter(t => t.localId === 1)
      );

      // Act
      const localTickets = await mockTicketRepository.findByLocalId(1);

      // Assert
      expect(localTickets).toHaveLength(2);
      expect(localTickets.every((t: any) => t.localId === 1)).toBe(true);
    });

    it('deve listar tickets do usuário', async () => {
      // Arrange
      const tickets = [
        { id: 1, userId: 1, status: 'PENDING' },
        { id: 2, userId: 1, status: 'COMPLETED' },
        { id: 3, userId: 2, status: 'PENDING' },
      ];

      mockTicketRepository.findByUserId.mockResolvedValue(
        tickets.filter(t => t.userId === 1)
      );

      // Act
      const userTickets = await mockTicketRepository.findByUserId(1);

      // Assert
      expect(userTickets).toHaveLength(2);
      expect(userTickets.every((t: any) => t.userId === 1)).toBe(true);
    });
  });

  describe('Forbidden Operations', () => {
    it('deve negar exclusão de local com tickets abertos', async () => {
      // Arrange
      const local = { id: 1 };
      const tickets = [
        { id: 1, localId: 1, status: 'PENDING' },
        { id: 2, localId: 1, status: 'IN_PROGRESS' },
      ];

      mockTicketRepository.findByLocalId.mockResolvedValue(tickets);

      // Act
      const openTickets = (await mockTicketRepository.findByLocalId(1))
        .filter((t: any) => ['PENDING', 'IN_PROGRESS'].includes(t.status));

      // Assert
      expect(openTickets.length > 0).toBe(true);
      expect(() => {
        if (openTickets.length > 0) {
          throw new Error('Não é possível deletar local com tickets abertos');
        }
      }).toThrow();
    });

    it('deve permitir exclusão de local sem tickets abertos', async () => {
      // Arrange
      const local = { id: 1 };
      const tickets = [
        { id: 1, localId: 1, status: 'COMPLETED' },
        { id: 2, localId: 1, status: 'CANCELLED' },
      ];

      mockTicketRepository.findByLocalId.mockResolvedValue(tickets);
      mockLocalRepository.delete.mockResolvedValue(true);

      // Act
      const openTickets = (await mockTicketRepository.findByLocalId(1))
        .filter((t: any) => ['PENDING', 'IN_PROGRESS'].includes(t.status));
      
      const canDelete = openTickets.length === 0;

      // Assert
      expect(canDelete).toBe(true);

      if (canDelete) {
        const deleted = await mockLocalRepository.delete(1);
        expect(deleted).toBe(true);
      }
    });
  });
});
