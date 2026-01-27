import { IUserRepository, ITicketRepository } from '../../ports/repositories';

export class DeleteUser {
  constructor(private readonly users: IUserRepository, private readonly tickets: ITicketRepository) {}
  async execute(id: number) {
    // Verificar se o usuário possui chamados abertos como solicitante
    const requesterOpen = await this.tickets.list({
      userId: id,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    } as any);

    // Verificar se o usuário possui chamados abertos como técnico
    const technicianOpen = await this.tickets.list({
      tecnicoId: id,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    } as any);

    if ((requesterOpen && requesterOpen.length > 0) || (technicianOpen && technicianOpen.length > 0)) {
      throw new Error('Usuário possui chamados abertos e não pode ser removido');
    }

    await this.users.delete(id);
  }
}
