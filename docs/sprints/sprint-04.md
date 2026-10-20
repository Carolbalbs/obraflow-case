# Sprint 4 · Tela 3 — Regras da alçada

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/04-tela-3-regras-da-alcada.json`](../spec/04-tela-3-regras-da-alcada.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-fullstack`

**Entregável:** Marina cria, edita, reordena e remove faixas; Amanda tentando a mesma URL vê a explicação de acesso negado.

**Risco:** medio · **Pré-requisito:** s3 · **Stack permitida:** `next`, `react`, `typescript`, `tailwind`, `prisma`, `zod`

## Escopo

Primeira tela de verdade, porque sem faixa não há pedido submetível. CRUD de faixas por obra, exclusivo do admin.

- **s4f1** — Listar e criar faixas da obra: GET devolve as faixas ordenadas pelo limite; POST cria faixa nova.
- **s4f2** — Substituir e remover faixa: PUT substitui limite e lista ordenada de uma vez, eliminando rota de reordenação. DELETE remove, e o snapshot dos pedidos sobrevive.
- **s4f3** — Tela de regras da alçada: Seleção de obra, tabela de faixas com aprovadores na ordem, criar, editar, reordenar e remover.

## Fora do escopo

- CRUD de obra (fora de escopo no PRD)
- Controle de versão otimista na faixa
- Gráfico de faixas (extra E3)

## Mockups desta sprint

Fidelidade total ao desenho. Canvas: <https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo> — leia `project/<Artboard>.dc.html` antes de escrever tela.

- **`Alcadas`** — 3 · Regras da alçada

As divergências deliberadas estão na SPEC, em Mockups. A lista é fechada.

## Regras do agente

- A sprint só fecha com a tela usando a rota de verdade, nunca com dado simulado.
- Toda lista nasce com carregando, vazio e erro com repetição — não é passada posterior.
- Validação da tela usa o mesmo schema Zod do servidor, ancorada por error.fields.
- Regra de negócio fica no domínio; componente não decide alçada.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

**Modelos tocados:** Faixa, FaixaAprovador, Obra, Pedido, Usuario

## Features

### s4f1 · Listar e criar faixas da obra

**Categoria:** `api_endpoint`

GET devolve as faixas ordenadas pelo limite; POST cria faixa nova.

> Como admin, quero definir as faixas de valor e seus aprovadores por obra, para que obras de portes diferentes tenham controles diferentes.

**Steps:**

1. Escrever GET /api/obras/[id]/faixas devolvendo as faixas ordenadas com aprovadores
2. Escrever POST criando faixa com limite e lista ordenada de aprovadores
3. Recusar a segunda faixa aberta da obra
4. Recusar limite duplicado na mesma obra

**Acceptance criteria:**

- [ ] GET devolve as faixas ordenadas por limiteCentavos crescente, com a faixa aberta por último
- [ ] GET inclui os aprovadores de cada faixa na ordem gravada
- [ ] POST com limiteCentavos nulo numa obra que já tem faixa aberta responde 422 com código VALIDACAO
- [ ] POST com limite igual ao de outra faixa da mesma obra responde 422
- [ ] POST com zero aprovadores responde 422 com campos.aprovadores
- [ ] POST com mais de 10 aprovadores responde 422
- [ ] POST com aprovador repetido responde 422
- [ ] POST por usuário não-admin responde 403 SEM_PERMISSAO
- [ ] POST com usuarioId inexistente responde 422

**Edge cases:**

- Obra inexistente: 404 NAO_ENCONTRADO
- Limite negativo: 422
- Mais de 20 faixas na obra: 422
- Corpo com total de aprovadores válido mas ordem duplicada: a ordem é reindexada pelo servidor a partir da posição no array, então ordem enviada é ignorada

**`GET /api/obras/{id}/faixas`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | [{ id, limiteCentavos, semTeto, aprovadores: [{ usuarioId, nome, ordem }] }] |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO — obra inexistente |

**`POST /api/obras/{id}/faixas`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB

