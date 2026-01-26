# Guia de Desenvolvimento

Tudo que você precisa saber para rodar, desenvolver e debugar o ServiceDesk localmente.

---

## Pré-requisitos
Após rodar `npm run seed`, há apenas um usuário de teste fixo (ADMIN). Os demais usuários devem ser criados via API/Swagger ou pela interface conforme necessidade.

| Email | Senha | Role | Local |
|-------|-------|------|-------|
| admin@servicedesk.local | admin123 | ADMIN |


- **Node.js** 18+
|       |       |      |       |
```bash
node --version   # deve ser v18+
npm --version    # deve ser 9+
```

---

## Setup Rápido

```bash
# Clonar e instalar
git clone https://github.com/seu-usuario/servicedesk.git
cd servicedesk
npm install

# Variáveis de ambiente
cp .env.example .env

# Banco de dados
npx prisma migrate dev
npm run seed
```

Variáveis principais no .env:
- JWT: `JWT_SECRET`, `JWT_EXPIRES_IN` (900), `JWT_REFRESH_EXPIRES_IN` (604800)
- API: `PORT` (3333), `NODE_ENV` (development), `DATABASE_URL` (SQLite dev)
- Frontend: `VITE_API_URL` (http://localhost:3333)

---

## Rodar o Projeto

### Opção 1: Rodar Tudo (Recomendado)
```bash
npm run dev
```
Inicia ambos backend e frontend em paralelo (npm-run-all).

### Opção 2: Rodar Separadamente (Para debugging)

**Terminal 1 - Backend:**
```bash
npm run dev:api
```
API disponível em: http://localhost:3333

**Terminal 2 - Frontend:**
```bash
npm run dev:web
```
Frontend disponível em: http://localhost:5173

### Verificar se tudo está rodando
- Backend: http://localhost:3333/health
- Frontend: http://localhost:5173
- **Swagger Docs**: http://localhost:3333/docs

---

## Testes

Comandos principais:
```bash
npm test               # Executa testes
npm run test:watch     # Modo watch
npm run test:coverage  # Cobertura
```

Escopo: testes unitários e de integração.

---

## Debugging

### VS Code - Debug Backend

1. Adicione breakpoint no código TypeScript
2. Execute:
```bash
npm run dev:api -- --inspect-brk
```

3. Abra `chrome://inspect` no Chrome
4. Clique em "inspect"

### VS Code - Debug Frontend

1. Instale extensão "Debugger for Chrome"
2. Crie `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

3. F5 para iniciar debugging

### Logs

```typescript
// Backend
console.log('Debug info:', data);  // Vê no terminal

// Frontend  
console.log('Debug info:', data);  // Vê no console do navegador
```

---

## Database

### Visualizar Dados (Prisma Studio)
```bash
npx prisma studio
```
Abre UI em http://localhost:5555 para ver/editar dados.

### Criar Nova Migration
```bash
# Altere schema.prisma

# Crie migration
npx prisma migrate dev --name descricao_da_mudanca
```

### Reset Database
```bash
# ATENÇÃO: Deleta tudo!
npx prisma migrate reset

# Executa migrations e seed novamente
```

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Tudo junto
npm run dev:api         # Só backend
npm run dev:web         # Só frontend

# Build
npm run build           # Build tudo
npm run build:api       # Build backend
npm run build:web       # Build frontend

# Testes
npm test               # Rodar testes
npm run test:watch    # Watch mode
npm run test:coverage # Com cobertura
npm run test:verbose  # Detalhado

# Banco de dados
npx prisma studio    # UI para dados
npx prisma migrate dev --name descricao

# Produção
npm start             # Rodar servidor built
npm run preview       # Preview frontend build
```

---

## 📚 Documentos Relacionados

- [Contexto do Projeto](CONTEXTO_DO_PROJETO.md)
- [Arquitetura e Estrutura](ARQUITETURA_E_ESTRUTURA.md)
- [Contrato da API](CONTRATO_API.md)
- [Swagger UI](SWAGGER.md) — Acesso em /docs
- [Modelagem de Dados](MODELAGEM_DADOS.md)
- [Requisitos e Regras](REQUISITOS_E_REGRAS.md)
- [Guia de Testes](GUIA_TESTES.md)
