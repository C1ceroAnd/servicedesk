import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../application/ports/repositories.js';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  create(data: any) {
    return this.prisma.user.create({ data });
  }
  update(id: number, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }
  async delete(id: number) {
    await this.prisma.user.delete({ where: { id } });
  }
  list() {
    return this.prisma.user.findMany({ orderBy: { id: 'asc' } });
  }
}
