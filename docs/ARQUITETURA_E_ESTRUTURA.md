# Arquitetura e Estrutura do Projeto

## Objetivo
Descrever a organização de pastas e o fluxo de dados. O ServiceDesk segue **Clean Architecture** com **Use Cases** como núcleo da lógica de negócio.

---

## 1. Estrutura de Diretórios

```
servicedesk/
├── prisma/
│   ├── schema.prisma              # Schema do banco (models)
│   ├── migrations/                # Histórico de mudanças
│   └── seed.ts                    # Dados iniciais
│
├── src/
│   ├── application/               # Use Cases & Ports (Lógica de Negócio)
│   │   ├── usecases/
│   │   │   ├── auth/              # Login, Register, RefreshToken
│   │   │   ├── tickets/           # CreateTicket, AcceptTicket, etc
│   │   │   ├── users/             # CreateUser, UpdateUser, etc
│   │   │   └── locals/            # CreateLocal, DeleteLocal
│   │   └── ports/                 # Interfaces (Repositories, Providers)
│   │       ├── repositories.ts    # IUserRepository, ITicketRepository, etc
│   │       └── providers.ts       # IPasswordHasher, ITokenProvider
│   │
│   ├── infrastructure/            # Implementações concretas
│   │   ├── repositories/          # PrismaUserRepository, PrismaTicketRepository, etc
│   │   └── providers/             # JwtTokenProvider, BcryptPasswordHasher
│   │
│   ├── controllers/               # HTTP Handlers (Camada de Apresentação)
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── tickets.controller.ts
│   │   └── locals.controller.ts
│   │
│   ├── routes/                    # Definição de endpoints
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── tickets.routes.ts
│   │   └── locals.routes.ts
│   │
│   ├── middlewares/               # Interceptadores (Auth, Error handling)
│   │   └── auth.middleware.ts
│   │
│   ├── core/                      # DI Container
│   │   └── container.ts           # Injeção de dependências
│   │
│   ├── domain/                    # Tipos e Enums do domínio
│   │   └── roles.ts               # ADMIN, TECNICO, USER
│   │
│   ├── config/                    # Configurações
│   │   └── env.ts                 # Variáveis de ambiente
│   │
│   ├── types/                     # Tipos TypeScript globais
│   │   └── fastify.d.ts           # Extensão do Request
│   │
│   ├── frontend/                  # Frontend React + Vite
│   │   └── src/
│   │       ├── features/          # Feature-first (auth, tickets, users, locals)
│   │       ├── shared/            # Componentes compartilhados
│   │       ├── services/          # API client, AuthService, etc
│   │       ├── types/             # Tipos frontend
│   │       └── app/               # Router e layout
│   │
│   └── server.ts                  # Ponto de entrada (Fastify setup)
│
├── tests/                         # Suite de testes
│   ├── unit/
│   │   ├── usecases/              # Testes dos use cases
│   │   ├── infrastructure/        # Testes de providers
│   │   └── frontend/              # Testes de serviços/componentes
│   └── integration/
│       ├── backend/               # Testes de fluxos completos
│       └── frontend/              # Testes de fluxos de autenticação e guards
│
├── docs/                          # Documentação
├── .env                           # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── jest.config.cjs
```

---

## 2. Camadas da Arquitetura

### 2.1 Domain Layer (Domínio)
**Arquivo:** `src/domain/roles.ts`

Define os tipos e enums do negócio:
```typescript
enum Role {
  ADMIN,    // Administrador
  TECNICO,  // Atendente técnico
  USER      // Usuário comum
}
```

---

### 2.2 Application Layer (Casos de Uso)

**Localização:** `src/application/usecases/`

Contém toda a lógica de negócio. Exemplo `CreateTicket.ts`:

```typescript
export class CreateTicket {
  constructor(
    private ticketRepository: ITicketRepository,
    private userRepository: IUserRepository,
    private localRepository: ILocalRepository
  ) {}

  async execute(params: CreateTicketInput): Promise<Ticket> {
    // Validar usuário existe
    const user = await this.userRepository.findById(params.requesterId);
    if (!user) throw new Error('Usuário não existe');

    // Validar local existe (se necessário)
    if (params.localId) {
      const local = await this.localRepository.findById(params.localId);
      if (!local) throw new Error('Local não existe');
    }

    // Criar ticket
    return this.ticketRepository.create(params);
  }
}
```

**Ports (Interfaces):**

`src/application/ports/repositories.ts` - Contratos de dados:
```typescript
interface ITicketRepository {
  create(data: CreateTicketInput): Promise<Ticket>;
  findById(id: number): Promise<Ticket | null>;
  update(id: number, data: UpdateTicketInput): Promise<Ticket>;
}
```

