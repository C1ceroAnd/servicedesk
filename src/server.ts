import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import { config } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { usersRoutes } from './routes/users.routes';
import { localsRoutes } from './routes/locals.routes';
import { ticketsRoutes } from './routes/tickets.routes';
import { container, TOKENS } from './core/container';

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Swagger Configuration
app.register(swagger, {
  openapi: {
    info: {
      title: 'ServiceDesk API',
      description: 'Sistema de Gestão de Chamados - Documentação da API REST',
      version: '1.0.0',
      contact: {
        name: 'ServiceDesk Team',
        email: 'support@servicedesk.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.servicedesk.com',
        description: 'Servidor de Produção'
      }
    ],
    tags: [
      { name: 'auth', description: 'Autenticação e autorização' },
      { name: 'users', description: 'Gestão de usuários (ADMIN)' },
      { name: 'tickets', description: 'Gestão de chamados' },
      { name: 'locals', description: 'Gestão de locais' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login'
        }
      }
    }
  }
});

app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
});

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

app.register(authRoutes);
app.register(usersRoutes);
app.register(localsRoutes);
app.register(ticketsRoutes);

// Graceful shutdown
app.addHook('onClose', async () => {
  const prisma = container.resolve(TOKENS.prisma) as PrismaClient;
  await prisma.$disconnect();
});

// Iniciar servidor
const start = async () => {
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Servidor rodando em http://localhost:${config.port}`);
    console.log(`📚 Documentação Swagger: http://localhost:${config.port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
