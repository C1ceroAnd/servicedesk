# CONTEXTO_DO_PROJETO.md

## 1. Visão Geral do Projeto
**Nome do Sistema:** ServiceDesk - Sistema Simplificado de Gestão de Chamados
**Tipo de Aplicação:** API REST para Gerenciamento de Tickets de Suporte Técnico
**Escopo:** Aplicável a qualquer organização que necessite centralizar solicitações de suporte

---

## 2. O Problema
Organizações precisam gerenciar chamados de suporte de forma centralizada e rastreável:

* **Desafios Comuns:**
    * Solicitações chegam por múltiplos canais (email, telefone, WhatsApp), sem registro formal.
    * Falta de visibilidade sobre o status das solicitações abertas.
    * Sem controle sobre quais solicitações foram abertos por cada usuário.

---

## 3. A Solução Proposta
Uma API RESTful centralizada para abertura, gestão e rastreamento de chamados de suporte:

### Funcionalidades Principais
1. **Gestão de Usuários:**
   * Cadastro e autenticação via JWT (Access + Refresh Token)
   * 3 roles: ADMIN, TECNICO, USER (controle de permissões)

2. **Gestão de Locais:**
   * Cadastro dinâmico de locais onde os problemas ocorrem
   * Apenas ADMIN pode criar/editar/deletar locais

3. **Gestão de Chamados:**
   * USERs abrem chamados vinculados ao seu local específico
   * Busca por texto (título, descrição, nome do local)
   * Fluxo: PENDING → IN_PROGRESS → COMPLETED

---

## 4. Perfis de Usuário (Roles)

### A. USER (Comum)
* **Função:** Abrir e acompanhar chamados de suporte
* **Vinculação:** Cada USER está associado a UM único local (cadastrado pelo ADMIN)
* **Permissões:**
  * Criar chamados para seu local
  * Visualizar apenas seus próprios chamados
  * Ver status das suas solicitações
* **Acesso Restrito:** Não consegue ver chamados de outros USERs

### B. TECNICO (Atendente)
* **Função:** Aceitar e resolver chamados técnicos
* **Permissões:**
  * Visualizar todos os chamados do sistema
  * Aceitar chamados PENDENTE (PENDING → IN_PROGRESS)
  * Finalizar chamados CONCLUIDO (IN_PROGRESS → COMPLETED) com solução técnica obrigatória
  * Buscar chamados por texto
* **Acesso:** Apenas aos chamados (não gerencia usuários/locais)

### C. ADMIN (Administrador)
* **Função:** Gerenciar o sistema (não atende chamados diretamente)
* **Permissões:**
  * Criar/editar/deletar locais
  * Criar/editar/deletar usuários (USER e TECNICO)
  * Visualizar todos os chamados (dashboard/histórico)
  * Buscar e filtrar dados
* **Acesso Total:** Gerenciamento completo do sistema

---

## 5. Endpoints da API (~14 total)
* **Auth (3):** Register, Login, Refresh
* **Usuários (5):** Create, List, Update, Delete, Reset Password (ADMIN)
* **Locais (3):** Create, List, Delete (ADMIN)
* **Chamados (8):** Create, List, Search, Accept, Finalize, Cancel, Reject, Delete Completed


## 6. Fluxo de Vida do Chamado

1. USER cria chamado (status inicial: PENDENTE / `PENDING`)
2. TECNICO aceita chamado (status: EM_ANDAMENTO / `IN_PROGRESS`)
3. TECNICO finaliza chamado (status: CONCLUIDO / `COMPLETED`)
4. Chamados concluídos são somente leitura (não editáveis)

---

## 7. Segurança e Privacidade

- **Hash de Senhas:** `bcryptjs` com salt rounds 10
- **Tokens:** Access (15 min) e Refresh (7 dias) com rotação
- **Autorização:** Middleware valida token e role (RBAC)
- **Proteção de Dados:** Senha nunca é retornada pela API

---

## 8. Premissas e Restrições

- Cada USER pertence a um único `Local`
- TECNICO não possui `localId` vinculado
- `Local` não pode ser removido com chamados PENDING/IN_PROGRESS
- Emails são únicos e validados na criação/edição

## 9. Documentos Relacionados

- [Arquitetura e Estrutura](ARQUITETURA_E_ESTRUTURA.md) — Camadas, fluxo e DI Container
- [Contrato da API](CONTRATO_API.md) — Endpoints, requests e responses
- [Swagger UI](SWAGGER.md) — Documentação interativa em /docs
- [Modelagem de Dados](MODELAGEM_DADOS.md) — Prisma schema, enums e relações
- [Requisitos e Regras](REQUISITOS_E_REGRAS.md) — Funcionalidades e regras de negócio
- [Guia de Desenvolvimento](GUIA_DESENVOLVIMENTO.md) — Setup, execução e debugging
- [Guia de Testes](GUIA_TESTES.md) — Estrutura, execução e cobertura
