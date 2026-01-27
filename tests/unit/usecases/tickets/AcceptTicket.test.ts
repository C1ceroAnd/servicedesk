import { AcceptTicket } from '../../../../src/application/usecases/tickets/AcceptTicket';
import { ITicketRepository } from '../../../../src/application/ports/repositories';

describe('AcceptTicket', () => {
  let acceptTicket: AcceptTicket;
  let mockTicketRepository: jest.Mocked<ITicketRepository>;

  beforeEach(() => {
    mockTicketRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
    };

    acceptTicket = new AcceptTicket(mockTicketRepository);
  });

  it('deve aceitar ticket PENDING', async () => {
    const ticketId = 1;
    const tecnicoId = 5;

    mockTicketRepository.findById.mockResolvedValue({
      id: ticketId,
      title: 'Ticket Teste',
      description: 'Descrição',
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

    mockTicketRepository.update.mockResolvedValue({
      id: ticketId,
      title: 'Ticket Teste',
      description: 'Descrição',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      userId: 2,
      localId: 3,
      tecnicoId: tecnicoId,
      dataAceito: new Date(),
      dataFechamento: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await acceptTicket.execute(ticketId, tecnicoId);

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.tecnicoId).toBe(tecnicoId);
    expect(mockTicketRepository.findById).toHaveBeenCalledWith(ticketId);
    expect(mockTicketRepository.update).toHaveBeenCalled();
  });

  it('deve lançar erro se ticket não existir', async () => {
    mockTicketRepository.findById.mockResolvedValue(null);

    await expect(acceptTicket.execute(999, 5)).rejects.toThrow('Ticket não encontrado');
    expect(mockTicketRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se ticket não estiver PENDING', async () => {
    mockTicketRepository.findById.mockResolvedValue({
      id: 1,
      title: 'Ticket Teste',
      description: 'Descrição',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      userId: 2,
      localId: 3,
      tecnicoId: 5,
      dataAceito: new Date(),
      dataFechamento: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await expect(acceptTicket.execute(1, 5)).rejects.toThrow('Este ticket não pode ser aceito pois já está em andamento');
    expect(mockTicketRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se ticket estiver COMPLETED', async () => {
    mockTicketRepository.findById.mockResolvedValue({
      id: 1,
      title: 'Ticket Teste',
      description: 'Descrição',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      userId: 2,
      localId: 3,
      tecnicoId: 5,
      dataAceito: new Date(),
      dataFechamento: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await expect(acceptTicket.execute(1, 5)).rejects.toThrow('Este ticket não pode ser aceito pois já está concluído');
    expect(mockTicketRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se ticket já foi aceito por outro técnico', async () => {
    mockTicketRepository.findById.mockResolvedValue({
      id: 1,
      title: 'Ticket Teste',
      description: 'Descrição',
      priority: 'MEDIUM',
      status: 'PENDING',
      userId: 2,
      localId: 3,
      tecnicoId: 5,
      dataAceito: null,
      dataFechamento: null,
      tecnico: { id: 5, name: 'João Silva', email: 'joao@example.com' },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await expect(acceptTicket.execute(1, 6)).rejects.toThrow('Este ticket já foi aceito por João Silva');
    expect(mockTicketRepository.update).not.toHaveBeenCalled();
  });
});
