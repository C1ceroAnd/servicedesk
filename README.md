# ServiceDesk - Sistema de Gestão de Chamados

Solução prática e segura para abrir, atender e administrar chamados técnicos.

## Visão Geral

O ServiceDesk centraliza solicitações de suporte: usuários criam chamados, técnicos atendem e administradores gerenciam usuários, locais e tickets com salvaguardas para evitar inconsistências.

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Node.js + Fastify + TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) + Prisma ORM |
| Segurança | JWT + Bcryptjs |

## Estrutura do Projeto

```
servicedesk/
├── src/
│   ├── application/        # Use cases & ports
│   ├── controllers/        # HTTP endpoints
│   ├── routes/             # Fastify route schemas
│   ├── infrastructure/     # Prisma repositories, providers
│   ├── middlewares/
│   ├── config/             # env, tokens
│   ├── core/               # DI container
│   ├── domain/             # Roles e tipos
│   ├── frontend/           # React + Vite app
│   └── server.ts
├── prisma/                 # Schema e migrations
├── docs/                   # Documentação (API, requisitos, casos de uso)
├── package.json            # Dependências root
├── tsconfig.json           # Backend config
└── README.md
```

## Quick Start

### Instalação

```bash
# Instalar dependências (backend + frontend)
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Desenvolvimento

```bash
# Rodar ambos API e Web em paralelo
npm run dev

# Ou rodar separadamente:
npm run dev:api   # Terminal 1
npm run dev:web   # Terminal 2
```

URLs importantes:
- Backend: http://localhost:3333
- Frontend: http://localhost:5173
- Swagger Docs: http://localhost:3333/docs

### Build & Deploy

```bash
# Build backend + frontend
npm run build

# Rodar servidor em produção
npm start
```

## Arquitetura

### Backend - Clean Architecture

```
Domain Layer (roles.ts, types)
    ↓
Application Layer (Use Cases, Ports/Interfaces)
    ↓
Infrastructure Layer (Repositories, Providers, Prisma)
    ↓
Presentation Layer (Controllers, Routes)
```

**DI Container**: Gerencia todas as dependências
- Tokens como Symbols para type-safety
- Singleton pattern para instâncias compartilhadas
- Lazy resolution para eficiência

### Frontend - Feature-First (Vertical Slice)

Cada feature é auto-contida com:
- **Hooks**: Custom hooks para lógica de dados
- **Contexts**: Estado compartilhado (auth)
- **Pages**: Telas da aplicação
- **Components**: UI específicos da feature

**Shared**: Componentes reutilizáveis em single barrel export

**Services**: Camada de comunicação (API, domain logic)

## Autenticação e Segurança

### Sistema de Tokens JWT

O projeto implementa um sistema robusto de autenticação com **Access Token** e **Refresh Token**:

#### Access Token
- **Duração**: 15 minutos (configurável via `JWT_EXPIRES_IN`)
- **Armazenamento**: localStorage como `accessToken`
- **Uso**: Enviado em todas as requisições autenticadas via header `Authorization: Bearer <token>`
- **Payload**: `{ id, email, role, localId }`

#### Refresh Token
- **Duração**: 7 dias (configurável via `JWT_REFRESH_EXPIRES_IN`)
- **Armazenamento**: localStorage como `refreshToken`
- **Uso**: Renova o Access Token quando este expira
- **Endpoint**: `POST /auth/refresh`

### Fluxo de Autenticação

1. **Login**: Retorna `{ accessToken, refreshToken, user }`
2. **Requisição Autenticada**: Access Token é enviado no header
3. **Token Expirado**: Interceptor axios detecta 401
4. **Renovação Automática**: Envia Refresh Token para `/auth/refresh`
5. **Novo Par de Tokens**: Recebe novos `accessToken` e `refreshToken`
6. **Retry da Requisição Original**: Com novo Access Token

### Segurança Adicional

- **Role-based Access Control** (ADMIN, TECNICO, USER)
- Senhas criptografadas com bcrypt (salt rounds: 10)
- Tokens assinados com secrets diferentes
- Refresh Token rotation (novo token a cada renovação)
- Logout limpa todos os tokens do localStorage

## Tecnologias

### Backend
- `fastify` - Framework HTTP
- `@prisma/client` - ORM
- `bcryptjs` - Hash seguro
- `jsonwebtoken` - JWT
- `zod` - Validação de schema

### Frontend
- `react` 18 - UI library
- `react-router-dom` - Routing
- `vite` - Build tool
- `axios` - HTTP client
- `typescript` - Type safety

## Scripts

```bash
npm run dev              # Desenvolvimento completo
npm run dev:api         # Apenas API
npm run dev:web         # Apenas Frontend
npm run build           # Build backend + frontend
npm run build:api       # Build backend
npm run build:web       # Build frontend
npm run start           # Rodar servidor (produção)
npm run seed            # Seed database
npm run preview         # Preview frontend build
```

## Documentação

Todos os documentos estão em `docs/`:

| Documento | Propósito |
|-----------|-----------|
| [CONTEXTO_DO_PROJETO.md](docs/CONTEXTO_DO_PROJETO.md) | Visão geral |
| [CONTRATO_API.md](docs/CONTRATO_API.md) | Endpoints, requests e responses |
| [SWAGGER.md](docs/SWAGGER.md) | Documentação Swagger UI (interativa) |
| [ARQUITETURA_E_ESTRUTURA.md](docs/ARQUITETURA_E_ESTRUTURA.md) | Organização de pastas e camadas |
| [MODELAGEM_DADOS.md](docs/MODELAGEM_DADOS.md) | Schema Prisma e models |
| [REQUISITOS_FUNCIONAIS.md](docs/REQUISITOS_FUNCIONAIS.md) | Requisitos funcionais atualizados |
| [REQUISITOS_NAO_FUNCIONAIS.md](docs/REQUISITOS_NAO_FUNCIONAIS.md) | Requisitos não funcionais |
| [REQUISITOS_E_REGRAS.md](docs/REQUISITOS_E_REGRAS.md) | Regras de negócio |
| [CASOS_DE_USO.md](docs/CASOS_DE_USO.md) | Casos de uso |
| [HISTORIAS_USUARIO.md](docs/HISTORIAS_USUARIO.md) | Histórias de usuário |
| [GUIA_DESENVOLVIMENTO.md](docs/GUIA_DESENVOLVIMENTO.md) | Como rodar, desenvolver e debugar |
| [GUIA_TESTES.md](docs/GUIA_TESTES.md) | Como rodar testes e entender coverage |

Acesse http://localhost:3333/docs para documentação interativa.

## Desenvolvimento

### Adicionar Nova Feature (Frontend)

1. Criar pasta `src/frontend/src/features/[nome]/`
2. Estrutura:
   ```
   features/[nome]/
   ├── hooks/
   ├── pages/
   ├── components/ (opcional)
   └── index.ts (barrel export)
   ```
3. Exportar em `features/[nome]/index.ts`

### Adicionar Novo Use Case (Backend)

1. Criar em `src/application/usecases/[dominio]/[OperacaoDo].ts`
2. Implementar interface com método `execute()`
3. Registrar no `src/core/container.ts`
4. Usar em controller via `container.resolve(TOKENS.xxx)`

## Licença

ISC

## Contribuição

See CONTRIBUTING.md

---

Última atualização: Janeiro 2026
