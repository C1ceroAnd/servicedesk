import { ITicketRepository } from '../../ports/repositories';

export class FinalizeTicket {
  constructor(private readonly tickets: ITicketRepository) {}

  async execute(id: number, tecnicoId: number) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new Error('Ticket não encontrado');
    if (ticket.status !== 'IN_PROGRESS') throw new Error('Este ticket não está em atendimento e não pode ser finalizado');
    if (ticket.tecnicoId !== tecnicoId) throw new Error('Apenas o técnico responsável pode finalizar este ticket');

    return this.tickets.update(id, {
      status: 'COMPLETED',
      dataFechamento: new Date(),
    } as any);
  }
}
