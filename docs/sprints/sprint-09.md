# Sprint 9 · Extra E1 — Simulador de alçada ao vivo *(extra)*

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/09-extra-simulador-de-alcada-ao-vivo.json`](../spec/09-extra-simulador-de-alcada-ao-vivo.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-fullstack`

**Entregável:** Mudar um preço muda a cadeia prevista na tela, sem criar nada no banco.

**Risco:** baixo · **Pré-requisito:** s8 · **Stack permitida:** `next`, `react`, `typescript`, `zod`

## Escopo

Na tela de cadastro, a cadeia prevista aparece conforme o total muda, inclusive o estado sem regra aplicável.

- **e1f1** — Rota de simulação da cadeia: Recebe obra e total, devolve a cadeia prevista sem criar nada. Reaproveita resolverFaixa.
- **e1f2** — Cadeia prevista no cadastro: Componente que atualiza conforme o total muda, desenhado no artboard AprovacoesB.

## Mockups desta sprint

Fidelidade total ao desenho. Canvas: <https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo> — leia `project/<Artboard>.dc.html` antes de escrever tela.

- **`AprovacoesB`** — 2B · Aprovação ao vivo

As divergências deliberadas estão na SPEC, em Mockups. A lista é fechada.

## Regras do agente

- A sprint só fecha com a tela usando a rota de verdade, nunca com dado simulado.
- Toda lista nasce com carregando, vazio e erro com repetição — não é passada posterior.
- Validação da tela usa o mesmo schema Zod do servidor, ancorada por error.fields.
- Regra de negócio fica no domínio; componente não decide alçada.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

**Modelos tocados:** Faixa, Obra

## Features

### e1f1 · Rota de simulação da cadeia

**Categoria:** `api_endpoint`

Recebe obra e total, devolve a cadeia prevista sem criar nada. Reaproveita resolverFaixa.

> Como compradora, quero ver quem vai aprovar antes de enviar, para saber em que alçada estou caindo.

**Steps:**

1. Escrever POST /api/alcadas/simulacao
2. Reusar resolverFaixa e montarCadeia
3. Devolver também o estado sem regra aplicável

**Acceptance criteria:**

- [ ] A rota não cria nem altera nenhuma linha: contagem de Pedido e Etapa é idêntica antes e depois
- [ ] Devolve a mesma cadeia que a submissão gravaria para o mesmo total e obra
- [ ] Total sem faixa aplicável devolve 200 com o estado sem regra aplicável, não 422 — simular não é submeter
- [ ] Obra inexistente responde 404

**Edge cases:**

- Total zero: devolve a faixa mais baixa
- Obra sem faixas: estado sem regra aplicável com a mensagem de obra sem faixas

**`POST /api/alcadas/simulacao`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

*Body:* `obraId`: string cuid · `totalCentavos`: int >= 0

| status | resposta |
|---|---|
| 200 | { aplicavel: boolean, faixa?: { limiteCentavos, semTeto }, cadeia?: [{ ordem, usuarioId, nome }], motivo?: string } |
| 404 | NAO_ENCONTRADO |
| 422 | VALIDACAO |

**Modelos:** Faixa, Obra · **Arquivos:** `app/api/alcadas/simulacao/route.ts` · **Depende de:** `s2f3`, `s2f4`

### e1f2 · Cadeia prevista no cadastro

**Categoria:** `frontend`

Componente que atualiza conforme o total muda, desenhado no artboard AprovacoesB.

> Como compradora, quero ver a cadeia mudar enquanto digito, para entender a regra sem ler documentação.

**Steps:**

1. Componente de cadeia prevista na tela de cadastro
2. Chamar a simulação com debounce ao mudar o total
3. Exibir o estado sem regra aplicável

**Acceptance criteria:**

- [ ] Mudar um preço e sair do campo atualiza a cadeia prevista
- [ ] A chamada é feita com debounce de ao menos 300ms
- [ ] O estado sem regra aplicável aparece com a mesma mensagem que a submissão daria
- [ ] O componente tem estado de carregando próprio e não bloqueia a digitação

**Edge cases:**

- Total inválido: o componente mantém a última cadeia válida e sinaliza que está desatualizada
- API fora do ar: o componente some em vez de mostrar erro; a simulação é conforto, não requisito

**Arquivos:** `src/ui/componentes/`, `app/pedidos/novo/page.tsx` · **Depende de:** `e1f1`, `s5f3`

## Critérios de aceite da sprint

1. [`e1f1`] A rota não cria nem altera nenhuma linha: contagem de Pedido e Etapa é idêntica antes e depois
2. [`e1f1`] Devolve a mesma cadeia que a submissão gravaria para o mesmo total e obra
3. [`e1f1`] Total sem faixa aplicável devolve 200 com o estado sem regra aplicável, não 422 — simular não é submeter
4. [`e1f1`] Obra inexistente responde 404
5. [`e1f2`] Mudar um preço e sair do campo atualiza a cadeia prevista
6. [`e1f2`] A chamada é feita com debounce de ao menos 300ms
7. [`e1f2`] O estado sem regra aplicável aparece com a mesma mensagem que a submissão daria
8. [`e1f2`] O componente tem estado de carregando próprio e não bloqueia a digitação

## Definition of done

- [ ] Mudar um preço muda a cadeia na tela
- [ ] Nenhuma linha é criada pela simulação

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.