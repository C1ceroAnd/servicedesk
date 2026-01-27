import { ITicketRepository } from '../../ports/repositories.js';

export class RejectTicket {
  constructor(private readonly tickets: ITicketRepository) {}

  async execute(ticketId: number, tecnicoId: number): Promise<any> {
    // Apenas o técnico que aceitou pode rejeitar/desistir
    const ticket = await this.tickets.findById(ticketId);
    
    if (!ticket) {
      throw new Error('Chamado não encontrado');
    }

    if (ticket.tecnicoId !== tecnicoId) {
      throw new Error('Você não pode rejeitar um chamado que não aceitou');
    }

    if (ticket.status !== 'IN_PROGRESS') {
      throw new Error('Apenas chamados em atendimento podem ser rejeitados');
    }

    // Volta para PENDING e remove o técnico
    return this.tickets.update(ticketId, {
      status: 'PENDING',
      tecnicoId: null,
      dataAceito: null
    } as any);
  }
}
