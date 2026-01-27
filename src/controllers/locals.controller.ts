import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { container, TOKENS } from '../core/container';
import { CreateLocal } from '../application/usecases/locals/CreateLocal';
import { ListLocals } from '../application/usecases/locals/ListLocals';
import { DeleteLocal } from '../application/usecases/locals/DeleteLocal';
import { UpdateLocal } from '../application/usecases/locals/UpdateLocal';

const createLocalSchema = z.object({
  name: z.string().min(2),
});

const updateLocalSchema = z.object({
  name: z.string().min(2).optional(),
});

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

export const localsController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = createLocalSchema.parse(request.body);
    const usecase = container.resolve(TOKENS.createLocal) as CreateLocal;
    const local = await usecase.execute(payload);
    return reply.status(201).send(local);
  },

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const usecase = container.resolve(TOKENS.listLocals) as ListLocals;
    const locals = await usecase.execute();
    return reply.status(200).send(locals);
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params);
    const payload = updateLocalSchema.parse(request.body ?? {});
    try {
      const usecase = container.resolve(TOKENS.updateLocal) as UpdateLocal;
      const local = await usecase.execute(params.id, payload);
      return reply.status(200).send(local);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params);
    try {
      const usecase = container.resolve(TOKENS.deleteLocal) as DeleteLocal;
      await usecase.execute(params.id);
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },
};
