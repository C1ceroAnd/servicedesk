import { ITicketRepository, IUserRepository, ILocalRepository } from '../../ports/repositories';
import { Role } from '../../../domain/roles';

export class CreateTicket {
  constructor(
    private readonly tickets: ITicketRepository,
    private readonly users: IUserRepository,
    private readonly locals: ILocalRepository,
  ) {}

  async execute(params: { title: string; description: string; requesterId: number; requesterRole: Role; localId?: number | null }) {
    const user = await this.users.findById(params.requesterId);
    if (!user) throw new Error('Usuário não encontrado');

    let localId = params.localId ?? undefined;

    if (params.requesterRole === 'USER') {
      if (!user.localId) throw new Error('Usuário não possui local vinculado');
      localId = user.localId;
    } else {
      if (!localId) throw new Error('localId é obrigatório para técnicos/administradores');
    }

    const localExists = await this.locals.findById(localId!);
    if (!localExists) throw new Error('Local inválido');

    return this.tickets.create({
      title: params.title,
      description: params.description,
      status: 'PENDING',
      user: { connect: { id: params.requesterId } },
      local: { connect: { id: localId! } },
    } as any);
  }
}
