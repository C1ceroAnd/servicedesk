# 📁 Estrutura de Testes - Organização

## 🗂️ Nova Estrutura de Pastas

```
tests/
├── unit/                           # Testes Unitários
│   ├── usecases/                   # Testes de casos de uso (lógica de negócio)
│   │   ├── auth/                   # Autenticação
│   │   │   ├── LoginUser.test.ts
│   │   │   ├── RegisterUser.test.ts
│   │   │   └── RefreshToken.test.ts
│   │   ├── tickets/                # Gestão de tickets
│   │   │   ├── CreateTicket.test.ts
│   │   │   ├── AcceptTicket.test.ts
│   │   │   ├── FinalizeTicket.test.ts
│   │   │   ├── CancelTicket.test.ts
│   │   │   └── RejectTicket.test.ts
│   │   ├── users/                  # Gestão de usuários
│   │   │   ├── CreateUser.test.ts
│   │   │   ├── UpdateUser.test.ts
│   │   │   └── DeleteUser.test.ts
│   │   └── locals/                 # Gestão de locais
│   │       ├── CreateLocal.test.ts
│   │       └── DeleteLocal.test.ts
│   └── frontend/                   # Testes de componentes e serviços frontend
│       ├── services/               # Serviços (API, auth, storage)
│       │   ├── api.test.ts
│       │   ├── authService.test.ts
│       │   └── tokenStorage.test.ts
│       └── components/             # Componentes React
│           ├── privateRoute.logic.test.ts
│           └── roleGuard.logic.test.ts
│
└── integration/                    # Testes de Integração
    ├── backend/                    # Integração backend (módulos comunicando)
    │   ├── auth-flow.integration.test.ts
    │   ├── ticket-create.integration.test.ts
    │   ├── ticket-workflow.integration.test.ts
    │   ├── ticket-constraints.integration.test.ts
    │   ├── user-crud.integration.test.ts
    │   ├── user-local-relationship.integration.test.ts
    │   ├── user-permissions.integration.test.ts
    │   ├── local-management.integration.test.ts
    │   ├── authentication.integration.test.ts (arquivo antigo)
    │   ├── ticket-lifecycle.integration.test.ts (arquivo antigo)
    │   └── user-local-management.integration.test.ts (arquivo antigo)
    ├── frontend/                   # Integração frontend (fluxos completos)
    │   ├── authentication.integration.test.ts
    │   └── route-guards.integration.test.ts
    ├── helpers/                    # Helpers e factories reutilizáveis
    │   └── mock-factories.ts
    └── README.md                   # Documentação dos testes de integração
```

---

## 📊 Distribuição de Testes

| Categoria | Suites | Testes | Descrição |
|-----------|--------|--------|-----------|
| **Unit - Usecases** | 13 | 64 | Lógica de negócio isolada |
| **Unit - Frontend** | 5 | 47 | Serviços e componentes React |
| **Integration - Backend** | 11 | 70 | Fluxos entre módulos backend |
| **Integration - Frontend** | 2 | 20 | Fluxos completos frontend |
| **Total** | **31** | **201** | Cobertura completa |

---

## 🎯 Convenções de Organização

### Testes Unitários (`tests/unit/`)
- **Escopo:** Testam uma unidade isolada (função, classe, componente)
- **Mocks:** Dependências externas são mockadas
- **Velocidade:** Muito rápidos (<1s para todos)
- **Foco:** Lógica de negócio, regras de validação

### Testes de Integração (`tests/integration/`)
- **Escopo:** Testam comunicação entre módulos
- **Mocks:** Apenas interfaces externas (DB, APIs)
- **Velocidade:** Rápidos (~4s para todos)
- **Foco:** Fluxos completos, interação entre camadas

---

## 🚀 Comandos Úteis

### Executar todos os testes
```bash
npm test
```

### Executar apenas testes unitários
```bash
npm test -- tests/unit
```

### Executar apenas testes de integração
```bash
npm test -- tests/integration
```

### Executar testes de um domínio específico
```bash
npm test -- tests/unit/usecases/auth
npm test -- tests/unit/usecases/tickets
npm test -- tests/unit/usecases/users
npm test -- tests/unit/frontend
```

### Executar um arquivo específico
```bash
npm test -- LoginUser
npm test -- CreateTicket
```

### Modo watch (desenvolvimento)
```bash
npm test -- --watch
```

### Ver cobertura de código
```bash
npm test -- --coverage
```

---

## 📝 Padrões de Nomenclatura

### Arquivos de Teste
- **Unitário:** `NomeDaClasse.test.ts`
- **Integração:** `nome-do-fluxo.integration.test.ts`

