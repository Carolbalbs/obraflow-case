# Sprint 5 · Tela 1 — Cadastro de pedido

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/05-tela-1-cadastro-de-pedido.json`](../spec/05-tela-1-cadastro-de-pedido.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-fullstack`

**Entregável:** Montar um pedido de três itens, salvar como rascunho, sair, voltar, completar e submeter — e a cadeia aparece gravada no banco.

**Risco:** alto · **Pré-requisito:** s4 · **Stack permitida:** `next`, `react`, `typescript`, `tailwind`, `prisma`, `zod`

## Escopo

Rascunho salvável e incompleto, itens N com total calculado, e submissão separada da criação.

- **s5f1** — Rascunho: criar, editar e apagar: Rascunho é privado do criador. Pedido submetido é imutável.
- **s5f2** — Submissão: resolve a faixa e grava a cadeia: Valida por inteiro, carimba submetidoEm, resolve a faixa, grava o snapshot e as etapas — tudo numa transação.
- **s5f3** — Formulário de pedido com itens N: Dados gerais, editor de itens com total calculado e não editável, e total do pedido somado ao vivo.
- **s5f4** — Listagem de obras e fornecedores: As duas entidades que a Tela 1 seleciona, listadas por API. Só leitura: o cadastro delas continua fora de escopo, e o seed é quem as cria.

## Fora do escopo

- Editar pedido submetido (fora de escopo no PRD)
- Cancelar pedido submetido (decisão 5 da revisão)
- Duplicar pedido rejeitado (extra E4)
- Notificar o aprovador da vez (fora de escopo no PRD)
- Simulador de cadeia ao vivo (extra E1)
- Anexos (fora de escopo no PRD)
- Cadastro, edição e remoção de obra e fornecedor (fora de escopo no PRD)
- Paginação: as tabelas são pequenas e criadas pelo seed

## Mockups desta sprint

Fidelidade total ao desenho. Canvas: <https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo> — leia `project/<Artboard>.dc.html` antes de escrever tela.

- **`Main`** — 1 · Cadastro de pedido

As divergências deliberadas estão na SPEC, em Mockups. A lista é fechada.

## Regras do agente

- A sprint só fecha com a tela usando a rota de verdade, nunca com dado simulado.
- Toda lista nasce com carregando, vazio e erro com repetição — não é passada posterior.
- Validação da tela usa o mesmo schema Zod do servidor, ancorada por error.fields.
- Regra de negócio fica no domínio; componente não decide alçada.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

**Modelos tocados:** Etapa, Faixa, Fornecedor, ItemPedido, Obra, Pedido

## Features

### s5f1 · Rascunho: criar, editar e apagar

**Categoria:** `api_endpoint`

Rascunho é privado do criador. Pedido submetido é imutável.

> Como comprador, quero salvar um rascunho incompleto e voltar depois, para que interrupção na obra não custe o trabalho feito.

**Steps:**

1. Escrever POST /api/pedidos criando rascunho do usuário da sessão
2. Escrever PUT /api/pedidos/[id] substituindo cabeçalho e itens do rascunho
3. Escrever DELETE /api/pedidos/[id]
4. Recusar qualquer escrita em pedido não-rascunho
5. Recusar acesso de quem não criou

**Acceptance criteria:**

- [ ] POST cria rascunho com situacao 'rascunho', totalCentavos 0 e criadoPorId igual ao usuário da sessão
- [ ] POST aceita corpo com todos os campos ausentes, porque rascunho é incompleto por natureza
- [ ] PUT recalcula totalCentavos como a soma dos totais dos itens; um totalCentavos enviado no corpo é ignorado
- [ ] PUT em pedido com situacao diferente de 'rascunho' responde 409 com código PEDIDO_IMUTAVEL
- [ ] GET, PUT e DELETE de rascunho de outro usuário respondem 404 NAO_ENCONTRADO, não 403 — rascunho alheio não existe para quem não o criou
- [ ] PUT com mais de 100 itens responde 422
- [ ] DELETE de rascunho responde 200 e apaga os itens em cascata
- [ ] DELETE de pedido submetido responde 409 PEDIDO_IMUTAVEL
- [ ] Usuário com papel aprovador ou visualizador recebe 403 ao tentar POST
- [ ] POST e PUT gravam a dataPedido enviada ("AAAA-MM-DD") e a devolvem; ausente ou vazia, fica nula
- [ ] Item sem preço informado é gravado com precoUnitarioCentavos nulo, nunca zero; preço zero informado é gravado como zero

