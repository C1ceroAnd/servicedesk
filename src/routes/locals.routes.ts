import { FastifyInstance } from 'fastify';
import { localsController } from '../controllers/locals.controller.js';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware.js';

export async function localsRoutes(app: FastifyInstance) {
  const adminOnly = { preHandler: [authMiddleware, requireRoles(['ADMIN'])] };
  const authenticated = { preHandler: [authMiddleware] };

  app.post('/locals', {
    ...adminOnly,
    schema: {
      tags: ['locals'],
      summary: 'Criar local (ADMIN)',
      description: 'ADMIN cadastra novo local/setor',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'Local criado',
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            active: { type: 'boolean' }
          }
        }
      }
    }
  }, localsController.create);

  app.get('/locals', {
    ...authenticated,
    schema: {
      tags: ['locals'],
      summary: 'Listar locais',
      description: 'Todos os usuários autenticados podem visualizar locais',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Lista de locais',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              active: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, localsController.list);

  app.patch('/locals/:id', {
    ...adminOnly,
    schema: {
      tags: ['locals'],
      summary: 'Atualizar local (ADMIN)',
      description: 'ADMIN pode renomear um local',
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
          name: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Local atualizado',
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            active: { type: 'boolean' }
          }
        }
      }
    }
  }, localsController.update);

  app.delete('/locals/:id', {
    ...adminOnly,
    schema: {
      tags: ['locals'],
      summary: 'Deletar local (ADMIN)',
      description: 'ADMIN remove local (valida se não há chamados PENDING)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        204: {
          description: 'Local removido',
          type: 'null'
        },
        400: {
          description: 'Local possui chamados pendentes',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, localsController.delete);
}
