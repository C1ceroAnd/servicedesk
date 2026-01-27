import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', {
    schema: {
      tags: ['auth'],
      summary: 'Registrar novo usuário',
      description: 'Cria um novo usuário no sistema',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['ADMIN', 'TECNICO', 'USER'], default: 'USER' }
        }
      },
      response: {
        201: {
          description: 'Usuário criado com sucesso',
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' }
          }
        }
      }
    }
  }, authController.register);

  app.post('/auth/login', {
    schema: {
      tags: ['auth'],
      summary: 'Login de usuário',
      description: 'Autentica usuário e retorna tokens JWT',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Login realizado com sucesso',
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'Token de acesso (15 minutos)' },
            refreshToken: { type: 'string', description: 'Token de renovação (7 dias)' },
            user: {
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
        },
        401: {
          description: 'Credenciais inválidas',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, authController.login);

  app.post('/auth/refresh', {
    schema: {
      tags: ['auth'],
      summary: 'Renovar tokens',
      description: 'Renova access token e refresh token usando refresh token válido',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', description: 'Refresh token obtido no login' }
        }
      },
      response: {
        200: {
          description: 'Tokens renovados com sucesso',
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },
        401: {
          description: 'Refresh token inválido ou expirado',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, authController.refresh);
}
