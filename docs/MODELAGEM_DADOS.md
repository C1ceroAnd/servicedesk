# MODELAGEM_DADOS.md

## Objetivo do Documento
Descrever a estrutura do Banco de Dados usando Prisma ORM.

---

## 1. Banco de Dados
* **Desenvolvimento:** SQLite (arquivo local \dev.db\)
* **Produção:** PostgreSQL
* **ORM:** Prisma

---

## 2. Tipos e Valores (Domínio)

No banco, os campos abaixo são `String` (não enums Prisma). Os valores são validados pela aplicação.

- Role: `ADMIN` | `TECNICO` | `USER`
- TicketStatus: `PENDING` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED`

---

## 3. Models (Tabelas)

### User (Usuários)
\\\prisma
model User {
  id               Int       @id @default(autoincrement())
  name             String
  email            String    @unique
  password         String    // hash bcryptjs
  role             String    @default("USER")

  localId          Int?
  local            Local?    @relation(fields: [localId], references: [id])

  ticketsCreated   Ticket[]  @relation("UserCreated")
  ticketsAtendidos Ticket[]  @relation("TecnicoAtendimento")

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@map("users")
}
\\\

### Local (Unidades/Locais)
\\\prisma
model Local {
  id        Int       @id @default(autoincrement())
  name      String
  active    Boolean   @default(true)
  
  users     User[]
  tickets   Ticket[]
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map(\"locals\")
}
\\\

### Ticket (Chamados)
\\\prisma
model Ticket {
  id                 Int           @id @default(autoincrement())
  title              String
  description        String
  status             String        @default("PENDING")

  userId             Int
  user               User          @relation("UserCreated", fields: [userId], references: [id], onDelete: Cascade)

  localId            Int
  local              Local         @relation(fields: [localId], references: [id], onDelete: Restrict)

  tecnicoId          Int?
  tecnico            User?         @relation("TecnicoAtendimento", fields: [tecnicoId], references: [id])

  hiddenFromRequester Boolean      @default(false)
  hiddenFromTecnico   Boolean      @default(false)

  createdAt          DateTime      @default(now())
  dataAceito         DateTime?
  dataFechamento     DateTime?

  @@map("tickets")
}
\\\

---

## 4. Schema Atual (\prisma/schema.prisma\)

\\\prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id               Int       @id @default(autoincrement())
  name             String
  email            String    @unique
  password         String
  role             String    @default("USER")

  localId          Int?
  local            Local?    @relation(fields: [localId], references: [id])

  ticketsCreated   Ticket[]  @relation("UserCreated")
  ticketsAtendidos Ticket[]  @relation("TecnicoAtendimento")

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@map("users")
}

model Local {
  id        Int       @id @default(autoincrement())
  name      String

  users     User[]
  tickets   Ticket[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("locals")
}

model Ticket {
  id              Int           @id @default(autoincrement())
  title           String
  description     String
  status          String        @default("PENDING")

  userId          Int
  user            User          @relation("UserCreated", fields: [userId], references: [id], onDelete: Cascade)

  localId         Int
  local           Local         @relation(fields: [localId], references: [id], onDelete: Restrict)

  tecnicoId       Int?
  tecnico         User?         @relation("TecnicoAtendimento", fields: [tecnicoId], references: [id])

  hiddenFromRequester Boolean @default(false)
  hiddenFromTecnico   Boolean @default(false)

  createdAt       DateTime      @default(now())
  dataAceito      DateTime?
  dataFechamento  DateTime?

  @@map("tickets")
}
\\\

---

## 5. Regras e Restrições

- `User.localId`: obrigatório para `USER`; opcional para `TECNICO`/`ADMIN`.
- `Ticket.status`: valores possíveis `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- Aceitar ticket: define `tecnicoId` e `dataAceito`, muda `status` para `IN_PROGRESS`.
- Finalizar ticket: muda `status` para `COMPLETED` e define `dataFechamento`.
- Cancelar ticket: muda `status` para `CANCELLED` e só pode ser feito pelo solicitante.
- Ocultação: `hiddenFromRequester` e `hiddenFromTecnico` usados para limpar histórico sem apagar dados.
- Email único e senha armazenada como hash (bcryptjs).
- Deleção de `User`: não permitida se possui tickets `PENDING` ou `IN_PROGRESS` (como solicitante ou técnico).
- Deleção de `Local`: não permitida se possui tickets `PENDING` ou `IN_PROGRESS` vinculados.

---

## 6. Documentos Relacionados

- [Contexto do Projeto](CONTEXTO_DO_PROJETO.md) — Visão geral
- [Arquitetura e Estrutura](ARQUITETURA_E_ESTRUTURA.md) — Camadas e fluxo
- [Contrato da API](CONTRATO_API.md) — Endpoints que usam estes modelos
- [Requisitos e Regras](REQUISITOS_E_REGRAS.md) — Restrições de domínio
- [Guia de Testes](GUIA_TESTES.md) — Cobertura dos modelos e regras
