import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { container, TOKENS } from '../core/container.js';
import { CreateUser } from '../application/usecases/users/CreateUser.js';
import { ListUsers } from '../application/usecases/users/ListUsers.js';
import { UpdateUser } from '../application/usecases/users/UpdateUser.js';
import { DeleteUser } from '../application/usecases/users/DeleteUser.js';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().optional(),
  // Aceita número, string numérica (ex: "1"), string para nome de local (ex: "Bloco A"), ou null/undefined
  localId: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.union([
      z.number().int().positive(),
      z.string().min(1)  // Aceita qualquer string não-vazia (ID ou nome de local)
    ]).nullable().optional()
  ),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
  localId: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.union([
      z.number().int().positive(),
      z.string().min(1)
    ]).nullable().optional()
  ),
});

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

const generatePassword = (length: number = 10): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const usersController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = createUserSchema.parse(request.body);
    try {
      const usecase = container.resolve(TOKENS.createUser) as CreateUser;
      const user = await usecase.execute(payload as any);
      return reply.status(201).send(user);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const usecase = container.resolve(TOKENS.listUsers) as ListUsers;
    const users = await usecase.execute();
    return reply.status(200).send(users);
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params);
    const payload = updateUserSchema.parse(request.body);
    try {
      const usecase = container.resolve(TOKENS.updateUser) as UpdateUser;
      const user = await usecase.execute(params.id, payload as any);
      return reply.status(200).send(user);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params);
    try {
      const usecase = container.resolve(TOKENS.deleteUser) as DeleteUser;
      await usecase.execute(params.id);
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send({ error: 'Não autenticado' });
    if (request.user.role !== 'ADMIN') return reply.status(403).send({ error: 'Apenas ADMIN pode resetar senhas' });

    const params = paramsSchema.parse(request.params);
    try {
      const newPassword = generatePassword();
      const usecase = container.resolve(TOKENS.updateUser) as UpdateUser;
      const user = await usecase.execute(params.id, { password: newPassword } as any);
      
      // Retorna o usuário com a nova senha temporária
      return reply.status(200).send({ 
        ...user, 
        tempPassword: newPassword,
        message: 'Senha resetada com sucesso. A senha temporária deve ser compartilhada com o usuário.'
      });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },
};
