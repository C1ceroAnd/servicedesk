import { ITicketRepository } from '../../ports/repositories';

export class CancelTicket {
  constructor(private readonly tickets: ITicketRepository) {}

  async execute(ticketId: number, userId: number): Promise<any> {
    // Apenas o solicitante pode cancelar seu próprio ticket
    const ticket = await this.tickets.findById(ticketId);
    
    if (!ticket) {
      throw new Error('Chamado não encontrado');
    }

    if (ticket.userId !== userId) {
      throw new Error('Você não tem permissão para cancelar este chamado');
    }

    if (ticket.status === 'COMPLETED' || ticket.status === 'CANCELLED') {
      throw new Error(`Não é possível cancelar um chamado ${ticket.status === 'COMPLETED' ? 'finalizado' : 'já cancelado'}`);
    }

    // Atualiza status para CANCELLED
    return this.tickets.update(ticketId, {
      status: 'CANCELLED'
    });
  }
}
