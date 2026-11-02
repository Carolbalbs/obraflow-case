# Sprint 11 · Extra E3 — Gráfico na administração *(extra)*

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/11-extra-grafico-na-administracao.json`](../spec/11-extra-grafico-na-administracao.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-fullstack`

**Entregável:** Gráfico de pedidos por situação na tela de administração.

**Risco:** baixo · **Pré-requisito:** e2 · **Stack permitida:** `next`, `react`, `typescript`

## Escopo

Menor prioridade do backlog: não melhora nenhum critério do enunciado diretamente.

- **e3f1** — Gráfico de pedidos por situação: Contagem por situação, exibida na tela de administração.
- **e3f2** — Painel da administração em uma leitura: KPIs do período, série semanal de valor aprovado, cortes por faixa e por aprovador e fila de atenção, todos derivados do mesmo conjunto de pedidos lido num instante só. Entrou depois da E3, a pedido da autora (PROGRESS, § Painel da administração completo), sem feature na SPEC; registrada aqui para que a rota tenha dono, descrevendo o comportamento que ela já tem.

## Fora do escopo

- Série temporal
- Exportação
- Contagem por situação (é de e3f1)

## Mockups desta sprint

Fidelidade total ao desenho. Canvas: <https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo> — leia `project/<Artboard>.dc.html` antes de escrever tela.

- **`Dashboard`** — 10 · Painel do admin (KPIs e gráficos)

As divergências deliberadas estão na SPEC, em Mockups. A lista é fechada.

## Regras do agente

- A sprint só fecha com a tela usando a rota de verdade, nunca com dado simulado.
- Toda lista nasce com carregando, vazio e erro com repetição — não é passada posterior.
- Validação da tela usa o mesmo schema Zod do servidor, ancorada por error.fields.
- Regra de negócio fica no domínio; componente não decide alçada.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

**Modelos tocados:** Pedido

## Features

### e3f1 · Gráfico de pedidos por situação

**Categoria:** `frontend`

Contagem por situação, exibida na tela de administração.

> Como admin, quero ver a distribuição dos pedidos, para saber onde está o acúmulo.

**Steps:**

1. Rota de contagem agrupada por situação
2. Gráfico de barras na tela de administração

**Acceptance criteria:**

- [ ] A contagem exibida bate com a contagem do banco por situação
- [ ] Rascunho de outro usuário não entra na contagem de ninguém
- [ ] O gráfico tem estado de carregando, vazio e erro
- [ ] Banco vazio mostra empty state em vez de gráfico com eixos zerados

**Edge cases:**

- Uma única situação presente: o gráfico continua legível

**`GET /api/pedidos/resumo`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB · idempotente

*Query:* `obraId`: string cuid, opcional

| status | resposta |
|---|---|
| 200 | { porSituacao: { rascunho, pendente, aprovado, rejeitado } } |
| 403 | SEM_PERMISSAO |

**Modelos:** Pedido · **Arquivos:** `app/api/pedidos/resumo/route.ts` · **Depende de:** `s6f1`

**Fora de escopo:** Série temporal · Exportação

### e3f2 · Painel da administração em uma leitura

**Categoria:** `api_endpoint`

KPIs do período, série semanal de valor aprovado, cortes por faixa e por aprovador e fila de atenção, todos derivados do mesmo conjunto de pedidos lido num instante só. Entrou depois da E3, a pedido da autora (PROGRESS, § Painel da administração completo), sem feature na SPEC; registrada aqui para que a rota tenha dono, descrevendo o comportamento que ela já tem.

> Como admin, quero ver numa tela só volume, valor aprovado, tempo de decisão, rejeição e o que está parado, para saber onde a cadeia de aprovação trava.

**Steps:**

1. Rota que lê os pedidos visíveis à sessão, com etapas, e calcula tudo a partir de um único 'agora'
2. Derivações puras em src/domain/painel.ts, com caso de teste
3. Tela /admin consumindo a rota, com período de 7, 30 ou 90 dias e filtro de obra

**Acceptance criteria:**

