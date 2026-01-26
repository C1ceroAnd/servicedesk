# Casos de Uso

## UC01 – Criar Usuário
**Ator:** ADMIN  
**Objetivo:** Registrar usuários ou técnicos com senha gerada automaticamente.  
**Resumo do fluxo:** ADMIN informa nome, email, role e localId (se USER) → sistema valida unicidade de email → gera senha aleatória → persiste usuário → retorna dados e senha para comunicação ao usuário.  
**RF Relacionados:** [RF005](./REQUISITOS_FUNCIONAIS.md#rf005-criar-usuário), [RF009](./REQUISITOS_FUNCIONAIS.md#rf009-reset-de-senha-admin)  
**RNF Relacionados:** [RNF003](./REQUISITOS_NAO_FUNCIONAIS.md#rnf003-autenticação-e-autorização)

## UC02 – Autenticar Usuário
**Ator:** ADMIN, TECNICO, USER  
**Objetivo:** Garantir acesso seguro conforme permissões.  
**Resumo do fluxo:** Usuário informa email e senha → sistema valida credenciais → emite accessToken e refreshToken → direciona à área disponível para sua role.  
**RF Relacionados:** [RF002](./REQUISITOS_FUNCIONAIS.md#rf002-login), [RF004](./REQUISITOS_FUNCIONAIS.md#rf004-proteção-de-endpoints)  
**RNF Relacionados:** [RNF003](./REQUISITOS_NAO_FUNCIONAIS.md#rnf003-autenticação-e-autorização)

## UC03 – Criar Chamado
**Ator:** USER  
**Objetivo:** Registrar um chamado vinculado ao seu local.  
**Resumo do fluxo:** Usuário abre formulário → informa título e descrição → sistema associa userId e localId automaticamente → grava chamado com status PENDING → retorna chamado criado.  
**RF Relacionados:** [RF013](./REQUISITOS_FUNCIONAIS.md#rf013-criar-chamado)

## UC04 – Listar e Filtrar Chamados
**Ator:** USER, TECNICO, ADMIN  
**Objetivo:** Visualizar chamados com filtros.  
**Resumo do fluxo:** Usuário acessa lista → sistema filtra por papel (USER vê seus chamados; TECNICO/ADMIN veem todos) → aplica filtros opcionais de status, local e busca → retorna lista com solicitante, local e técnico.  
**RF Relacionados:** [RF014](./REQUISITOS_FUNCIONAIS.md#rf014-listar-chamados), [RF015](./REQUISITOS_FUNCIONAIS.md#rf015-buscar-chamados-tecnico-e-admin)

## UC05 – Aceitar Chamado
**Ator:** TECNICO  
**Objetivo:** Assumir atendimento de chamado pendente.  
**Resumo do fluxo:** Técnico abre chamado PENDING → clica em aceitar → sistema valida ausência de técnico e status PENDING → define tecnicoId, dataAceito e status IN_PROGRESS → retorna chamado atualizado.  
**RF Relacionados:** [RF016](./REQUISITOS_FUNCIONAIS.md#rf016-aceitar-chamado-tecnico-only)

## UC06 – Finalizar Chamado
**Ator:** TECNICO  
**Objetivo:** Encerrar chamado em atendimento.  
**Resumo do fluxo:** Técnico abre chamado IN_PROGRESS que ele assumiu → solicita finalização → sistema valida vínculo e status → define status COMPLETED e dataFechamento → retorna chamado atualizado.  
**RF Relacionados:** [RF017](./REQUISITOS_FUNCIONAIS.md#rf017-finalizar-chamado-tecnico-only)

## UC07 – Cancelar Chamado
**Ator:** USER (solicitante)  
**Objetivo:** Cancelar chamado pendente ou em atendimento.  
**Resumo do fluxo:** Solicitante abre chamado PENDING ou IN_PROGRESS → solicita cancelamento → sistema valida autoria → define status CANCELLED → retorna atualizado.  
**RF Relacionados:** [RF018](./REQUISITOS_FUNCIONAIS.md#rf018-cancelar-chamado-user)

## UC08 – Gerenciar Locais
**Ator:** ADMIN  
**Objetivo:** Criar, listar, atualizar nome e excluir locais sem chamados abertos.  
**Resumo do fluxo:** ADMIN cria local com nome → lista → atualiza nome se necessário → ao deletar, sistema bloqueia se houver tickets PENDING/IN_PROGRESS vinculados; se não, remove.  
**RF Relacionados:** [RF010](./REQUISITOS_FUNCIONAIS.md#rf010-criar-local), [RF010b](./REQUISITOS_FUNCIONAIS.md#rf010b-atualizar-local), [RF012](./REQUISITOS_FUNCIONAIS.md#rf012-deletar-local)

## UC09 – Deletar Usuário com Salvaguarda
**Ator:** ADMIN  
**Objetivo:** Remover usuário sem quebrar integridade de chamados.  
**Resumo do fluxo:** ADMIN solicita exclusão → sistema verifica tickets PENDING ou IN_PROGRESS onde o usuário é solicitante ou técnico → se existirem, retorna erro 400 → se não, remove usuário.  
**RF Relacionados:** [RF008](./REQUISITOS_FUNCIONAIS.md#rf008-deletar-usuário), [RF008b](./REQUISITOS_FUNCIONAIS.md#rf008b-restrição-de-deletar-com-tickets-abertos)

## UC10 – Resetar Senha
**Ator:** ADMIN  
**Objetivo:** Gerar nova senha para um usuário que perdeu o acesso.  
**Resumo do fluxo:** ADMIN aciona reset → sistema gera nova senha aleatória → retorna senha para ADMIN comunicar → usuário acessa com a nova senha.  
**RF Relacionados:** [RF009](./REQUISITOS_FUNCIONAIS.md#rf009-reset-de-senha-admin)
