# Checklist por trilha

Visão de **cobertura**, complementar ao [plano incremental](docs/plano-incremental.md), que é
visão de **ordem**. Aqui a pergunta é "o que ainda não existe", não "o que faço agora".

`[x]` pronto · `[ ]` pendente · `[—]` fora do recorte, documentado como decisão

---

## Mockups

Canvas com 12 artboards: https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo

- [x] 1 · Cadastro de pedido (`Main`)
- [x] 2A · Aprovação, base (`Aprovacoes`)
- [x] 2B · Aprovação ao vivo (`AprovacoesB`) — vira o extra E1
- [x] 2C · Overview do pedido (`AprovacoesC`)
- [x] 2C · Pedido completo (`PedidoDetalhe`)
- [x] 3 · Regras da alçada (`Alcadas`)
- [x] 4 · Estados e validações (`Estados`)
- [x] 5 · Tempo real, as duas pontas (`TempoReal`)
- [x] 6 · Trocar de usuário, modo demo (`TrocarConta`)
- [x] 7 · Login (`Login`)
- [—] 8 · Perfis, permissões e multi-tenant (`Perfis`) — matriz de papéis **entra**; tenant fica como desenho ([ADR 0006](docs/adr/0006-sem-empresa-no-modelo.md))
- [—] 9 · Empresa, cadastros (`Empresa`) — fora do recorte, o enunciado dispensa

A trilha de mockup está fechada. Nenhum artboard novo é necessário para a entrega.

---

## Back-end

### Fundação
- [x] Schema Prisma com oito modelos, dinheiro em centavos e quantidade em milésimos
- [x] Migration inicial aplicada
- [x] Cliente Prisma com driver adapter e singleton
- [x] Seed mínimo

### Domínio (`src/domain/`, sem import de framework)
- [ ] `dinheiro.ts` — conversão, formatação, total do item
- [ ] `alcada.ts` — `resolverFaixa`
- [ ] `alcada.ts` — `montarCadeia`
- [ ] `decisao.ts` — aprovador da vez e validação de decisão
- [ ] `schemas.ts` — Zod, rascunho permissivo e submetido estrito
- [ ] `erros.ts` — enum fechado de códigos
- [ ] Suíte do domínio, 12 a 18 casos
- [ ] Vitest configurado em dois projetos

### Sessão e autorização
- [ ] `lerSessao(req: Request)` — **sem `cookies()` de `next/headers`**
- [ ] Criar e destruir sessão em cookie httpOnly
- [ ] Gate `DEMO_MODE` na entrada
- [ ] `permissao.ts` — quatro papéis
- [ ] `http.ts` — envelope de erro e wrapper de rota

### Rotas
- [ ] `GET /api/obras`, `/api/fornecedores`, `/api/usuarios`
- [ ] `GET` `POST` `/api/obras/:id/faixas`
- [ ] `PUT` `DELETE` `/api/faixas/:id`
- [ ] `POST` `PUT` `DELETE` `/api/pedidos` e `/api/pedidos/:id`
- [ ] `POST /api/pedidos/:id/submissao`
- [ ] `POST /api/pedidos/:id/decisoes` — UPDATE condicional, 409
- [ ] `GET /api/pedidos` com filtros e ações por sessão
- [ ] `GET /api/pedidos/:id` com cadeia e histórico

### Consistência
- [ ] Submissão transacional: valida, resolve faixa e grava cadeia num bloco só
- [ ] Decisão como escrita condicional ao estado que a autoriza
- [ ] `scripts/verificar.sh` provando 409 e 403
- [ ] Suíte de integração da API — extra E2

---

## Front-end

### Fundação
- [x] Next 16, App Router, TypeScript
- [x] Tailwind v4 com os tokens do ObraFlow
- [x] Inter e Lora carregadas
- [ ] `dialog` e `select` do shadcn, tematizados
- [ ] `lucide-react` para ícones

### Telas
- [ ] Entrada — lista de usuários, sem senha
- [ ] Cabeçalho — usuário, papel, trocar de usuário, construtora fixa
- [ ] **Tela 3** · Alçadas — seleção de obra, listagem, criar, editar, remover, reordenar
- [ ] **Tela 1** · Cadastro — dados gerais, itens N, totalização, submissão
- [ ] **Tela 2** · Aprovação — lista, filtros, detalhe, decisões
- [ ] Componente de cadeia de aprovação
- [ ] Diálogo de rejeição com motivo obrigatório

### Estados (10% da nota)
- [ ] Loading em **toda** lista
- [ ] Empty state: sem obra, sem pedido, obra sem faixa
- [ ] Erro de API com opção de tentar de novo
- [ ] Validação por campo, ancorada via `error.fields`
- [ ] Decisão indisponível sempre com explicação
- [ ] Responsivo de 390px, itens viram cartões abaixo de 768px
- [—] Modo escuro — tokens existem, artboards são claros

---

## Documentação

### No repositório
- [x] `GLOSSARY.md` — 18 termos
- [x] ADR 0001 — cadeia como snapshot
- [x] ADR 0002 — faixa por limite superior
- [x] ADR 0003 — Route Handlers, sem Server Actions
- [x] ADR 0004 — decisão por UPDATE condicional
- [x] ADR 0005 — sessão de demonstração sem senha
- [x] ADR 0006 — sem empresa no modelo
- [x] ADR 0007 — domínio em português
- [x] `docs/plano-incremental.md`
- [x] `docs/plano-testes-etapa2.md`
- [x] `docs/jira/tasks.csv` e `tasks.md`
- [ ] `docs/contrato-api.md` — escrever abrindo o Inc 3, derivado dos tipos do domínio

### README — o enunciado cobra item a item
- [ ] Como instalar, configurar e iniciar
- [ ] Como popular os dados de demonstração
- [ ] Screenshots das telas
- [ ] Tecnologias escolhidas **e os motivos**
- [ ] Como a alçada é modelada, calculada e persistida
- [ ] Como o front se comunica com o back
- [ ] Como consistência e integridade são garantidas
- [ ] O que mudaria em produção — apoiado no canvas
- [ ] Tabela de o que cada usuário vê ao entrar
- [ ] Comportamento para valor sem regra aplicável

### Site Hugo — aprofundamento, não pré-requisito
- [ ] `guia/tecnologias.md` — hoje TODO
- [ ] `guia/alcada.md` — hoje TODO
- [ ] `guia/comunicacao.md` — hoje TODO
- [ ] `guia/consistencia.md` — hoje TODO
- [ ] `guia/producao.md` — hoje TODO

### Entrega
- [ ] Pull Request aberto contra `ObraFlow/obraflow-case`
- [ ] E-mail e telefone na descrição do PR
