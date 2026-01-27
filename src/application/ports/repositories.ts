import { Prisma, User, Local, Ticket } from '@prisma/client';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: number, data: Prisma.UserUpdateInput): Promise<User>;
  delete(id: number): Promise<void>;
  list(): Promise<User[]>;
}

export interface ILocalRepository {
  create(data: Prisma.LocalCreateInput): Promise<Local>;
  list(): Promise<Local[]>;
  findById(id: number): Promise<Local | null>;
  findByName(name: string): Promise<Local | null>;
  update(id: number, data: Prisma.LocalUpdateInput): Promise<Local>;
  delete(id: number): Promise<void>;
  hasOpenTickets(localId: number): Promise<boolean>;
}

export type TicketWithRelations = Ticket & {
  tecnico: User | null;
  local: Local;
  user: User;
};

export interface ITicketRepository {
  create(data: Prisma.TicketCreateInput): Promise<TicketWithRelations>;
  findById(id: number): Promise<TicketWithRelations | null>;
  update(id: number, data: Prisma.TicketUpdateInput): Promise<TicketWithRelations>;
  list(where: Prisma.TicketWhereInput): Promise<TicketWithRelations[]>;
}