*Body:* `limiteCentavos`: int > 0 ou null para faixa aberta · `aprovadores`: array de usuarioId, 1 a 10, sem repetição; a ordem é a posição no array

| status | resposta |
|---|---|
| 201 | { id, limiteCentavos, semTeto, aprovadores } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO — segunda faixa aberta, limite duplicado, zero ou mais de 10 aprovadores, aprovador repetido ou inexistente |

*Efeitos:* cria Faixa e FaixaAprovador numa transação

**Modelos:** Faixa, FaixaAprovador, Obra, Usuario · **Arquivos:** `app/api/obras/[id]/faixas/route.ts` · **Depende de:** `s3f4`

**Fora de escopo:** CRUD de obra (fora de escopo no PRD)

### s4f2 · Substituir e remover faixa

**Categoria:** `api_endpoint`

PUT substitui limite e lista ordenada de uma vez, eliminando rota de reordenação. DELETE remove, e o snapshot dos pedidos sobrevive.

> Como admin, quero inverter a ordem de dois aprovadores e salvar, para que a nova ordem persista após recarregar.

**Steps:**

1. Escrever PUT /api/faixas/[id] substituindo a faixa inteira numa transação
2. Escrever DELETE /api/faixas/[id]
3. Contar pedidos em andamento sob a faixa e devolver na resposta do GET e antes do DELETE

**Acceptance criteria:**

- [ ] PUT substitui limite e aprovadores numa única transação: não existe estado intermediário com a faixa sem aprovador
- [ ] Inverter a ordem de dois aprovadores e recarregar devolve a nova ordem
- [ ] DELETE de faixa usada por pedido submetido responde 200, e o pedido mantém faixaLimiteCentavos e faixaSemTeto
- [ ] Depois do DELETE, o pedido afetado tem faixaId nulo e a cadeia gravada intacta
- [ ] PUT e DELETE por não-admin respondem 403 SEM_PERMISSAO
- [ ] PUT que deixaria a obra com duas faixas abertas responde 422
- [ ] GET da faixa inclui pedidosEmAndamento com a contagem de pedidos pendentes sob ela

**Edge cases:**

- Faixa inexistente: 404
- PUT com array de aprovadores vazio: 422
- DELETE de faixa sem pedido nenhum: 200, sem aviso
- Dois PUT concorrentes na mesma faixa: o último escreve; não há controle de versão, e a decisão está registrada como aceita neste recorte

**`PUT /api/faixas/{id}`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB · idempotente

*Body:* `limiteCentavos`: int > 0 ou null · `aprovadores`: array de usuarioId, 1 a 10, ordem = posição

| status | resposta |
|---|---|
| 200 | { id, limiteCentavos, semTeto, aprovadores } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO |

*Efeitos:* apaga e recria FaixaAprovador da faixa numa transação

**`DELETE /api/faixas/{id}`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | { removida: true, pedidosAfetados: int } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |

*Efeitos:* apaga Faixa e seus FaixaAprovador em cascata · Pedido.faixaId vira nulo; o snapshot denormalizado permanece

**Modelos:** Faixa, FaixaAprovador, Pedido · **Arquivos:** `app/api/faixas/[id]/route.ts` · **Depende de:** `s4f1`

**Fora de escopo:** Controle de versão otimista na faixa

### s4f3 · Tela de regras da alçada

**Categoria:** `frontend`

Seleção de obra, tabela de faixas com aprovadores na ordem, criar, editar, reordenar e remover.

> Como admin, quero configurar a alçada pela interface, para não depender de ninguém mexendo no banco.

**Steps:**

1. Seletor de obra
2. Tabela com faixa, aprovadores na ordem e ações
3. Formulário de criar e editar com aprovadores adicionáveis, removíveis e reordenáveis
4. Diálogo de confirmação de exclusão com a contagem de pedidos em andamento

**Acceptance criteria:**

