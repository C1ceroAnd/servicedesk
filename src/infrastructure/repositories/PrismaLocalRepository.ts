import { PrismaClient } from '@prisma/client';
import { ILocalRepository } from '../../application/ports/repositories.js';

export class PrismaLocalRepository implements ILocalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: any) {
    return this.prisma.local.create({ data });
  }
  list() {
    return this.prisma.local.findMany({ orderBy: { name: 'asc' } });
  }
  findById(id: number) {
    return this.prisma.local.findUnique({ where: { id } });
  }
  findByName(name: string) {
    return this.prisma.local.findFirst({ where: { name } });
  }
  update(id: number, data: any) {
    return this.prisma.local.update({ where: { id }, data });
  }
  async delete(id: number) {
    await this.prisma.local.delete({ where: { id } });
  }
  async hasOpenTickets(localId: number) {
    const found = await this.prisma.ticket.findFirst({
      where: { localId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    });
    return !!found;
  }
}
