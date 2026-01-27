import { ITicketRepository } from '../../ports/repositories.js';
import { Role } from '../../../domain/roles.js';

export class ListTickets {
  constructor(private readonly tickets: ITicketRepository) {}

  async execute(params: { userId: number; role: Role; status?: string; localId?: number; search?: string }) {
    const where: any = {};

    if (params.role === 'USER') {
      // USER vê apenas seus próprios tickets solicitados (não escondidos)
      where.userId = params.userId;
      where.hiddenFromRequester = false;
    } else if (params.role === 'TECNICO') {
      // TÉCNICO vê:
      // - Pendentes (para poder aceitar)
      // - Todos em atendimento (para controle de quem está atendendo)
      // - Os que aceitou (não escondidos)
      where.OR = [
        { status: 'PENDING' },
        { status: 'IN_PROGRESS' },
        { tecnicoId: params.userId, hiddenFromTecnico: false }
      ];
    }
    // ADMIN vê todos (sem filtros de hidden)

    if (params.status) where.status = params.status;
    if (params.localId) where.localId = params.localId;

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { local: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    return this.tickets.list(where);
  }
}
