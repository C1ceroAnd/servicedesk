import { ITicketRepository } from '../../ports/repositories.js';

export class AcceptTicket {
  constructor(private readonly tickets: ITicketRepository) {}

  async execute(id: number, tecnicoId: number) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new Error('Ticket não encontrado');
    if (ticket.status !== 'PENDING') throw new Error(`Este ticket não pode ser aceito pois já está ${ticket.status === 'COMPLETED' ? 'concluído' : 'em andamento'}`);
    if (ticket.tecnicoId) {
      const tecnicoNome = ticket.tecnico?.name || 'Um técnico';
      throw new Error(`Este ticket já foi aceito por ${tecnicoNome}`);
    }

    return this.tickets.update(id, {
      status: 'IN_PROGRESS',
      tecnico: { connect: { id: tecnicoId } },
      dataAceito: new Date(),
    } as any);
  }
}
