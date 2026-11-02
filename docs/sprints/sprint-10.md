# Sprint 10 · Extra E2 — Suíte de integração da API *(extra)*

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/10-extra-suite-de-integracao-da-api.json`](../spec/10-extra-suite-de-integracao-da-api.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-backend`

**Entregável:** npm test cobre os dois projetos, e o 409 de corrida tem caso automatizado.

**Risco:** medio · **Pré-requisito:** s8 · **Stack permitida:** `vitest`, `prisma`, `typescript`

## Escopo

O segundo seam do projeto: Route Handler chamado com Request montado à mão, contra banco de teste.

- **e2f1** — Banco de teste e limpeza entre casos: Banco separado, reset de schema antes da suíte e limpeza na ordem das dependências.
- **e2f2** — Sete casos no nível do handler: Fora de ordem, duplicada, corrida, permissão, escopo de leitura, sem regra aplicável e snapshot.

## Fora do escopo

- Nível 2b: subir o app e fazer fetch contra localhost

## Regras do agente

- Toda escrita por Route Handler. Server Action para mutação é reprovação automática (ADR 0003).
- lerSessao recebe Request; cookies() de next/headers é proibido em código que o teste chama.
- Toda resposta de erro usa o envelope { error: { code, message, fields? } } e o código do enum.
- A rota não contém regra: lê sessão, valida, chama o domínio, traduz o resultado.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

## Features

### e2f1 · Banco de teste e limpeza entre casos

**Categoria:** `build`

Banco separado, reset de schema antes da suíte e limpeza na ordem das dependências.

> Como desenvolvedora, quero rodar testes sem apagar meu seed, para não escolher entre testar e demonstrar.

**Steps:**

1. Apontar o projeto api para .env.test
2. Rodar migrate reset --force --skip-seed antes da suíte
3. Limpar em beforeEach na ordem inversa da criação
4. Escrever as fábricas em tests/fabricas.ts

**Acceptance criteria:**

- [ ] A suíte de API usa prisma/test.db, nunca o banco de desenvolvimento
- [ ] Rodar a suíte não altera o banco de desenvolvimento
- [ ] Cada caso monta só os dados de que precisa, por fábrica
- [ ] A limpeza apaga na ordem decisões, etapas, itens, pedidos, faixas, obras, usuários, fornecedores
- [ ] A suíte roda em série: fileParallelism é false
- [ ] Nenhum caso usa prisma.$transaction com rollback para isolar

**Edge cases:**

- .env.test ausente: a suíte de API falha cedo com mensagem nomeando o arquivo
- test.db corrompido: migrate reset recria

**Arquivos:** `tests/fabricas.ts`, `tests/setup.ts`, `.env.test` · **Depende de:** `s2f7`

**Fora de escopo:** Nível 2b: subir o app e fazer fetch contra localhost

### e2f2 · Sete casos no nível do handler

**Categoria:** `build`

Fora de ordem, duplicada, corrida, permissão, escopo de leitura, sem regra aplicável e snapshot.

> Como desenvolvedora, quero o 409 de corrida provado por teste, para que a decisão mais sutil do projeto não dependa de inspeção.

**Steps:**

1. Importar o handler da rota e chamá-lo com Request montado
2. Montar o header cookie da sessão desejada
3. Escrever os sete casos
4. Rodar os dois projetos

**Acceptance criteria:**

- [ ] Caso 1: decisão fora de ordem responde 409 NAO_E_SUA_VEZ
- [ ] Caso 2: segunda decisão na mesma etapa responde 409
- [ ] Caso 3: duas decisões com Promise.all produzem exatamente um 200 e um 409, e uma linha decidida no banco
- [ ] Caso 4: PUT de faixa como aprovador responde 403 SEM_PERMISSAO
- [ ] Caso 5: GET de pedidos não devolve rascunho de outro usuário
- [ ] Caso 6: submissão acima do teto responde 422 SEM_REGRA_APLICAVEL e o pedido continua rascunho
- [ ] Caso 7: editar a faixa após a submissão não altera a cadeia devolvida pelo detalhe
- [ ] npm test executa os projetos dominio e api, ambos verdes

**Edge cases:**

- Handler que dependa de cookies() de next/headers: o caso falha, e isso é o teste da regra do ADR 0003

**Arquivos:** `tests/api/` · **Depende de:** `e2f1`, `s6f3`

## Critérios de aceite da sprint

1. [`e2f1`] A suíte de API usa prisma/test.db, nunca o banco de desenvolvimento
2. [`e2f1`] Rodar a suíte não altera o banco de desenvolvimento
3. [`e2f1`] Cada caso monta só os dados de que precisa, por fábrica
4. [`e2f1`] A limpeza apaga na ordem decisões, etapas, itens, pedidos, faixas, obras, usuários, fornecedores
5. [`e2f1`] A suíte roda em série: fileParallelism é false
6. [`e2f1`] Nenhum caso usa prisma.$transaction com rollback para isolar
7. [`e2f2`] Caso 1: decisão fora de ordem responde 409 NAO_E_SUA_VEZ
8. [`e2f2`] Caso 2: segunda decisão na mesma etapa responde 409
9. [`e2f2`] Caso 3: duas decisões com Promise.all produzem exatamente um 200 e um 409, e uma linha decidida no banco
10. [`e2f2`] Caso 4: PUT de faixa como aprovador responde 403 SEM_PERMISSAO
11. [`e2f2`] Caso 5: GET de pedidos não devolve rascunho de outro usuário
12. [`e2f2`] Caso 6: submissão acima do teto responde 422 SEM_REGRA_APLICAVEL e o pedido continua rascunho
13. [`e2f2`] Caso 7: editar a faixa após a submissão não altera a cadeia devolvida pelo detalhe
14. [`e2f2`] npm test executa os projetos dominio e api, ambos verdes

## Definition of done

- [ ] npm test cobre os dois projetos
- [ ] O 409 de corrida tem caso automatizado
- [ ] A suíte de API não toca no banco de desenvolvimento

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.