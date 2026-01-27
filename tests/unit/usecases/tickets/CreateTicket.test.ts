import { CreateTicket } from '../../../../src/application/usecases/tickets/CreateTicket';
import { ITicketRepository, IUserRepository, ILocalRepository } from '../../../../src/application/ports/repositories';

describe('CreateTicket', () => {
  let createTicket: CreateTicket;
  let mockTicketRepository: jest.Mocked<ITicketRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockLocalRepository: jest.Mocked<ILocalRepository>;

  beforeEach(() => {
    mockTicketRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
    };

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

    createTicket = new CreateTicket(mockTicketRepository, mockUserRepository, mockLocalRepository);
  });

  it('deve criar ticket para USER usando seu localId', async () => {
    const params = {
      title: 'Problema na impressora',
      description: 'A impressora não está funcionando',
      priority: 'HIGH',
      requesterId: 1,
      requesterRole: 'USER' as const,
    };

    const mockUser = {
      id: 1,
      name: 'User',
      email: 'user@example.com',
      password: 'hashedPassword',
      role: 'USER',
      localId: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockLocal = {
      id: 5,
      name: 'Setor TI',
      address: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockLocalRepository.findById.mockResolvedValue(mockLocal);
    mockTicketRepository.create.mockResolvedValue({
      id: 1,
      title: params.title,
      description: params.description,
      priority: 'HIGH',
      status: 'PENDING',
      userId: 1,
      localId: 5,
      tecnicoId: null,
      dataAceito: null,
      dataFechamento: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await createTicket.execute(params);

    expect(result.localId).toBe(5);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    expect(mockLocalRepository.findById).toHaveBeenCalledWith(5);
  });

  it('deve criar ticket para ADMIN com localId fornecido', async () => {
    const params = {
      title: 'Manutenção programada',
      description: 'Servidor precisa de atualização',
      priority: 'MEDIUM',
      requesterId: 2,
      requesterRole: 'ADMIN' as const,
      localId: 3,
    };

    const mockUser = {
      id: 2,
      name: 'Admin',
      email: 'admin@example.com',
      password: 'hashedPassword',
      role: 'ADMIN',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockLocal = {
      id: 3,
      name: 'Datacenter',
      address: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockLocalRepository.findById.mockResolvedValue(mockLocal);
    mockTicketRepository.create.mockResolvedValue({
      id: 2,
      title: params.title,
      description: params.description,
      priority: 'MEDIUM',
      status: 'PENDING',
      userId: 2,
      localId: 3,
      tecnicoId: null,
      dataAceito: null,
      dataFechamento: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await createTicket.execute(params);

    expect(result.localId).toBe(3);
    expect(mockLocalRepository.findById).toHaveBeenCalledWith(3);
  });

  it('deve lançar erro se usuário não existir', async () => {
    const params = {
      title: 'Ticket',
      description: 'Descrição',
      requesterId: 999,
      requesterRole: 'USER' as const,
    };

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(createTicket.execute(params)).rejects.toThrow('Usuário não encontrado');
  });

  it('deve lançar erro se USER não tiver localId', async () => {
    const params = {
      title: 'Ticket',
      description: 'Descrição',
      requesterId: 1,
      requesterRole: 'USER' as const,
    };

    mockUserRepository.findById.mockResolvedValue({
      id: 1,
      name: 'User',
      email: 'user@example.com',
      password: 'hashedPassword',
      role: 'USER',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(createTicket.execute(params)).rejects.toThrow('Usuário não possui local vinculado');
  });

  it('deve lançar erro se ADMIN não fornecer localId', async () => {
    const params = {
      title: 'Ticket',
      description: 'Descrição',
      requesterId: 2,
      requesterRole: 'ADMIN' as const,
    };

    mockUserRepository.findById.mockResolvedValue({
      id: 2,
      name: 'Admin',
      email: 'admin@example.com',
      password: 'hashedPassword',
      role: 'ADMIN',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(createTicket.execute(params)).rejects.toThrow('localId é obrigatório para técnicos/administradores');
  });

  it('deve lançar erro se localId for inválido', async () => {
    const params = {
      title: 'Ticket',
      description: 'Descrição',
      requesterId: 2,
      requesterRole: 'ADMIN' as const,
      localId: 999,
    };

    mockUserRepository.findById.mockResolvedValue({
      id: 2,
      name: 'Admin',
      email: 'admin@example.com',
      password: 'hashedPassword',
      role: 'ADMIN',
      localId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockLocalRepository.findById.mockResolvedValue(null);

    await expect(createTicket.execute(params)).rejects.toThrow('Local inválido');
  });
});