### Estrutura de Teste (AAA Pattern)
```typescript
describe('Nome do Módulo', () => {
  it('deve fazer algo específico', () => {
    // Arrange (Preparar)
    const input = { ... };
    
    // Act (Executar)
    const result = funcao(input);
    
    // Assert (Verificar)
    expect(result).toBe(esperado);
  });
});
```

---

## 🔍 O Que Testar em Cada Categoria

### Testes Unitários - Usecases
✅ Validações de entrada  
✅ Regras de negócio  
✅ Fluxos de erro  
✅ Transformações de dados  
✅ Lógica condicional  

**Exemplo:**
```typescript
// CreateUser.test.ts
it('deve validar email único', async () => {
  mockRepository.findByEmail.mockResolvedValue(existingUser);
  
  await expect(createUser.execute(input))
    .rejects.toThrow('Email já cadastrado');
});
```

### Testes Unitários - Frontend
✅ Lógica de serviços  
✅ Interceptores HTTP  
✅ Manipulação de localStorage  
✅ Lógica de componentes (sem render)  
✅ Utilitários e helpers  

**Exemplo:**
```typescript
// authService.test.ts
it('deve fazer login e armazenar token', async () => {
  const response = await authService.login(credentials);
  
  expect(localStorage.getItem('token')).toBe(response.token);
});
```

### Testes de Integração - Backend
✅ Fluxos completos entre camadas  
✅ Comunicação entre módulos  
✅ Validações cross-module  
✅ Ciclos de vida de entidades  
✅ Regras de negócio complexas  

**Exemplo:**
```typescript
// ticket-workflow.integration.test.ts
it('deve processar ticket do início ao fim', async () => {
  // Criar → Aceitar → Finalizar
  const ticket = await createTicket();
  const accepted = await acceptTicket(ticket.id);
  const completed = await finalizeTicket(accepted.id);
  
  expect(completed.status).toBe('COMPLETED');
});
```

### Testes de Integração - Frontend
✅ Fluxo de autenticação completo  
✅ Navegação entre rotas  
✅ Proteção de rotas privadas  
✅ Refresh de token automático  
✅ Persistência de sessão  

**Exemplo:**
```typescript
// authentication.integration.test.ts
it('deve fazer login e acessar área privada', async () => {
  await login(credentials);
  expect(localStorage.getItem('token')).toBeDefined();
  expect(canAccessPrivateRoute()).toBe(true);
});
```

---

## 🛠️ Helpers e Factories

Localizados em `tests/integration/helpers/mock-factories.ts`

### Criar Mocks
```typescript
const mockUserRepo = createMockUserRepository();
const mockTicketRepo = createMockTicketRepository();
```

### Criar Fixtures
```typescript
const user = createUserFixture({ role: 'ADMIN' });
const ticket = createTicketFixture({ status: 'PENDING' });
const local = createLocalFixture({ name: 'Lab A' });
```

---

## ⚡ Performance

| Categoria | Tempo Médio | Meta |
|-----------|-------------|------|
| Testes Unitários | < 2s | < 1s |
| Testes de Integração | < 3s | < 2s |
| **Total (201 testes)** | **~5s** | **< 5s** |

---

## 📈 Cobertura de Código

Executar análise de cobertura:
```bash
npm test -- --coverage
```

Metas de cobertura:
- **Usecases:** > 95%
- **Repositories:** > 90%
- **Controllers:** > 85%
- **Frontend Services:** > 90%

---

## 🔄 Migração Realizada

### Antes
```
tests/
├── usecases/
├── frontend/
└── integration/
```

### Depois
```
tests/
├── unit/
│   ├── usecases/
│   └── frontend/
└── integration/
    ├── backend/
    ├── frontend/
    └── helpers/
```

**Alterações:**
- ✅ Testes unitários agrupados em `unit/`
- ✅ Estrutura por domínio mantida
- ✅ Imports ajustados automaticamente
- ✅ Todos os 201 testes passando

---

## 📚 Documentação Adicional

- [Testes de Integração - Refatoração](./integration/README.md)
- [Refatoração dos Testes](../docs/REFACTORING_INTEGRATION_TESTS.md)

---

## ✅ Checklist de Qualidade

- [x] Estrutura organizada por tipo e domínio
- [x] Convenção de nomenclatura consistente
- [x] Padrão AAA em todos os testes
- [x] Helpers reutilizáveis criados
- [x] Documentação atualizada
- [x] Todos os testes passando (201/201)
- [x] Performance dentro da meta (<5s)