**Edge cases:**

- dataPedido malformada ou fora do calendário no corpo: 422 com fields.dataPedido; vazia ou ausente é aceita no rascunho
- Item com ordem duplicada no array: a ordem é reindexada pela posição
- Pedido inexistente: 404
- Obra inexistente no corpo: 422

**`POST /api/pedidos`** — auth: sessao + papel comprador ou admin · timeout 5000ms · payload 1MB

*Body:* `obraId`: string cuid, opcional no rascunho · `dataPedido`: string "AAAA-MM-DD", opcional no rascunho

| status | resposta |
|---|---|
| 201 | { id, situacao: 'rascunho', totalCentavos: 0 } |
| 403 | SEM_PERMISSAO |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO |

*Efeitos:* cria Pedido com criadoPorId da sessão

**`PUT /api/pedidos/{id}`** — auth: sessao + ser o criador · timeout 5000ms · payload 1MB · idempotente

*Body:* `obraId`: string cuid, opcional · `fornecedorId`: string cuid, opcional · `dataPedido`: string "AAAA-MM-DD", opcional no rascunho · `observacoes`: string, máx 2000, opcional · `itens`: array 0..100 de { descricao máx 200, quantidade > 0, unidade, precoUnitario >= 0 e <= R$ 10.000.000,00 }

| status | resposta |
|---|---|
| 200 | { id, totalCentavos, itens } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO — inexistente ou de outro usuário |
| 409 | PEDIDO_IMUTAVEL — já submetido |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO com fields por item |

*Efeitos:* substitui os itens numa transação · recalcula totalCentavos no servidor

**`DELETE /api/pedidos/{id}`** — auth: sessao + ser o criador · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | { removido: true } |
| 404 | NAO_ENCONTRADO |
| 409 | PEDIDO_IMUTAVEL |

*Efeitos:* apaga Pedido e ItemPedido em cascata

**Modelos:** Pedido, ItemPedido · **Arquivos:** `app/api/pedidos/route.ts`, `app/api/pedidos/[id]/route.ts` · **Depende de:** `s3f4`, `s2f6`

**Fora de escopo:** Editar pedido submetido (fora de escopo no PRD) · Cancelar pedido submetido (decisão 5 da revisão) · Duplicar pedido rejeitado (extra E4)

### s5f2 · Submissão: resolve a faixa e grava a cadeia

**Categoria:** `api_endpoint`

Valida por inteiro, carimba submetidoEm, resolve a faixa, grava o snapshot e as etapas — tudo numa transação.

> Como comprador, quero que a cadeia seja definida na submissão, para que o pedido siga o caminho certo sem eu escolher ninguém.

**Steps:**

1. Escrever POST /api/pedidos/[id]/submissao
2. Validar com submissaoSchema
3. Carimbar submetidoEm no servidor, sem tocar a dataPedido do rascunho
4. Resolver a faixa pelo total e montar a cadeia
5. Gravar snapshot, etapas e situacao pendente numa transação

**Acceptance criteria:**

