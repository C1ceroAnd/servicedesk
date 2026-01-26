# Requisitos Funcionais

Sistema de gestão de chamados com fluxo de atendimento por técnicos.

---

## 1. Autenticação

### [RF001] Registro
- Criar novo usuário com `name`, `email`, `password`
- Role padrão: `USER`
- Email único e validado
- Senha hashada com bcryptjs
- Retorna usuário criado (sem expor senha)

### [RF002] Login
- Autenticar com `email` e `password`
- Retorna `accessToken` (JWT, 15 min) e `refreshToken` (JWT, 7 dias)
- Credenciais inválidas retornam erro 401

### [RF003] Renovação de Token
- Usar `refreshToken` para obter novo `accessToken`
- Token inválido ou expirado retorna erro 401
- Válido enquanto `refreshToken` não estiver expirado

### [RF004] Proteção de Endpoints
- Toda rota, exceto `/auth/register` e `/auth/login`, requer token válido
- Verificação de role em rotas administrativas
- Role insuficiente retorna 403

---

## 2. Gestão de Usuários (ADMIN only)

### [RF005] Criar Usuário
- ADMIN cria `USER` (com obrigatório `localId`) ou `TECNICO` (sem `localId`)
- **Senha é gerada automaticamente** (12 caracteres aleatórios) — jamais solicitada na criação
- Retorna usuário criado com a senha aleatória para o ADMIN comunicar ao usuário
- Usuário usa essa senha para logar no sistema (pode usar a mesma senha sempre)
- ADMIN pode solicitar reset de senha se usuário esquecer

### [RF006] Listar Usuários
- ADMIN visualiza todos os usuários
- Sem paginação (retorna todos)
- Sem filtros

### [RF007] Atualizar Usuário
- ADMIN edita `name`, `email`, `role`, `localId` de usuário existente
- Email continua único
- Preserva todas as relações (chamados, atribuições de técnico)
- Permite edição sem perda de dados históricos
- Retorna usuário atualizado

### [RF008] Deletar Usuário
- ADMIN remove usuário do sistema
- **Validação crítica**: Se usuário possui tickets `PENDING` ou `IN_PROGRESS` (como solicitante ou técnico), retorna erro 400
- Apenas usuários sem tickets abertos podem ser deletados
- Retorna 204 No Content

### [RF008b] Restrição de Deletar com Tickets Abertos
- Previne deletação de usuário/técnico vinculado a chamado ativo
- Evita inconsistências no banco de dados
- Mensagem clara: "Usuário possui chamados abertos e não pode ser removido"

### [RF009] Reset de Senha (ADMIN)
- ADMIN reseta senha de qualquer usuário
- Gera automaticamente nova senha aleatória (12 caracteres)
- Retorna a nova senha para o ADMIN comunicar ao usuário
- Usuário pode fazer login com essa nova senha

---

## 3. Gestão de Locais (ADMIN only)

### [RF010] Criar Local
- ADMIN cadastra novo local com `name` (obrigatório)
- Retorna local criado

### [RF010b] Atualizar Local
- ADMIN edita `name` de local existente
- Preserva todos os chamados vinculados
- Permite edição sem perda de dados históricos
- Retorna local atualizado

### [RF011] Listar Locais
- Todos os usuários autenticados veem lista de locais
- Sem paginação (retorna todos)

### [RF012] Deletar Local
- ADMIN remove local
- **Validação crítica**: Se existem tickets `PENDING` ou `IN_PROGRESS` vinculados, retorna erro 400
- Apenas locais sem tickets abertos podem ser deletados
- Retorna 204 No Content

---

## 4. Abertura e Listagem de Chamados

### [RF013] Criar Chamado
- USER cria novo chamado com `title` e `description`
- Sistema vincula automaticamente `userId` (solicitante) e `localId` (local do USER)
- Status inicial: `PENDING`
- Retorna chamado criado (sem campos redundantes)

### [RF014] Listar Chamados
- **USER**: Vê apenas seus próprios chamados (onde `userId = seu_id`)
- **TECNICO**: Vê todos os chamados do sistema
- **ADMIN**: Vê todos os chamados
- Filtros opcionais: `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `localId`, `search`

### [RF015] Buscar Chamados (TECNICO e ADMIN)
- Busca por `search` (procura em `title` e `description`, case-insensitive)
- Combinável com filtros de status e localId
- Endpoint: `GET /tickets/search?search=termo&status=PENDING&localId=1`

---

## 5. Ciclo de Vida do Chamado

### [RF016] Aceitar Chamado (TECNICO only)
- TECNICO aceita chamado com status `PENDING`
- Transição: `PENDING` → `IN_PROGRESS`
- Define `tecnicoId` e registra `dataAceito`
- Se chamado já está em outro estado, retorna erro
- Retorna erro se outro TECNICO já aceitou

### [RF017] Finalizar Chamado (TECNICO only)
- TECNICO finaliza chamado `IN_PROGRESS` que ele próprio aceitou
- Transição: `IN_PROGRESS` → `COMPLETED`
- Registra `dataFechamento`
- Apenas o TECNICO vinculado pode finalizar
- Retorna erro se não está `IN_PROGRESS` ou está vinculado a outro TECNICO

### [RF018] Cancelar Chamado (USER)
- USER cancela seu próprio chamado (não-finalizado)
- Transição: `PENDING` ou `IN_PROGRESS` → `CANCELLED`
- Apenas o solicitante pode cancelar seu próprio chamado
- Retorna erro se já está `COMPLETED` ou `CANCELLED`

### [RF019] Rejeitar Chamado (TECNICO only)
- TECNICO rejeita chamado `PENDING` que aceitou
- Status volta para `PENDING` (fica disponível para outro TECNICO)
- Limpa `tecnicoId` e `dataAceito`

### [RF020] Deletar Chamados Finalizados
- USER: Marca seus chamados `COMPLETED`/`CANCELLED` como ocultos (`hiddenFromRequester = true`)
- TECNICO: Marca seus chamados assumidos `COMPLETED`/`CANCELLED` como ocultos (`hiddenFromTecnico = true`)
- ADMIN: Deleta permanentemente seus chamados finalizados
- Endpoint: `DELETE /tickets/user/{userId}/completed`

---

## 6. Roles e Permissões

### USER (Usuário Comum)
- Abre chamados para seu local
- Vê apenas seus chamados
- Pode cancelar seus próprios chamados
- Sem acesso a CRUD de usuários/locais

### TECNICO (Atendente)
- Aceita chamados `PENDING` → `IN_PROGRESS`
- Finaliza chamados `IN_PROGRESS` (que ele aceitou) → `COMPLETED`
- Rejeita chamados `PENDING` (volta para fila)
- Vê todos os chamados
- Busca chamados por texto
- Sem permissões administrativas

### ADMIN (Administrador)
- CRUD completo de usuários
- CRUD completo de locais
- Vê todos os chamados
- Reset de senha de usuários
- Acesso total

---

## 7. Documentos Relacionados

- [Requisitos Não Funcionais](REQUISITOS_NAO_FUNCIONAIS.md) — Performance, segurança, confiabilidade
- [Regras de Negócio](REQUISITOS_E_REGRAS.md) — Validações e integridade
- [Contrato da API](CONTRATO_API.md) — Endpoints exatos
- [Arquitetura](ARQUITETURA_E_ESTRUTURA.md) — Implementação
