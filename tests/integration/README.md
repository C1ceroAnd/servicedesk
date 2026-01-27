# Testes de Integração - Estrutura Refatorada

## 📋 Visão Geral

Os testes de integração foram refatorados para serem **mais modulares**, **focados** e **fáceis de manter**. 

### Antes da Refatoração
- ❌ 3 arquivos grandes (200-340 linhas cada)
- ❌ Alta duplicação de código
- ❌ Testes muito extensos e difíceis de entender
- ❌ Difícil manutenção

### Depois da Refatoração
- ✅ 9 arquivos focados (50-150 linhas cada)
- ✅ Factories e helpers reutilizáveis
- ✅ Testes pequenos e específicos
- ✅ Fácil manutenção e extensão

---

## 🗂️ Nova Estrutura

```
tests/integration/
├── helpers/
│   └── mock-factories.ts          # Factories para mocks e fixtures
└── backend/
    ├── auth-flow.integration.test.ts           # Autenticação (registro, login, refresh)
    ├── ticket-create.integration.test.ts       # Criação de tickets
    ├── ticket-workflow.integration.test.ts     # Ciclo de vida dos tickets
    ├── ticket-constraints.integration.test.ts  # Regras e filtros de tickets
    ├── user-crud.integration.test.ts           # CRUD de usuários
    ├── user-local-relationship.integration.test.ts  # Relacionamento user-local
    ├── user-permissions.integration.test.ts    # Permissões por role
    └── local-management.integration.test.ts    # Gerenciamento de locais
```

---

## 🏭 Helpers e Factories

### `mock-factories.ts`

Centraliza a criação de mocks e fixtures para evitar duplicação:

#### Mock Repository Factories
```typescript
createMockUserRepository()
createMockLocalRepository()
createMockTicketRepository()
createMockPasswordHasher()
createMockJwtProvider()
```

#### Fixture Factories
```typescript
createUserFixture({ id: 1, role: 'ADMIN' })
createLocalFixture({ name: 'Sala A' })
createTicketFixture({ status: 'PENDING' })
```

#### Utilities
```typescript
resetRepositoryMocks(repository) // Reseta todos os mocks
```

---

## 📝 Arquivos de Teste

### 1. **auth-flow.integration.test.ts**
**Responsabilidade:** Fluxo completo de autenticação

**Testes:**
- ✅ Registro e login
- ✅ Rejeitar login com email inválido
- ✅ Rejeitar login com senha inválida
- ✅ Renovar token com refresh token válido
- ✅ Rejeitar refresh token inválido
- ✅ Autorização por role

---

### 2. **ticket-create.integration.test.ts**
**Responsabilidade:** Criação de tickets

**Testes:**
- ✅ Criar ticket com dados válidos
- ✅ Validar que usuário e local existem
- ✅ Criar ticket com mesmo localId do usuário

---

### 3. **ticket-workflow.integration.test.ts**
**Responsabilidade:** Ciclo de vida dos tickets

**Testes:**
- ✅ Processar ticket do início ao fim (PENDING → IN_PROGRESS → COMPLETED)
- ✅ Permitir que criador cancele ticket PENDING
- ✅ Permitir que técnico rejeite ticket com motivo

---

### 4. **ticket-constraints.integration.test.ts**
**Responsabilidade:** Regras de negócio e filtros

**Testes:**
- ✅ Listar tickets de um local específico
- ✅ Listar tickets de um usuário específico
- ✅ Não permitir deletar local com tickets abertos
- ✅ Permitir deletar local sem tickets abertos

---

### 5. **user-crud.integration.test.ts**
**Responsabilidade:** Operações CRUD de usuários

**Testes:**
- ✅ Criar usuário com dados válidos
- ✅ Validar email único
- ✅ Normalizar role para uppercase
- ✅ Atualizar dados do usuário
- ✅ Deletar usuário existente
- ✅ Listar todos os usuários
- ✅ Filtrar usuários por role
- ✅ Filtrar usuários por localId