- [ ] Pedido de R$ 8.000 numa obra cuja faixa até R$ 10.000 tem [Amanda] grava cadeia com exatamente uma etapa, de Amanda, ordem 0
- [ ] Pedido de R$ 12.500 cuja faixa acima tem [Amanda, João] grava duas etapas nessa ordem, ambas pendentes
- [ ] Pedido de exatamente R$ 10.000,00 resolve para a faixa 'até R$ 10.000,00'
- [ ] Pedido com 5 itens de R$ 3.000 (total R$ 15.000) resolve pela faixa do TOTAL, não pelo valor de item isolado
- [ ] Total que não cai em nenhuma faixa responde 422 com código SEM_REGRA_APLICAVEL, e o pedido continua com situacao 'rascunho'
- [ ] Após a submissão, o pedido tem faixaLimiteCentavos e faixaSemTeto preenchidos a partir da faixa aplicada
- [ ] Rascunho sem dataPedido é recusado com 422 VALIDACAO e fields.dataPedido; com data, a dataPedido gravada é a do rascunho e submetidoEm é o horário do servidor no instante da submissão
- [ ] Submissão sem itens responde 422
- [ ] Submissão sem fornecedor ou sem obra responde 422 com fields
- [ ] Falha de validação não deixa etapa órfã: contagem de Etapa do pedido permanece zero
- [ ] Submeter pedido já submetido responde 409 PEDIDO_IMUTAVEL
- [ ] Submeter pedido de outro usuário responde 404

**Edge cases:**

- A faixa é apagada entre a leitura e a escrita: a transação relê e, se a faixa sumiu, responde 422 SEM_REGRA_APLICAVEL
- Obra sem faixa nenhuma: 422 SEM_REGRA_APLICAVEL com mensagem de obra sem faixas
- Faixa aplicável sem aprovador: 422 SEM_REGRA_APLICAVEL
- Dois POST de submissão concorrentes no mesmo pedido: a transação condiciona a situacao 'rascunho', e o segundo recebe 409

**`POST /api/pedidos/{id}/submissao`** — auth: sessao + ser o criador + papel comprador ou admin · timeout 8000ms · payload 1MB

| status | resposta |
|---|---|
| 200 | { id, situacao: 'pendente', cadeia: [{ ordem, usuarioId, nome, situacao }], faixa: { limiteCentavos, semTeto } } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |
| 409 | PEDIDO_IMUTAVEL — já submetido |
| 422 | VALIDACAO ou SEM_REGRA_APLICAVEL |

*Efeitos:* carimba submetidoEm (dataPedido é a do rascunho) · grava o snapshot da faixa no pedido · cria as Etapa da cadeia · muda situacao para pendente

**Modelos:** Pedido, Etapa, Faixa · **Arquivos:** `app/api/pedidos/[id]/submissao/route.ts` · **Depende de:** `s5f1`, `s2f3`, `s2f4`

**Fora de escopo:** Notificar o aprovador da vez (fora de escopo no PRD)

### s5f3 · Formulário de pedido com itens N

**Categoria:** `frontend`

Dados gerais, editor de itens com total calculado e não editável, e total do pedido somado ao vivo.

> Como comprador, quero ver o total somado enquanto digito, para saber de antemão qual alçada vou acionar.

**Steps:**

1. Formulário de obra, fornecedor e observações
2. Editor de itens começando com um item em branco, com adicionar, editar e remover
3. Total do item calculado e exibido como leitura
4. Total do pedido somado e visível
5. Habilitar o envio só com tudo válido, dizendo o que falta quando apagado

**Acceptance criteria:**

- [ ] Adicionar 3 itens válidos exibe, para cada um, total igual a quantidade x preço unitário
- [ ] Nenhum campo de total é editável: os inputs de total têm readonly
- [ ] O total do pedido é a soma dos totais dos itens e atualiza a cada alteração
- [ ] Item inválido fica fora da soma exibida
- [ ] O botão de cadastrar permanece desabilitado com o motivo visível enquanto houver campo inválido
- [ ] Quantidade negativa ou não numérica acende o erro NO ITEM correspondente, via error.fields
- [ ] Submeter sem nenhum item é recusado com mensagem clara
- [ ] Salvar rascunho, sair da tela e voltar restaura o que foi preenchido
- [ ] O formulário tem o campo obrigatório "Data do pedido" (input type=date), na posição do artboard; vazio, o erro acende no campo via fields.dataPedido e o botão de cadastrar fica desabilitado com o motivo visível

**Edge cases:**

- SEM_REGRA_APLICAVEL na submissão: mensagem específica, o rascunho permanece e a tela sugere criar a faixa na tela de regras
- Obra sem faixas escolhida: aviso antes mesmo de tentar submeter
- Nenhuma obra ou nenhum fornecedor no banco: empty state apontando o seed
- API fora do ar ao salvar: erro com repetição, sem perder o que está na tela
- Mais de 100 itens: o botão de adicionar desabilita com o motivo

