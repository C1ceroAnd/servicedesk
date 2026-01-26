# Documentação Swagger da API

## O que é?

O ServiceDesk possui **documentação interativa** da API REST usando **Swagger UI** (OpenAPI 3.0). Isso permite que você explore, teste e entenda todos os endpoints sem precisar usar ferramentas externas.

## Como Acessar

1. **Iniciar o servidor:**
```bash
npm run dev:api
```

2. **Abrir no navegador:**
```
http://localhost:3333/docs
```

## Funcionalidades do Swagger UI

### Exploração de Endpoints

Todos os **14 endpoints** estão documentados:

- **Auth** (3 endpoints): Register, Login, Refresh Token
- **Users** (5 endpoints): Create, List, Update, Delete, Reset Password
- **Tickets** (8 endpoints): Create, List, Search, Accept, Finalize, Cancel, Reject, Delete
- **Locals** (3 endpoints): Create, List, Delete

### Teste Interativo

**Passo a passo para testar:**

1. **Login** (obter token):
   - Expandir `POST /auth/login`
   - Clicar em "Try it out"
   - Preencher:
     ```json
     {
       "email": "admin@test.com",
       "password": "admin123"
     }
     ```
   - Clicar "Execute"
   - Copiar o `accessToken` da resposta

2. **Autenticar** (usar token):
  - Clicar no botão Authorize (topo da página)
   - Colar o token no campo "Value"
   - Formato: `Bearer eyJhbGc...` (já inclui "Bearer " automaticamente)
   - Clicar "Authorize"

3. **Testar endpoints protegidos**:
  - Agora todos os endpoints protegidos estão autorizados
   - Exemplo: `GET /tickets` ou `POST /tickets`

### Schemas e Validações

Cada endpoint mostra:
- **Request Body**: Campos obrigatórios e opcionais
- **Query Parameters**: Filtros disponíveis
- **Responses**: Códigos HTTP e estrutura de dados
- **Security**: Se requer autenticação JWT

### Exemplos de Requisições

#### 1. Criar Chamado (POST /tickets)

**Request:**
```json
{
  "title": "Impressora não funciona",
  "description": "Impressora do 2º andar sem papel",
  "localId": 1
}
```

**Response 201:**
```json
{
  "id": 1,
  "title": "Impressora não funciona",
  "description": "Impressora do 2º andar sem papel",
  "status": "PENDING",
  "userId": 3,
  "localId": 1
}
```

#### 2. Listar Chamados (GET /tickets)

**Query Params:**
- `status=PENDING` - Filtrar por status
- `localId=1` - Filtrar por local
- `search=impressora` - Buscar por texto

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Impressora não funciona",
    "status": "PENDING",
    "userId": 3,
    "localId": 1
  }
]
```

#### 3. Aceitar Chamado (PATCH /tickets/:id/accept)

**Requer:** Role TECNICO

**Response 200:**
```json
{
  "id": 1,
  "status": "IN_PROGRESS",
  "tecnicoId": 2
}
```

---

## Estrutura da Documentação

### Tags Organizadas

| Tag | Endpoints | Descrição |
|-----|-----------|-----------|
| **auth** | 3 | Autenticação e tokens |
| **users** | 5 | Gestão de usuários (ADMIN) |
| **tickets** | 8 | Gestão de chamados |
| **locals** | 3 | Gestão de locais |

### Permissões por Endpoint

| Endpoint | Autenticação | Roles Permitidas |
|----------|--------------|------------------|
| POST /auth/register | Público | Todos |
| POST /auth/login | Público | Todos |
| POST /auth/refresh | Público | Todos |
| POST /users | JWT | ADMIN |
| GET /users | JWT | ADMIN |
| PATCH /users/:id | JWT | ADMIN |
| DELETE /users/:id | JWT | ADMIN |
| POST /tickets | JWT | USER, TECNICO, ADMIN |
| GET /tickets | JWT | USER, TECNICO, ADMIN |
| GET /tickets/search | JWT | TECNICO, ADMIN |
| PATCH /tickets/:id/accept | JWT | TECNICO |
| PATCH /tickets/:id/finalize | JWT | TECNICO |
| POST /locals | JWT | ADMIN |
| GET /locals | JWT | Todos autenticados |
| DELETE /locals/:id | JWT | ADMIN |

---

## Schemas OpenAPI

### User
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "role": "ADMIN | TECNICO | USER",
  "localId": "number | null"
}
```

