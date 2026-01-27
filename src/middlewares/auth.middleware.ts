import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

type JwtPayload = {
  id: number;
  role: 'ADMIN' | 'TECNICO' | 'USER';
  localId?: number | null;
};

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token não fornecido' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    request.user = {
      id: decoded.id,
      role: decoded.role,
      localId: decoded.localId ?? undefined,
    };
  } catch (error) {
    return reply.status(401).send({ error: 'Token inválido' });
  }
}

export function requireRoles(roles: Array<JwtPayload['role']>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Acesso negado' });
    }
  };
}
