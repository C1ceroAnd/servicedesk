import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { container, TOKENS } from '../core/container.js';
import { RegisterUser } from '../application/usecases/auth/RegisterUser.js';
import { LoginUser } from '../application/usecases/auth/LoginUser.js';
import { RefreshToken } from '../application/usecases/auth/RefreshToken.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
  localId: z.number().int().positive().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const payload = registerSchema.parse(request.body);

    try {
      const usecase = container.resolve(TOKENS.registerUser) as RegisterUser;
      const user = await usecase.execute(payload as any);
      return reply.status(201).send(user);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message || 'Erro ao registrar' });
    }
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const payload = loginSchema.parse(request.body);

    try {
      const usecase = container.resolve(TOKENS.loginUser) as LoginUser;
      const result = await usecase.execute(payload);
      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(401).send({ error: error.message || 'Credenciais inválidas' });
    }
  },

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const payload = refreshTokenSchema.parse(request.body);

    try {
      const usecase = container.resolve(TOKENS.refreshToken) as RefreshToken;
      const result = await usecase.execute(payload.refreshToken);
      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(401).send({ error: error.message || 'Token inválido' });
    }
  },
};
