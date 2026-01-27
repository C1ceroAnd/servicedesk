import { FastifyInstance } from 'fastify';
import { ticketsController } from '../controllers/tickets.controller.js';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware.js';

export async function ticketsRoutes(app: FastifyInstance) {
  const authenticated = { preHandler: [authMiddleware] };
  const tecnicoOnly = { preHandler: [authMiddleware, requireRoles(['TECNICO'])] };
  const searchAllowed = { preHandler: [authMiddleware, requireRoles(['TECNICO', 'ADMIN'])] };

  app.post('/tickets', {
    ...authenticated,
    schema: {
      tags: ['tickets'],
      summary: 'Criar novo chamado',
      description: 'USER cria novo chamado vinculado ao seu local',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          localId: { type: ['number', 'string'] }
        }
      },
      response: {
        201: {
          description: 'Chamado criado com sucesso',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            userId: { type: 'number' },
            localId: { type: 'number' }
          }
        }
      }
    }
  }, ticketsController.create);

  app.get('/tickets', {
    ...authenticated,
    schema: {
      tags: ['tickets'],
      summary: 'Listar chamados',
      description: 'USER vê apenas seus chamados, TECNICO/ADMIN veem todos',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          localId: { type: 'number' },
          search: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Lista de chamados',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              description: { type: 'string' },
              status: { type: 'string' },
              userId: { type: 'number' },
              tecnicoId: { type: ['number', 'null'] },
              localId: { type: 'number' },
              createdAt: { type: 'string' },
              dataAceito: { type: ['string', 'null'] },
              dataFechamento: { type: ['string', 'null'] },
              user: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              },
              tecnico: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              },
              local: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, ticketsController.list);

  app.get('/tickets/search', {
    ...searchAllowed,
    schema: {
      tags: ['tickets'],
      summary: 'Buscar chamados (TECNICO/ADMIN)',
      description: 'Busca avançada por texto em título/descrição',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
          localId: { type: 'number' }
        }
      },
      response: {
        200: {
          description: 'Chamados encontrados',
          type: 'array'
        }
      }
    }
  }, ticketsController.list);

  app.patch('/tickets/:id/accept', {
    ...tecnicoOnly,
    schema: {
      tags: ['tickets'],
      summary: 'Aceitar chamado (TECNICO)',
      description: 'TECNICO aceita chamado PENDING → IN_PROGRESS',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          description: 'Chamado aceito com sucesso',
          type: 'object',
          properties: {
            id: { type: 'number' },
            status: { type: 'string' },
            tecnicoId: { type: 'number' }
          }
        }
      }
    }
  }, ticketsController.accept);

  app.patch('/tickets/:id/finalize', {
    ...tecnicoOnly,
    schema: {
      tags: ['tickets'],
      summary: 'Finalizar chamado (TECNICO)',
      description: 'TECNICO finaliza chamado IN_PROGRESS → COMPLETED',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          description: 'Chamado finalizado',
          type: 'object',
          properties: {
            id: { type: 'number' },
            status: { type: 'string' },
          }
        }
      }
    }
  }, ticketsController.finalize);

  app.patch('/tickets/:id/cancel', {
    ...authenticated,
    schema: {
      tags: ['tickets'],
      summary: 'Cancelar chamado',
      description: 'Usuário cancela seu próprio chamado',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      }
    }
  }, ticketsController.cancel);

  app.patch('/tickets/:id/reject', {
    ...tecnicoOnly,
    schema: {
      tags: ['tickets'],
      summary: 'Rejeitar chamado (TECNICO)',
      description: 'TECNICO rejeita chamado',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      }
    }
  }, ticketsController.reject);

  app.delete('/tickets/user/:userId/completed', {
    ...authenticated,
    schema: {
      tags: ['tickets'],
      summary: 'Deletar chamados completos',
      description: 'Remove chamados finalizados de um usuário',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'number' }
        }
      }
    }
  }, ticketsController.deleteCompleted);
}
