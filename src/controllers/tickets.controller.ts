import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { container, TOKENS } from '../core/container.js';
import { CreateTicket } from '../application/usecases/tickets/CreateTicket.js';
import { ListTickets } from '../application/usecases/tickets/ListTickets.js';
import { AcceptTicket } from '../application/usecases/tickets/AcceptTicket.js';
import { FinalizeTicket } from '../application/usecases/tickets/FinalizeTicket.js';
import { CancelTicket } from '../application/usecases/tickets/CancelTicket.js';
import { RejectTicket } from '../application/usecases/tickets/RejectTicket.js';

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  localId: z.union([z.coerce.number().int().positive(), z.literal(undefined)]).optional(),
});

const listQuerySchema = z.object({
  status: z.string().optional(),
  localId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });
const userIdParamsSchema = z.object({ userId: z.coerce.number().int().positive() });

// Finalize no longer requires a solution description
const finalizeSchema = z.object({}).optional();

export const ticketsController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send({ error: 'Não autenticado' });
    const payload = createSchema.parse(request.body);

    try {
      const usecase = container.resolve(TOKENS.createTicket) as CreateTicket;
      const ticket = await usecase.execute({
        title: payload.title,
        description: payload.description,
        localId: payload.localId,
        requesterId: request.user.id,
        requesterRole: request.user.role,
      });
      return reply.status(201).send(ticket);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async list(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send({ error: 'Não autenticado' });
    const query = listQuerySchema.parse(request.query);

    const usecase = container.resolve(TOKENS.listTickets) as ListTickets;
    const tickets = await usecase.execute({
      userId: request.user.id,
      role: request.user.role,
      status: query.status,
      localId: query.localId,
      search: query.search,
    });

    return reply.status(200).send(tickets);
  },

  async accept(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send({ error: 'Não autenticado' });
    const params = paramsSchema.parse(request.params);

    try {
      const usecase = container.resolve(TOKENS.acceptTicket) as AcceptTicket;
      const ticket = await usecase.execute(params.id, request.user.id);
      return reply.status(200).send(ticket);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async finalize(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send({ error: 'Não autenticado' });
    const params = paramsSchema.parse(request.params);
    finalizeSchema.parse(request.body);

    try {
      const usecase = container.resolve(TOKENS.finalizeTicket) as FinalizeTicket;
      const ticket = await usecase.execute(params.id, request.user.id);
      return reply.status(200).send(ticket);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async cancel(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send({ error: 'Não autenticado' });
    const params = paramsSchema.parse(request.params);

    try {
      const usecase = container.resolve(TOKENS.cancelTicket) as CancelTicket;
      const ticket = await usecase.execute(params.id, request.user.id);
      return reply.status(200).send(ticket);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async reject(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send({ error: 'Não autenticado' });
    const params = paramsSchema.parse(request.params);

    try {
      const usecase = container.resolve(TOKENS.rejectTicket) as RejectTicket;
      const ticket = await usecase.execute(params.id, request.user.id);
      return reply.status(200).send(ticket);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async deleteCompleted(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send({ error: 'Não autenticado' });
    const params = userIdParamsSchema.parse(request.params);

    // Cada perfil só pode limpar o próprio histórico. ADMIN pode limpar o dele (seja como solicitante ou técnico).
    if (request.user.id !== params.userId && request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Não autorizado' });
    }

    try {
      const prisma = container.resolve(TOKENS.prisma) as any;

      if (request.user.role === 'USER') {
        // USER: marca seus próprios tickets solicitados como escondidos
        const updated = await prisma.ticket.updateMany({
          where: {
            userId: params.userId,
            status: { in: ['COMPLETED', 'CANCELLED'] }
          },
          data: {
            hiddenFromRequester: true
          }
        });
        return reply.status(200).send({ success: true, updatedCount: updated.count });
      } else if (request.user.role === 'TECNICO') {
        // TÉCNICO: marca seus próprios tickets assumidos como escondidos
        const updated = await prisma.ticket.updateMany({
          where: {
            tecnicoId: params.userId,
            status: { in: ['COMPLETED', 'CANCELLED'] }
          },
          data: {
            hiddenFromTecnico: true
          }
        });
        return reply.status(200).send({ success: true, updatedCount: updated.count });
      } else {
        // ADMIN: hard delete dos seus próprios tickets (como solicitante ou técnico)
        const deleted = await prisma.ticket.deleteMany({
          where: {
            status: { in: ['COMPLETED', 'CANCELLED'] },
            OR: [
              { userId: params.userId },
              { tecnicoId: params.userId }
            ]
          }
        });
        return reply.status(200).send({ success: true, deletedCount: deleted.count });
      }
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },
};
