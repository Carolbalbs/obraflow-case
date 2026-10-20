# Sprint 7 · Estados, validações e responsividade

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/07-estados-validacoes-e-responsividade.json`](../spec/07-estados-validacoes-e-responsividade.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-fullstack`

**Entregável:** Derrubar o servidor com a tela aberta produz estado de erro com botão de repetir, e nenhuma lista pisca conteúdo vazio antes de carregar.

**Risco:** baixo · **Pré-requisito:** s6 · **Stack permitida:** `next`, `react`, `typescript`, `tailwind`, `zod`

## Escopo

Passada dedicada, não polvilhada pelo caminho: carregando, vazio, erro com repetição, validação por campo e layout de 390px para cima.

- **s7f1** — Carregando, vazio e erro em toda lista: Os três estados como consequência da forma do hook de dados, não como trabalho de cada tela.
- **s7f2** — Validação por campo com o schema do servidor: O mesmo schema Zod nas duas pontas, com o erro ancorado no input certo via error.fields.
- **s7f3** — Responsividade de 390px para cima: Tabela de itens vira cartões abaixo de 768px; a cadeia empilha no vertical.

## Fora do escopo

- Cache entre navegações
- Revalidação em foco
- Aplicativo nativo
- Modo offline

## Mockups desta sprint

Fidelidade total ao desenho. Canvas: <https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo> — leia `project/<Artboard>.dc.html` antes de escrever tela.

- **`Estados`** — 4 · Estados e validações

As divergências deliberadas estão na SPEC, em Mockups. A lista é fechada.

## Regras do agente

- A sprint só fecha com a tela usando a rota de verdade, nunca com dado simulado.
- Toda lista nasce com carregando, vazio e erro com repetição — não é passada posterior.
- Validação da tela usa o mesmo schema Zod do servidor, ancorada por error.fields.
- Regra de negócio fica no domínio; componente não decide alçada.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

## Features

### s7f1 · Carregando, vazio e erro em toda lista

**Categoria:** `frontend`

Os três estados como consequência da forma do hook de dados, não como trabalho de cada tela.

> Como qualquer usuário, quero entender o que está acontecendo quando algo falha, para não ficar diante de uma tela branca.

**Steps:**

1. Padronizar o hook de dados devolvendo dados, carregando, erro e recarregar
2. Esqueleto de carregamento em toda lista
3. Empty state próprio por lista
4. Caixa de erro com ação de tentar de novo

**Acceptance criteria:**

- [ ] Nenhuma lista renderiza conteúdo vazio antes de terminar de carregar: o esqueleto aparece primeiro
- [ ] Com a API derrubada, toda lista mostra erro com botão de tentar de novo
- [ ] Clicar em tentar de novo refaz a requisição sem recarregar a página
- [ ] Banco sem obras mostra empty state explicando que o seed precisa rodar
- [ ] Banco sem pedidos mostra empty state, não tabela com zero linhas
- [ ] Obra sem faixa mostra empty state explicando que nenhum pedido poderá ser submetido
- [ ] Todo hook de dados devolve a mesma quádrupla: dados, carregando, erro, recarregar

**Edge cases:**

- Erro 500 do servidor: mesma caixa de erro, com o código do envelope
- Resposta lenta acima de 300ms: o esqueleto permanece em vez de piscar
- Rede offline: mesma caixa de erro

**Arquivos:** `src/ui/hooks/`, `src/ui/componentes/` · **Depende de:** `s6f4`, `s6f5`

**Fora de escopo:** Cache entre navegações · Revalidação em foco

### s7f2 · Validação por campo com o schema do servidor

**Categoria:** `frontend`

O mesmo schema Zod nas duas pontas, com o erro ancorado no input certo via error.fields.

> Como compradora, quero o erro ancorado no campo, para não procurar o que corrigir.

**Steps:**

1. Importar os schemas do domínio no formulário
2. Mapear error.fields para os inputs
3. Ancorar erro de item no índice correto

**Acceptance criteria:**

- [ ] Quantidade negativa acende o erro no item correspondente, não no topo do formulário
- [ ] O formulário recusa o que a rota recusaria: o mesmo schema é importado de src/domain/schemas.ts
- [ ] Erro vindo do servidor em error.fields é exibido no input de mesmo nome
- [ ] Corrigir o campo limpa o erro sem novo envio

**Edge cases:**

- Erro sem fields: exibido como mensagem geral do formulário
- Campo do servidor sem input correspondente: cai na mensagem geral, nunca some

**Arquivos:** `src/ui/componentes/`, `app/pedidos/novo/page.tsx`, `app/alcadas/page.tsx` · **Depende de:** `s2f6`, `s5f3`

### s7f3 · Responsividade de 390px para cima

**Categoria:** `frontend`

Tabela de itens vira cartões abaixo de 768px; a cadeia empilha no vertical.

> Como usuário no canteiro, quero usar no celular, para não depender de voltar ao escritório.

**Steps:**

1. Tabela de itens virando cartões abaixo de 768px
2. Cadeia empilhando no vertical em tela estreita
3. Conferir as três telas em 390px

**Acceptance criteria:**

- [ ] Em 390px não há rolagem horizontal em nenhuma das três telas
- [ ] Abaixo de 768px a tabela de itens é renderizada como cartões
- [ ] A cadeia de aprovação permanece legível em 390px
- [ ] Alvos de toque têm ao menos 44px de altura

**Edge cases:**

- Descrição de item muito longa: quebra em vez de estourar o cartão
- Tabela de faixas com 10 aprovadores: lista empilha em vez de estourar

**Arquivos:** `src/ui/componentes/`, `app/globals.css` · **Depende de:** `s7f1`

**Fora de escopo:** Aplicativo nativo · Modo offline

## Critérios de aceite da sprint

1. [`s7f1`] Nenhuma lista renderiza conteúdo vazio antes de terminar de carregar: o esqueleto aparece primeiro
2. [`s7f1`] Com a API derrubada, toda lista mostra erro com botão de tentar de novo
3. [`s7f1`] Clicar em tentar de novo refaz a requisição sem recarregar a página
4. [`s7f1`] Banco sem obras mostra empty state explicando que o seed precisa rodar
5. [`s7f1`] Banco sem pedidos mostra empty state, não tabela com zero linhas
6. [`s7f1`] Obra sem faixa mostra empty state explicando que nenhum pedido poderá ser submetido
7. [`s7f1`] Todo hook de dados devolve a mesma quádrupla: dados, carregando, erro, recarregar
8. [`s7f2`] Quantidade negativa acende o erro no item correspondente, não no topo do formulário
9. [`s7f2`] O formulário recusa o que a rota recusaria: o mesmo schema é importado de src/domain/schemas.ts
10. [`s7f2`] Erro vindo do servidor em error.fields é exibido no input de mesmo nome
11. [`s7f2`] Corrigir o campo limpa o erro sem novo envio
12. [`s7f3`] Em 390px não há rolagem horizontal em nenhuma das três telas
13. [`s7f3`] Abaixo de 768px a tabela de itens é renderizada como cartões
14. [`s7f3`] A cadeia de aprovação permanece legível em 390px
15. [`s7f3`] Alvos de toque têm ao menos 44px de altura

## Definition of done

- [ ] Derrubar o servidor com a tela aberta produz erro com repetição em toda lista
- [ ] Nenhuma lista pisca conteúdo vazio
- [ ] Validação por campo ancorada via error.fields
- [ ] 390px sem rolagem horizontal nas três telas
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.