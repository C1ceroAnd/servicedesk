# CONTRATO_API.md

## Objetivo do Documento
Descrever todos os endpoints da API, estrutura de requests/responses e códigos HTTP.

---

## 1. Authentication (`/auth`)

### 1.1 Register
**Rota:** `POST /auth/register`  
**Acesso:** Público  
**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "USER | TECNICO | ADMIN",
  "localId": 1
}
```
**Regras:**
- Se `role = USER`, `localId` é obrigatório.
- Se `role ≠ USER`, `localId` deve ser `null`.
**Response (201):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "USER"
}
```

### 1.2 Login
**Rota:** `POST /auth/login`  
**Acesso:** Público  
**Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```
**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "role": "TECNICO"
  }
}
```

### 1.3 Refresh Token
**Rota:** `POST /auth/refresh`  
**Acesso:** Público  
**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```
**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```
**Response (401):** Token inválido ou expirado

---

## 2. Users (`/users`) - ADMIN only

### 2.1 Create User
**Rota:** `POST /users`  
**Acesso:** ADMIN  
**Headers:** `Authorization: Bearer <token>`  
**Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "role": "USER",
  "localId": 1
}
```
**Nota:** Se role = TECNICO, localId deve ser null. Senha é gerada automaticamente.  
**Response (201):**
```json
{
  "id": 2,
  "name": "Maria Santos",
  "email": "maria@example.com",
  "role": "USER",
  "localId": 1,
  "password": "X7k9Qm2LpB4J"
}
```
**Nota:** O ADMIN copia a senha retornada e comunica ao usuário. Usuário usa para fazer login.

### 2.2 List Users
**Rota:** `GET /users`  
**Acesso:** ADMIN  
**Response (200):** Array de Users

### 2.3 Update User
**Rota:** `PATCH /users/:id`  
**Acesso:** ADMIN  
**Response (200):** User atualizado

### 2.4 Delete User
**Rota:** `DELETE /users/:id`  
**Acesso:** ADMIN  
**Validações:**
- Usuário não pode ter tickets com status `PENDING` ou `IN_PROGRESS` (como solicitante ou técnico)
- Se tentar deletar usuário com tickets abertos, retorna 400

**Response (204):** No content  
**Response (400):** Usuário possui chamados abertos (PENDING/IN_PROGRESS)

### 2.5 Reset Password
**Rota:** `PATCH /users/:id/reset-password`  
**Acesso:** ADMIN  
**Response (200):** Retorna usuário com nova senha aleatória gerada
```json
{
  "id": 2,
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "K9m4Lp7Qx2B8J"
}
```
**Nota:** ADMIN copia a senha e comunica ao usuário para fazer novo login.

---

## 3. Locals (`/locals`) - ADMIN only

### 3.1 Create Local
**Rota:** `POST /locals`  
**Acesso:** ADMIN  
**Body:**
```json
{
  "name": "UBS Parque Central"
}
```
**Response (201):**
```json
{
  "id": 1,
  "name": "UBS Parque Central",
  "createdAt": "2026-01-19T10:00:00Z"
}
```

### 3.2 Update Local (ADMIN)
**Rota:** `PATCH /locals/:id`  
**Acesso:** ADMIN  
**Body:**
```json
{
  "name": "UBS Centro"
}
```
**Response (200):** Local atualizado
**Response (400):** Validação falhou

### 3.3 List Locals
**Rota:** `GET /locals`  
**Acesso:** Todos autenticados  
**Response (200):** Array de Locals

### 3.4 Delete Local
**Rota:** `DELETE /locals/:id`  
**Acesso:** ADMIN  
**Validações:**
- Local não pode ter tickets com status `PENDING` ou `IN_PROGRESS` vinculados
- Se tentar deletar local com tickets abertos, retorna 400

**Response (204):** No content  
**Response (400):** Local possui chamados abertos (PENDING/IN_PROGRESS)

---

## 4. Tickets (`/tickets`)

### 4.1 Create Ticket (Autenticado)
**Rota:** `POST /tickets`  
**Acesso:** Autenticado  
**Body:**
```json
{
  "title": "Internet caiu",
  "description": "Internet da recepção está fora",
}
```
**Response (201):** Ticket criado

### 4.2 List Tickets
**Rota:** `GET /tickets`  
**Query Params:**
- `?status=PENDING` ou `IN_PROGRESS` ou `COMPLETED`
- `?localId=1`
- `?search=termo`

**Behavior:** 
- USER vê apenas seus chamados
- TECNICO vê todos os chamados
- ADMIN vê todos os chamados

**Response (200):** Array de Tickets

### 4.3 Search Tickets (TECNICO/ADMIN)
**Rota:** `GET /tickets/search`  
**Acesso:** TECNICO e ADMIN  
**Query Params:**
- `?search=termo`
- `?status=PENDING | IN_PROGRESS | COMPLETED`
- `?localId=1`
**Response (200):** Array de Tickets

### 4.4 Accept Ticket (TECNICO)
**Rota:** `PATCH /tickets/:id/accept`  
**Acesso:** TECNICO  
**Descrição:** Técnico assume chamado PENDENTE  
**Validações:**
- Chamado deve estar com status PENDING
- Chamado não pode já ter tecnicoId preenchido

**Response (200):**
```json
{
  "id": 1,
  "status": "IN_PROGRESS",
  "tecnicoId": 3,
  "updatedAt": "2026-01-19T15:30:00Z"
}
```

### 4.5 Finalize Ticket (TECNICO)
**Rota:** `PATCH /tickets/:id/finalize`  
**Acesso:** TECNICO  
**Descrição:** Finalizar chamado em atendimento  
**Validações:**
- Chamado deve estar com status IN_PROGRESS
- Apenas o TECNICO vinculado (tecnicoId) pode finalizar

**Body:**
```json
{}
```
**Response (200):**
```json
{
  "id": 1,
  "status": "COMPLETED",
  "dataFechamento": "2026-01-19T16:00:00Z"
}
```

### 4.6 Cancel Ticket
**Rota:** `PATCH /tickets/:id/cancel`  
**Acesso:** Autenticado (autor do chamado)  
**Descrição:** Cancela um chamado não concluído do próprio usuário  
**Response (200):** Ticket atualizado

### 4.7 Reject Ticket (TECNICO)
**Rota:** `PATCH /tickets/:id/reject`  
**Acesso:** TECNICO  
**Descrição:** Rejeita um chamado  
**Response (200):** Ticket atualizado

### 4.8 Delete Completed (Autenticado)
**Rota:** `DELETE /tickets/user/:userId/completed`  
**Acesso:** Autenticado (ADMIN/USER)  
**Descrição:** Remove chamados concluídos de um usuário  
**Response (204):** No content

---

## 5. Error Responses

**400 Bad Request:**
```json
{ "error": "Campo obrigatório faltando: title" }
```

**401 Unauthorized:**
```json
{ "error": "Token inválido" }
```

**403 Forbidden:**
```json
{ "error": "Acesso negado para a role atual" }
```

**404 Not Found:**
```json
{ "error": "Ticket não encontrado" }
```

**409 Conflict:**
```json
{ "error": "Não é possível deletar local com chamados pendentes" }
```

---

## 6. Documentos Relacionados

- [Contexto do Projeto](CONTEXTO_DO_PROJETO.md) — Visão geral
- [Arquitetura e Estrutura](ARQUITETURA_E_ESTRUTURA.md) — Camadas e fluxo
- [Swagger UI](SWAGGER.md) — Teste interativo dos endpoints
- [Modelagem de Dados](MODELAGEM_DADOS.md) — Esquema do banco
- [Requisitos e Regras](REQUISITOS_E_REGRAS.md) — Regras de negócio aplicadas
- [Guia de Desenvolvimento](GUIA_DESENVOLVIMENTO.md) — Como levantar ambiente
