# ServiceDesk - Sistema de Gestão de Chamados

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.7-000000.svg)](https://fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748.svg)](https://prisma.io/)

Solução prática e segura para abrir, atender e administrar chamados técnicos.

## 📋 Visão Geral

O ServiceDesk centraliza solicitações de suporte: usuários criam chamados, técnicos atendem e administradores gerenciam usuários, locais e tickets com salvaguardas para evitar inconsistências.

### Funcionalidades Principais

- 🔐 **Autenticação JWT** com Access Token + Refresh Token
- 👥 **3 Perfis de Usuário**: ADMIN, TÉCNICO e USER
- 📍 **Gestão de Locais**: Cadastro dinâmico de locais
- 🎫 **Gestão de Chamados**: Fluxo completo PENDENTE → EM_ANDAMENTO → CONCLUÍDO
- 🔍 **Busca Inteligente**: Por título, descrição ou local
- 📊 **Dashboard Administrativo**: Visão completa do sistema

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite 7 + TypeScript |
| Backend | Node.js + Fastify 5 + TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) + Prisma ORM |
| Testes | Jest 30 + Testing Library |
| Segurança | JWT + Bcryptjs + RBAC |
| Validação | Zod |

## 📁 Estrutura do Projeto

```
servicedesk/
├── src/                        # Backend (API)
│   ├── application/            # Use cases & ports
│   │   ├── usecases/           # Lógica de negócio
│   │   └── ports/              # Interfaces (repositories, providers)
│   ├── controllers/            # HTTP handlers
│   ├── routes/                 # Fastify route schemas
│   ├── infrastructure/         # Implementações (Prisma, JWT, Bcrypt)
│   ├── middlewares/            # Auth middleware
│   ├── config/                 # Variáveis de ambiente
│   ├── core/                   # DI container
│   ├── domain/                 # Roles e tipos
│   └── server.ts               # Entry point
│
├── frontend/                   # Frontend (React + Vite)
│   └── src/
│       ├── features/           # Feature-first (auth, tickets, users, locals)
│       ├── shared/             # Componentes compartilhados
│       ├── services/           # API client, AuthService
│       └── app/                # Router e layout
│
├── prisma/                     # Schema, migrations e seed
├── tests/                      # Testes unitários e de integração
├── docs/                       # Documentação completa
└── package.json                # Dependências e scripts
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js 22.x ou superior
- npm 10.x ou superior

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/C1ceroAnd/servicedesk.git
cd servicedesk

# Instalar dependências (backend + frontend)
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Configurar banco de dados
npx prisma migrate dev
npm run seed
```

### Desenvolvimento

```bash
# Rodar API e Frontend em paralelo
npm run dev

# Ou rodar separadamente:
npm run dev:api   # Terminal 1 - Backend
npm run dev:web   # Terminal 2 - Frontend
```

### URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3333 |
| Swagger Docs | http://localhost:3333/docs |

### Build & Deploy

```bash
# Build completo (backend + frontend)
npm run build

# Rodar em produção
npm start
```

## 🏗️ Arquitetura

### Backend - Clean Architecture

```
┌─────────────────────────────────────────────────────────┐
|                    Presentation Layer                   │
│              (Controllers, Routes, Middlewares)         │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                    │
│                   (Use Cases, Ports)                    │
├─────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                  │
│            (Repositories, Providers, Prisma)            │
├─────────────────────────────────────────────────────────┤
│                      Domain Layer                       │
│                    (Roles, Types)                       │
└─────────────────────────────────────────────────────────┘
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

## 🔐 Autenticação e Segurança

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

## 🧪 Testes

O projeto possui uma suite completa de testes unitários e de integração:

```bash
# Rodar todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Com coverage
npm run test:coverage

# Modo verbose
npm run test:verbose
```

### Estrutura de Testes

```
tests/
├── unit/
│   ├── usecases/           # Testes de use cases
│   ├── infrastructure/     # Testes de providers
│   └── frontend/           # Testes de serviços e componentes
└── integration/
    ├── backend/            # Fluxos completos da API
    └── frontend/           # Autenticação e route guards
```

## 💻 Tecnologias

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

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Desenvolvimento completo (API + Web) |
| `npm run dev:api` | Apenas API |
| `npm run dev:web` | Apenas Frontend |
| `npm run build` | Build backend + frontend |
| `npm run build:api` | Build apenas backend |
| `npm run build:web` | Build apenas frontend |
| `npm start` | Rodar servidor (produção) |
| `npm run seed` | Popular banco de dados |
| `npm test` | Rodar testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com coverage |
| `npm run preview` | Preview do frontend build |

## 📚 Documentação

Todos os documentos estão em `docs/`:

| Documento | Propósito |
|-----------|-----------|
| [CONTEXTO_DO_PROJETO.md](docs/CONTEXTO_DO_PROJETO.md) | Visão geral e escopo |
| [CONTRATO_API.md](docs/CONTRATO_API.md) | Endpoints, requests e responses |
| [SWAGGER.md](docs/SWAGGER.md) | Documentação Swagger UI |
| [ARQUITETURA_E_ESTRUTURA.md](docs/ARQUITETURA_E_ESTRUTURA.md) | Organização de pastas e camadas |
| [MODELAGEM_DADOS.md](docs/MODELAGEM_DADOS.md) | Schema Prisma e models |
| [REQUISITOS_FUNCIONAIS.md](docs/REQUISITOS_FUNCIONAIS.md) | Requisitos funcionais |
| [REQUISITOS_NAO_FUNCIONAIS.md](docs/REQUISITOS_NAO_FUNCIONAIS.md) | Requisitos não funcionais |
| [CASOS_DE_USO.md](docs/CASOS_DE_USO.md) | Casos de uso detalhados |
| [HISTORIAS_USUARIO.md](docs/HISTORIAS_USUARIO.md) | Histórias de usuário |
| [GUIA_DESENVOLVIMENTO.md](docs/GUIA_DESENVOLVIMENTO.md) | Como desenvolver e debugar |

## 👥 Perfis de Usuário

| Role | Descrição | Permissões |
|------|-----------|------------|
| **USER** | Usuário comum | Criar/visualizar seus chamados |
| **TÉCNICO** | Atendente | Aceitar, resolver e buscar chamados |
| **ADMIN** | Administrador | Gerenciar usuários, locais e visualizar tudo |

## 🛠️ Desenvolvimento

### Adicionar Nova Feature (Frontend)

1. Criar pasta `frontend/src/features/[nome]/`
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

1. Criar em `src/application/usecases/[dominio]/[OperacaoNome].ts`
2. Implementar interface com método `execute()`
3. Registrar no `src/core/container.ts`
4. Usar em controller via `container.resolve(TOKENS.xxx)`

## 🔧 Variáveis de Ambiente

```bash
# Servidor
PORT=3333

# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="seu-secret-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="seu-refresh-secret-aqui"
JWT_REFRESH_EXPIRES_IN="7d"
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Colaboradores

Cairon Ferreira Prado
Cícero Andrade Santos
Fabricío Mota de Carvalho
Matusalen Costa Alves

**Última atualização:** Janeiro 2026
