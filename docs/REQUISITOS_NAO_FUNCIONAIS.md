# Requisitos Não Funcionais

Qualidades, performance, segurança e confiabilidade do sistema.

---

## 1. Performance

### [RNF001] Tempo de Resposta
- Endpoints de listagem: < 500ms
- Login: < 200ms
- Aceitar/Finalizar chamado: < 300ms

### [RNF002] Concorrência
- Suportar múltiplos usuários simultâneos
- Sem locks explícitos (SQLite dev não suporta bem, PostgreSQL prod sim)

---

## 2. Segurança

### [RNF003] Autenticação e Autorização
- JWT com secret key segura
- Access token: 15 minutos
- Refresh token: 7 dias
- Validação de role em todo endpoint protegido

### [RNF004] Proteção de Dados
- Senhas: hash bcryptjs
- Sem logs de senhas ou tokens
- Dados sensíveis não retornados desnecessariamente

### [RNF005] Validação de Entrada
- Validação com ZOD
- Limites de tamanho
- Sanitização básica

---

## 3. Confiabilidade

### [RNF006] Integridade de Dados
- Constraints no banco (UNIQUE, FOREIGN KEY)
- Operações atômicas para casos críticos

### [RNF007] Disponibilidade
- Health check endpoint (`/health`)
- Graceful shutdown

---

## 4. Manutenibilidade

### [RNF008] Código e Arquitetura
- Clean Architecture (Controllers → UseCases → Ports → Infra)
- TypeScript com tipos estritos
- Testes unitários e de integração (> 90% cobertura)

### [RNF009] Logging
- Logs estruturados
- Níveis: DEBUG, INFO, WARN, ERROR
- Sem informações sensíveis

---

## 5. Compatibilidade

### [RNF010] Stack Técnico
- Node.js 18+
- SQLite 3 (dev) / PostgreSQL 12+ (prod)
- Navegadores modernos

---

## 6. Documentação

### [RNF011] APIs Documentadas
- Swagger/OpenAPI auto-gerada (`/docs`)
- Exemplos de uso para cada endpoint
- Setup < 5 minutos

---

## 7. Documentos Relacionados

- [Requisitos Funcionais](REQUISITOS_FUNCIONAIS.md) — O que o sistema faz
- [Regras de Negócio](REQUISITOS_E_REGRAS.md) — Validações e restrições
- [Contexto do Projeto](CONTEXTO_DO_PROJETO.md) — Visão geral
- [Arquitetura](ARQUITETURA_E_ESTRUTURA.md) — Implementação
