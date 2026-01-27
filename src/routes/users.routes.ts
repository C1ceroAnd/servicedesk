import { FastifyInstance } from 'fastify';
import { usersController } from '../controllers/users.controller.js';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware.js';

export async function usersRoutes(app: FastifyInstance) {
  const adminOnly = { preHandler: [authMiddleware, requireRoles(['ADMIN'])] };

  app.post('/users', {
    ...adminOnly,
    schema: {
      tags: ['users'],
      summary: 'Criar usuário (ADMIN)',
      description: 'ADMIN cria novo usuário. Senha é gerada automaticamente.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'email', 'role'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['USER', 'TECNICO', 'ADMIN'] },
          // Accept numeric localId or a string name to auto-create
          localId: { type: ['number', 'string', 'null'] }
        }
      },
      response: {
        201: {
          description: 'Usuário criado com senha temporária',
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            localId: { type: ['number', 'null'] },
            tempPassword: { type: 'string' }
          }
        }
      }
    }
  }, usersController.create);

  app.get('/users', {
    ...adminOnly,
    schema: {
      tags: ['users'],
      summary: 'Listar usuários (ADMIN)',
      description: 'ADMIN visualiza todos os usuários do sistema',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Lista de usuários',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              localId: { type: ['number', 'null'] }
            }
          }
        }
      }
    }
  }, usersController.list);

  app.patch('/users/:id', {
    ...adminOnly,
    schema: {
      tags: ['users'],
      summary: 'Atualizar usuário (ADMIN)',
      description: 'ADMIN edita informações de um usuário',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['USER', 'TECNICO', 'ADMIN'] },
          localId: { type: ['number', 'null'] }
        }
      },
      response: {
        200: {
          description: 'Usuário atualizado',
          type: 'object'
        }
      }
    }
  }, usersController.update);

  app.delete('/users/:id', {
    ...adminOnly,
    schema: {
      tags: ['users'],
      summary: 'Deletar usuário (ADMIN)',
      description: 'ADMIN remove um usuário do sistema',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        204: {
          description: 'Usuário removido',
          type: 'null'
        },
        400: {
          description: 'Usuário possui chamados abertos e não pode ser removido',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, usersController.delete);

  app.patch('/users/:id/reset-password', {
    ...adminOnly,
    schema: {
      tags: ['users'],
      summary: 'Resetar senha (ADMIN)',
      description: 'ADMIN redefine senha de um usuário',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          description: 'Senha resetada com sucesso',
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            localId: { type: ['number', 'null'] },
            tempPassword: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, usersController.resetPassword);
}
