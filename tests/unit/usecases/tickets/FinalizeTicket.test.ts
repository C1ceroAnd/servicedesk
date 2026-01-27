import { FinalizeTicket } from '../../../../src/application/usecases/tickets/FinalizeTicket';
import { ITicketRepository } from '../../../../src/application/ports/repositories';

describe('FinalizeTicket', () => {
  let finalizeTicket: FinalizeTicket;
  let mockTicketRepository: jest.Mocked<ITicketRepository>;

  beforeEach(() => {
    mockTicketRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
    };

    finalizeTicket = new FinalizeTicket(mockTicketRepository);
  });

  it('deve finalizar ticket IN_PROGRESS pelo técnico responsável', async () => {
    const ticketId = 1;
    const tecnicoId = 5;

    mockTicketRepository.findById.mockResolvedValue({
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

    mockTicketRepository.update.mockResolvedValue({
      id: ticketId,
      title: 'Ticket Teste',
      description: 'Descrição',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      userId: 2,
      localId: 3,
      tecnicoId: tecnicoId,
      dataAceito: new Date(),
      dataFechamento: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await finalizeTicket.execute(ticketId, tecnicoId);

    expect(result.status).toBe('COMPLETED');
    expect(mockTicketRepository.findById).toHaveBeenCalledWith(ticketId);
    expect(mockTicketRepository.update).toHaveBeenCalled();
  });

  it('deve lançar erro se ticket não existir', async () => {
    mockTicketRepository.findById.mockResolvedValue(null);

    await expect(finalizeTicket.execute(999, 5)).rejects.toThrow('Ticket não encontrado');
    expect(mockTicketRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se ticket não estiver IN_PROGRESS', async () => {
    mockTicketRepository.findById.mockResolvedValue({
      id: 1,
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

    await expect(finalizeTicket.execute(1, 5)).rejects.toThrow('Este ticket não está em atendimento e não pode ser finalizado');
    expect(mockTicketRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se outro técnico tentar finalizar', async () => {
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

    await expect(finalizeTicket.execute(1, 6)).rejects.toThrow('Apenas o técnico responsável pode finalizar este ticket');
    expect(mockTicketRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se ticket já estiver COMPLETED', async () => {
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

    await expect(finalizeTicket.execute(1, 5)).rejects.toThrow('Este ticket não está em atendimento e não pode ser finalizado');
    expect(mockTicketRepository.update).not.toHaveBeenCalled();
  });
});