- [ ] A tabela mostra as faixas da obra selecionada, ordenadas, com os aprovadores na ordem gravada
- [ ] A faixa aberta é exibida como 'acima de R$ X', derivada do limite da faixa anterior
- [ ] Criar faixa e recarregar mantém a faixa
- [ ] Reordenar aprovadores e salvar persiste a nova ordem
- [ ] O diálogo de exclusão informa quantos pedidos em andamento usam a faixa e declara que eles seguem com a cadeia gravada na submissão
- [ ] Excluir sem confirmar no diálogo não chama a API
- [ ] A tabela tem estado de carregando, vazio e erro com repetição
- [ ] Erro de validação do servidor aparece ancorado no campo, via error.fields

**Edge cases:**

- Obra sem nenhuma faixa: empty state explicando que nenhum pedido dessa obra poderá ser submetido
- Nenhuma obra no banco: empty state apontando o seed
- Usuário não-admin acessando a URL direto: tela explica o acesso negado e diz a quem recorrer, em vez de tela branca
- API fora do ar: erro com botão de tentar de novo

**Modelos:** Faixa, FaixaAprovador, Obra · **Arquivos:** `app/alcadas/page.tsx`, `src/ui/componentes/`, `src/ui/hooks/` · **Depende de:** `s4f1`, `s4f2`

**Fora de escopo:** Gráfico de faixas (extra E3)

## Critérios de aceite da sprint

1. [`s4f1`] GET devolve as faixas ordenadas por limiteCentavos crescente, com a faixa aberta por último
2. [`s4f1`] GET inclui os aprovadores de cada faixa na ordem gravada
3. [`s4f1`] POST com limiteCentavos nulo numa obra que já tem faixa aberta responde 422 com código VALIDACAO
4. [`s4f1`] POST com limite igual ao de outra faixa da mesma obra responde 422
5. [`s4f1`] POST com zero aprovadores responde 422 com campos.aprovadores
6. [`s4f1`] POST com mais de 10 aprovadores responde 422
7. [`s4f1`] POST com aprovador repetido responde 422
8. [`s4f1`] POST por usuário não-admin responde 403 SEM_PERMISSAO
9. [`s4f1`] POST com usuarioId inexistente responde 422
10. [`s4f2`] PUT substitui limite e aprovadores numa única transação: não existe estado intermediário com a faixa sem aprovador
11. [`s4f2`] Inverter a ordem de dois aprovadores e recarregar devolve a nova ordem
12. [`s4f2`] DELETE de faixa usada por pedido submetido responde 200, e o pedido mantém faixaLimiteCentavos e faixaSemTeto
13. [`s4f2`] Depois do DELETE, o pedido afetado tem faixaId nulo e a cadeia gravada intacta
14. [`s4f2`] PUT e DELETE por não-admin respondem 403 SEM_PERMISSAO
15. [`s4f2`] PUT que deixaria a obra com duas faixas abertas responde 422
16. [`s4f2`] GET da faixa inclui pedidosEmAndamento com a contagem de pedidos pendentes sob ela
17. [`s4f3`] A tabela mostra as faixas da obra selecionada, ordenadas, com os aprovadores na ordem gravada
18. [`s4f3`] A faixa aberta é exibida como 'acima de R$ X', derivada do limite da faixa anterior
19. [`s4f3`] Criar faixa e recarregar mantém a faixa
20. [`s4f3`] Reordenar aprovadores e salvar persiste a nova ordem
21. [`s4f3`] O diálogo de exclusão informa quantos pedidos em andamento usam a faixa e declara que eles seguem com a cadeia gravada na submissão
22. [`s4f3`] Excluir sem confirmar no diálogo não chama a API
23. [`s4f3`] A tabela tem estado de carregando, vazio e erro com repetição
24. [`s4f3`] Erro de validação do servidor aparece ancorado no campo, via error.fields

## Definition of done

- [ ] Admin cria, edita, reordena e remove faixas pela tela
- [ ] Não-admin recebe 403 da API e explicação na tela
- [ ] O diálogo de exclusão comunica o efeito sobre pedidos em andamento
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.