---

### 6. **user-local-relationship.integration.test.ts**
**Responsabilidade:** Relacionamento entre usuários e locais

**Testes:**
- ✅ Validar localId ao criar usuário
- ✅ Rejeitar localId inválido
- ✅ Listar usuários de um local específico

---

### 7. **user-permissions.integration.test.ts**
**Responsabilidade:** Controle de permissões

**Testes:**
- ✅ Permitir que ADMIN atualize qualquer usuário
- ✅ Permitir que usuário atualize apenas a si mesmo
- ✅ Negar atualização se não for ADMIN nem próprio usuário
- ✅ Apenas ADMIN pode criar usuários ADMIN

---

### 8. **local-management.integration.test.ts**
**Responsabilidade:** Gerenciamento de locais

**Testes:**
- ✅ Criar local com dados válidos
- ✅ Deletar local existente
- ✅ Listar todos os locais

---

## 🎯 Benefícios da Refatoração

### 1. **Modularidade**
Cada arquivo tem uma responsabilidade única e clara.

### 2. **Reutilização**
Factories eliminam duplicação de código de setup.

### 3. **Manutenibilidade**
Testes menores são mais fáceis de entender e modificar.

### 4. **Escalabilidade**
Adicionar novos testes é simples usando os helpers existentes.

### 5. **Legibilidade**
Testes focados facilitam identificar o que está sendo testado.

---

## 📊 Estatísticas

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Arquivos de teste | 3 | 9 | +6 arquivos focados |
| Linhas por arquivo | 200-340 | 50-150 | -60% em média |
| Duplicação de código | Alta | Baixa | Factories reutilizáveis |
| Total de testes | 167 | 201 | +34 testes |
| Tempo de execução | ~3s | ~4.4s | +1.4s (mais testes) |

---

## 🚀 Como Usar

### Executar todos os testes
```bash
npm test
```

### Executar apenas testes de integração
```bash
npm test -- tests/integration
```

### Executar teste específico
```bash
npm test -- ticket-workflow
```

### Exemplo de Uso dos Helpers

```typescript
import { 
  createMockUserRepository, 
  createUserFixture 
} from '../helpers/mock-factories';

const mockUserRepo = createMockUserRepository();
const user = createUserFixture({ role: 'ADMIN' });

mockUserRepo.findById.mockResolvedValue(user);
```

---

## 📌 Princípios Aplicados

1. **Single Responsibility Principle** - Um arquivo = uma responsabilidade
2. **DRY (Don't Repeat Yourself)** - Factories para setup comum
3. **Arrange-Act-Assert** - Estrutura clara em todos os testes
4. **Isolation** - Cada teste é independente
5. **Descriptive Names** - Nomes claros descrevem o que está sendo testado

---

## 🔄 Migração dos Arquivos Antigos

Os seguintes arquivos foram substituídos:

| Arquivo Antigo | Novos Arquivos |
|---------------|----------------|
| `ticket-lifecycle.integration.test.ts` (289 linhas) | `ticket-create`, `ticket-workflow`, `ticket-constraints` |
| `user-local-management.integration.test.ts` (340 linhas) | `user-crud`, `user-local-relationship`, `user-permissions`, `local-management` |
| `authentication.integration.test.ts` (204 linhas) | `auth-flow` (focado e limpo) |

---

## ✨ Próximos Passos

Para adicionar novos testes de integração:

1. Use os helpers existentes em `mock-factories.ts`
2. Crie arquivos focados em uma funcionalidade específica
3. Mantenha testes pequenos e descritivos
4. Reutilize fixtures para consistência

**Exemplo:**
```typescript
import { createMockUserRepository, createUserFixture } from '../helpers/mock-factories';

describe('Nova Feature Integration', () => {
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
  });

  it('deve fazer algo específico', async () => {
    const user = createUserFixture({ role: 'ADMIN' });
    mockUserRepository.findById.mockResolvedValue(user);
    
    // teste aqui
  });
});
```