**Modelos:** Pedido, ItemPedido, Obra, Fornecedor · **Arquivos:** `app/pedidos/novo/page.tsx`, `src/ui/componentes/`, `src/ui/hooks/` · **Depende de:** `s5f1`, `s5f2`

**Fora de escopo:** Simulador de cadeia ao vivo (extra E1) · Anexos (fora de escopo no PRD)

### s5f4 · Listagem de obras e fornecedores

**Categoria:** `api_endpoint`

As duas entidades que a Tela 1 seleciona, listadas por API. Só leitura: o cadastro delas continua fora de escopo, e o seed é quem as cria.

> Como cliente da API, quero listar obras e fornecedores, para montar um pedido sem depender da página que já os traz carregados.

**Steps:**

1. Escrever GET /api/obras devolvendo id, nome e cidade, por nome
2. Escrever GET /api/fornecedores devolvendo id, nome e documento, por nome
3. Exigir sessão nas duas, sem restrição de papel

**Acceptance criteria:**

- [ ] GET /api/obras com sessão de qualquer um dos quatro papéis responde 200 com um array de { id, nome, cidade } em ordem alfabética de nome
- [ ] GET /api/fornecedores com sessão de qualquer um dos quatro papéis responde 200 com um array de { id, nome, documento } em ordem alfabética de nome; documento é null quando não informado
- [ ] As duas rotas, sem sessão, respondem 403 com o envelope { error: { code: 'SEM_PERMISSAO', message } }
- [ ] A quantidade de itens devolvida é igual à contagem da tabela correspondente no banco (3 obras e 4 fornecedores com o seed)
- [ ] Nenhum campo além dos declarados atravessa a borda (criadoEm não aparece)
- [ ] A forma devolvida é a mesma que app/pedidos/novo/page.tsx entrega ao formulário

**Edge cases:**

- Tabela vazia: 200 com array vazio, não 404
- POST, PUT ou DELETE nas duas rotas: 405, porque só GET está exportado

**`GET /api/obras`** — auth: sessao, qualquer papel · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | [{ id, nome, cidade }] ordenado por nome; lista vazia quando não há obra |
| 403 | SEM_PERMISSAO — sem sessão |

**`GET /api/fornecedores`** — auth: sessao, qualquer papel · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | [{ id, nome, documento | null }] ordenado por nome; lista vazia quando não há fornecedor |
| 403 | SEM_PERMISSAO — sem sessão |

**Modelos:** Obra, Fornecedor · **Arquivos:** `app/api/obras/route.ts`, `app/api/fornecedores/route.ts` · **Depende de:** `s3f1`, `s3f4`

**Fora de escopo:** Cadastro, edição e remoção de obra e fornecedor (fora de escopo no PRD) · Paginação: as tabelas são pequenas e criadas pelo seed

## Critérios de aceite da sprint