- [ ] Sem sessão, ou com papel diferente de admin, GET /api/pedidos/painel responde 403 SEM_PERMISSAO antes de consultar pedidos
- [ ] Sem o parâmetro dias, o período é de 30 dias; dias aceita só 7, 30 ou 90, e qualquer outro valor responde 422 VALIDACAO com fields.dias
- [ ] obraId com formato inválido responde 422 VALIDACAO com fields.obraId, pelo mesmo schema de GET /api/pedidos
- [ ] O escopo de leitura é o mesmo de GET /api/pedidos: rascunho de outro usuário não entra em número nenhum
- [ ] kpis.pedidos, valorAprovadoCentavos, tempoMedioEmMs e rejeicao contam só pedidos submetidos dentro da janela, e trazem o valor da janela anterior de mesmo tamanho; variacao é null quando o anterior é zero
- [ ] kpis.parados conta os pendentes com a vez parada há 24 h ou mais no momento da chamada, independente da janela; criticos são os de 72 h ou mais
- [ ] serie tem 6 pontos S1..S6, blocos de 7 dias contados para trás a partir de agora, com o valor aprovado por obra posto na semana em que a cadeia foi concluída
- [ ] porFaixa agrupa os submetidos pelo snapshot de faixa gravado no pedido (ADR 0001), não pela alçada vigente
- [ ] porAprovador mede, por usuário, o tempo entre receber a vez e decidir, considerando só etapas decididas
- [ ] fila lista os pendentes parados há 24 h ou mais, do mais antigo para o mais novo, com quem tem a vez e o nível
- [ ] obras traz todas as obras cadastradas, por nome, para o seletor não perder opções ao filtrar
- [ ] submetidos é a contagem de pedidos não rascunho no recorte; a tela mostra empty state quando é zero
- [ ] A contagem por situação não está neste payload: o gráfico de e3f1 a lê de GET /api/pedidos/resumo

**Edge cases:**

- Nenhum pedido concluído no período: tempoMedioEmMs.valor é null, não zero
- Período sem pedido submetido: rejeicao.taxa é null

**`GET /api/pedidos/painel`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB · idempotente

*Query:* `dias`: 7 | 30 | 90, opcional, padrão 30 · `obraId`: string cuid, opcional

| status | resposta |
|---|---|
| 200 | { agora, dias, obraId | null, obras: [{ id, nome }], kpis: { pedidos, valorAprovadoCentavos, tempoMedioEmMs, rejeicao, parados }, serie: { obras, pontos }, porFaixa, porAprovador, fila, comUmaAssinatura, submetidos } |
| 403 | SEM_PERMISSAO |
| 422 | VALIDACAO — dias fora de 7/30/90 ou obraId malformado |

**Modelos:** Pedido, Etapa, Obra, Fornecedor · **Arquivos:** `app/api/pedidos/painel/route.ts`, `src/domain/painel.ts`, `src/ui/painel.ts`, `src/ui/componentes/PainelDoAdmin.tsx`, `app/admin/page.tsx` · **Depende de:** `e3f1`

**Fora de escopo:** Exportação · Contagem por situação (é de e3f1)

## Critérios de aceite da sprint

1. [`e3f1`] A contagem exibida bate com a contagem do banco por situação
2. [`e3f1`] Rascunho de outro usuário não entra na contagem de ninguém
3. [`e3f1`] O gráfico tem estado de carregando, vazio e erro
4. [`e3f1`] Banco vazio mostra empty state em vez de gráfico com eixos zerados
5. [`e3f2`] Sem sessão, ou com papel diferente de admin, GET /api/pedidos/painel responde 403 SEM_PERMISSAO antes de consultar pedidos
6. [`e3f2`] Sem o parâmetro dias, o período é de 30 dias; dias aceita só 7, 30 ou 90, e qualquer outro valor responde 422 VALIDACAO com fields.dias
7. [`e3f2`] obraId com formato inválido responde 422 VALIDACAO com fields.obraId, pelo mesmo schema de GET /api/pedidos
8. [`e3f2`] O escopo de leitura é o mesmo de GET /api/pedidos: rascunho de outro usuário não entra em número nenhum
9. [`e3f2`] kpis.pedidos, valorAprovadoCentavos, tempoMedioEmMs e rejeicao contam só pedidos submetidos dentro da janela, e trazem o valor da janela anterior de mesmo tamanho; variacao é null quando o anterior é zero
10. [`e3f2`] kpis.parados conta os pendentes com a vez parada há 24 h ou mais no momento da chamada, independente da janela; criticos são os de 72 h ou mais
11. [`e3f2`] serie tem 6 pontos S1..S6, blocos de 7 dias contados para trás a partir de agora, com o valor aprovado por obra posto na semana em que a cadeia foi concluída
12. [`e3f2`] porFaixa agrupa os submetidos pelo snapshot de faixa gravado no pedido (ADR 0001), não pela alçada vigente
13. [`e3f2`] porAprovador mede, por usuário, o tempo entre receber a vez e decidir, considerando só etapas decididas
14. [`e3f2`] fila lista os pendentes parados há 24 h ou mais, do mais antigo para o mais novo, com quem tem a vez e o nível
15. [`e3f2`] obras traz todas as obras cadastradas, por nome, para o seletor não perder opções ao filtrar
16. [`e3f2`] submetidos é a contagem de pedidos não rascunho no recorte; a tela mostra empty state quando é zero
17. [`e3f2`] A contagem por situação não está neste payload: o gráfico de e3f1 a lê de GET /api/pedidos/resumo

## Definition of done

- [ ] O gráfico existe e não atrapalha nenhuma tela

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.