### Ticket
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "status": "PENDING | IN_PROGRESS | COMPLETED | CANCELLED",
  "userId": "number",
  "tecnicoId": "number | null",
  "localId": "number",
  "dataAceito": "string | null",
  "dataFechamento": "string | null"
}
```

### Local
```json
{
  "id": "number",
  "name": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

---

## Exportar Especificação OpenAPI

### JSON Format
```bash
curl http://localhost:3333/docs/json > openapi.json
```

### YAML Format
```bash
curl http://localhost:3333/docs/yaml > openapi.yaml
```

Esses arquivos podem ser importados em:
- Postman
- Insomnia
- Bruno
- OpenAPI Generator

---

## Integração com Ferramentas

### Postman

1. Abrir Postman
2. Import → Link
3. Colar: `http://localhost:3333/docs/json`
4. Importa todos os endpoints automaticamente

### Insomnia

1. Abrir Insomnia
2. Import/Export → Import Data → From URL
3. Colar: `http://localhost:3333/docs/json`

---

## Troubleshooting

### Swagger UI não carrega?
```bash
# Verificar se servidor está rodando
curl http://localhost:3333/health

# Restart servidor
npm run dev:api
```

### Erro 401 Unauthorized?
- Certifique-se de fazer login primeiro (`POST /auth/login`)
- Clicar no botão **Authorize** 
- Colar o `accessToken` retornado no login
- Token expira em 15 minutos (use refresh token)

### Erro 403 Forbidden?
- Verifique se seu usuário tem a role correta
- Exemplo: `/users` requer role ADMIN
- Use usuários de teste do seed:
  - ADMIN: `admin@test.com` / `admin123`
  - TECNICO: `tecnico@test.com` / `tecnico123`
  - USER: `user1@test.com` / `user123`

---

## Comparação com Documentação Manual

| Aspecto | Swagger UI | CONTRATO_API.md |
|---------|-----------|-----------------|
| **Interatividade** | Testa direto no navegador | Apenas leitura |
| **Atualização** | Automática (via código) | Manual |
| **Validação** | Valida schemas | Não valida |
| **Autenticação** | Integrada | Precisa copiar tokens |
| **Export** | JSON/YAML | Não exporta |

**Recomendação:** Use Swagger para testes, CONTRATO_API.md para referência offline.

---

## Configuração Técnica

A configuração do Swagger está em [server.ts](../src/server.ts):

```typescript
app.register(swagger, {
  openapi: {
    info: {
      title: 'ServiceDesk API',
      description: 'Sistema de Gestão de Chamados',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:3333', description: 'Dev' },
      { url: 'https://api.servicedesk.com', description: 'Prod' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
});

app.register(swaggerUi, {
  routePrefix: '/docs'
});
```

Schemas são definidos diretamente nas rotas ([routes/](../src/routes/)).

---

## Links Úteis

- **Swagger Docs Local**: http://localhost:3333/docs
- **OpenAPI Spec (JSON)**: http://localhost:3333/docs/json
- **OpenAPI Spec (YAML)**: http://localhost:3333/docs/yaml
- **Health Check**: http://localhost:3333/health

---

## Próximos Passos

Swagger implementado e funcionando  
Todos os 14 endpoints documentados  
Autenticação JWT integrada  
Testes interativos disponíveis  

**Pronto para uso!** 🎉

---

## 🔗 Documentos Relacionados

- [Contrato da API](CONTRATO_API.md) — Referência textual dos endpoints
- [Guia de Desenvolvimento](GUIA_DESENVOLVIMENTO.md) — Como iniciar o servidor
- [Arquitetura e Estrutura](ARQUITETURA_E_ESTRUTURA.md) — Camadas e fluxo
- [Contexto do Projeto](CONTEXTO_DO_PROJETO.md) — Objetivos e escopo