`src/application/ports/providers.ts` - Contratos de serviços:
```typescript
interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
```

---

### 2.3 Infrastructure Layer (Implementações)

**Repositories:** `src/infrastructure/repositories/`

Implementam `ITicketRepository` usando Prisma:
```typescript
export class PrismaTicketRepository implements ITicketRepository {
  async create(data: CreateTicketInput): Promise<Ticket> {
    return prisma.ticket.create({ data });
  }
}
```

**Providers:** `src/infrastructure/providers/`

Implementam `IPasswordHasher` e `ITokenProvider`:
```typescript
export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
```

---

### 2.4 Presentation Layer (Apresentação)

**Controllers:** `src/controllers/`

Recebem HTTP, chamam Use Case, retornam resposta:
```typescript
export class TicketsController {
  async create(req: FastifyRequest, res: FastifyReply) {
    const useCase = container.resolve(TOKENS.CreateTicketUseCase);
    
    const result = await useCase.execute(req.body);
    
    res.status(201).json(result);
  }
}
```

**Routes:** `src/routes/`

Define endpoints:
```typescript
export async function ticketsRoutes(fastify: FastifyInstance) {
  fastify.post('/', { onRequest: authMiddleware }, 
    ticketsController.create);
  fastify.get('/', { onRequest: authMiddleware }, 
    ticketsController.list);
}
```

**Middlewares:** `src/middlewares/`

Valida requisições antes do controller:
```typescript
export async function authMiddleware(request: FastifyRequest) {
  const token = request.headers.authorization?.split(' ')[1];
  if (!token) throw new Unauthorized('Token não fornecido');
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  request.user = decoded;
}
```

---

### 2.5 Core Layer (DI Container)

**Arquivo:** `src/core/container.ts`

Gerencia injeção de dependências:
```typescript
const container = new Container();

// Registrar repositories
container.register(TOKENS.TicketRepository, () => 
  new PrismaTicketRepository()
);

// Registrar use cases
container.register(TOKENS.CreateTicketUseCase, () =>
  new CreateTicket(
    container.resolve(TOKENS.TicketRepository),
    container.resolve(TOKENS.UserRepository),
    container.resolve(TOKENS.LocalRepository)
  )
);
```

---

## 3. Fluxo de uma Requisição

Quando o cliente faz `POST /tickets`:

```
1. Cliente envia HTTP POST /tickets com body
                ↓
2. auth.middleware valida JWT token
                ↓
3. ticketsRoutes encaminha para ticketsController.create
                ↓
4. Controller extrai dados de req.body
                ↓
5. Controller resolve CreateTicketUseCase do container
                ↓
6. Use Case valida regras de negócio
   - Verifica se usuário existe
   - Verifica se local é válido
                ↓
7. Use Case chama ticketRepository.create
                ↓
8. Repository executa Prisma (cria no banco)
                ↓
9. Ticket criado é retornado ao Use Case
   → Use Case retorna ao Controller
   → Controller retorna HTTP 201 com dados
                ↓
10. Cliente recebe resposta JSON
```

---

## 4. Por que Clean Architecture?

- Independência de Framework - Se trocar Fastify, não muda lógica
- Testabilidade - Use Cases testáveis sem HTTP
- Independência de Banco - Se trocar Prisma → TypeORM, muda só repositories
- Manutenibilidade - Cada camada tem responsabilidade clara
- Escalabilidade - Adicionar features sem afetar o resto

---

## 5. Decisões de Design

### Por que Use Cases em vez de Services?
- Use Cases encapsulam um **caso de uso específico** do negócio
- Services são genéricos, Use Cases são precisos
- Melhor para testes e documentação

### Por que Ports/Interfaces?
- Desacoplam aplicação de implementações
- Fácil trocar banco, cache, etc sem mudar lógica

### Por que DI Container?
- Centraliza criação de dependências
- Facilita testes (mockar dependencies)
- Reduz acoplamento entre camadas

---

## 6. Documentos Relacionados

- [Contexto do Projeto](CONTEXTO_DO_PROJETO.md) — Visão geral e objetivos
- [Contrato da API](CONTRATO_API.md) — Definições de endpoints
- [Swagger UI](SWAGGER.md) — Documentação interativa em /docs
- [Modelagem de Dados](MODELAGEM_DADOS.md) — Estrutura e restrições do banco
- [Requisitos e Regras](REQUISITOS_E_REGRAS.md) — Regras de negócio e permissões
- [Guia de Desenvolvimento](GUIA_DESENVOLVIMENTO.md) — Como rodar e debugar
- [Guia de Testes](GUIA_TESTES.md) — Estratégia e métricas de testes