1. [`s5f1`] POST cria rascunho com situacao 'rascunho', totalCentavos 0 e criadoPorId igual ao usuário da sessão
2. [`s5f1`] POST aceita corpo com todos os campos ausentes, porque rascunho é incompleto por natureza
3. [`s5f1`] PUT recalcula totalCentavos como a soma dos totais dos itens; um totalCentavos enviado no corpo é ignorado
4. [`s5f1`] PUT em pedido com situacao diferente de 'rascunho' responde 409 com código PEDIDO_IMUTAVEL
5. [`s5f1`] GET, PUT e DELETE de rascunho de outro usuário respondem 404 NAO_ENCONTRADO, não 403 — rascunho alheio não existe para quem não o criou
6. [`s5f1`] PUT com mais de 100 itens responde 422
7. [`s5f1`] DELETE de rascunho responde 200 e apaga os itens em cascata
8. [`s5f1`] DELETE de pedido submetido responde 409 PEDIDO_IMUTAVEL
9. [`s5f1`] Usuário com papel aprovador ou visualizador recebe 403 ao tentar POST
10. [`s5f1`] POST e PUT gravam a dataPedido enviada ("AAAA-MM-DD") e a devolvem; ausente ou vazia, fica nula
11. [`s5f1`] Item sem preço informado é gravado com precoUnitarioCentavos nulo, nunca zero; preço zero informado é gravado como zero
12. [`s5f2`] Pedido de R$ 8.000 numa obra cuja faixa até R$ 10.000 tem [Amanda] grava cadeia com exatamente uma etapa, de Amanda, ordem 0
13. [`s5f2`] Pedido de R$ 12.500 cuja faixa acima tem [Amanda, João] grava duas etapas nessa ordem, ambas pendentes
14. [`s5f2`] Pedido de exatamente R$ 10.000,00 resolve para a faixa 'até R$ 10.000,00'
15. [`s5f2`] Pedido com 5 itens de R$ 3.000 (total R$ 15.000) resolve pela faixa do TOTAL, não pelo valor de item isolado
16. [`s5f2`] Total que não cai em nenhuma faixa responde 422 com código SEM_REGRA_APLICAVEL, e o pedido continua com situacao 'rascunho'
17. [`s5f2`] Após a submissão, o pedido tem faixaLimiteCentavos e faixaSemTeto preenchidos a partir da faixa aplicada
18. [`s5f2`] Rascunho sem dataPedido é recusado com 422 VALIDACAO e fields.dataPedido; com data, a dataPedido gravada é a do rascunho e submetidoEm é o horário do servidor no instante da submissão
19. [`s5f2`] Submissão sem itens responde 422
20. [`s5f2`] Submissão sem fornecedor ou sem obra responde 422 com fields
21. [`s5f2`] Falha de validação não deixa etapa órfã: contagem de Etapa do pedido permanece zero
22. [`s5f2`] Submeter pedido já submetido responde 409 PEDIDO_IMUTAVEL
23. [`s5f2`] Submeter pedido de outro usuário responde 404
24. [`s5f3`] Adicionar 3 itens válidos exibe, para cada um, total igual a quantidade x preço unitário
25. [`s5f3`] Nenhum campo de total é editável: os inputs de total têm readonly
26. [`s5f3`] O total do pedido é a soma dos totais dos itens e atualiza a cada alteração
27. [`s5f3`] Item inválido fica fora da soma exibida
28. [`s5f3`] O botão de cadastrar permanece desabilitado com o motivo visível enquanto houver campo inválido
29. [`s5f3`] Quantidade negativa ou não numérica acende o erro NO ITEM correspondente, via error.fields
30. [`s5f3`] Submeter sem nenhum item é recusado com mensagem clara
31. [`s5f3`] Salvar rascunho, sair da tela e voltar restaura o que foi preenchido
32. [`s5f3`] O formulário tem o campo obrigatório "Data do pedido" (input type=date), na posição do artboard; vazio, o erro acende no campo via fields.dataPedido e o botão de cadastrar fica desabilitado com o motivo visível
33. [`s5f4`] GET /api/obras com sessão de qualquer um dos quatro papéis responde 200 com um array de { id, nome, cidade } em ordem alfabética de nome
34. [`s5f4`] GET /api/fornecedores com sessão de qualquer um dos quatro papéis responde 200 com um array de { id, nome, documento } em ordem alfabética de nome; documento é null quando não informado
35. [`s5f4`] As duas rotas, sem sessão, respondem 403 com o envelope { error: { code: 'SEM_PERMISSAO', message } }
36. [`s5f4`] A quantidade de itens devolvida é igual à contagem da tabela correspondente no banco (3 obras e 4 fornecedores com o seed)
37. [`s5f4`] Nenhum campo além dos declarados atravessa a borda (criadoEm não aparece)
38. [`s5f4`] A forma devolvida é a mesma que app/pedidos/novo/page.tsx entrega ao formulário

## Definition of done

- [ ] Pedido de três itens montado, salvo como rascunho, retomado e submetido
- [ ] A cadeia aparece gravada no banco com as etapas na ordem da faixa
- [ ] SEM_REGRA_APLICAVEL bloqueia a submissão sem perder o rascunho
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.