import { PrismaClient, Prisma } from '@prisma/client';
import { ITicketRepository, TicketWithRelations } from '../../application/ports/repositories';

export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: Prisma.TicketCreateInput): Promise<TicketWithRelations> {
    return this.prisma.ticket.create({ data, include: { tecnico: true, local: true, user: true } }) as any;
  }
  findById(id: number): Promise<TicketWithRelations | null> {
    return this.prisma.ticket.findUnique({ where: { id }, include: { tecnico: true, local: true, user: true } }) as any;
  }
  update(id: number, data: Prisma.TicketUpdateInput): Promise<TicketWithRelations> {
    return this.prisma.ticket.update({ where: { id }, data, include: { tecnico: true, local: true, user: true } }) as any;
  }
  list(where: Prisma.TicketWhereInput): Promise<TicketWithRelations[]> {
    return this.prisma.ticket.findMany({ where, include: { tecnico: true, local: true, user: true }, orderBy: { id: 'desc' } }) as any;
  }
}
