# Sprint 6 · Tela 2 — Aprovação

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/06-tela-2-aprovacao.json`](../spec/06-tela-2-aprovacao.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-fullstack`

**Entregável:** Entrando como Amanda e depois como João, a mesma lista mostra filas diferentes, e aprovar como Amanda libera a decisão do João.

**Risco:** alto · **Pré-requisito:** s5 · **Stack permitida:** `next`, `react`, `typescript`, `tailwind`, `prisma`, `zod`

## Escopo

Lista com filtros, detalhe com itens e histórico, decisão por UPDATE condicional e diálogo de rejeição com motivo obrigatório.

- **s6f1** — Listar pedidos com filtros e ações: Todos veem todos os pedidos submetidos; rascunho só do próprio criador. A resposta já diz o que a sessão pode fazer.
- **s6f2** — Detalhe do pedido com a cadeia gravada: Cabeçalho, itens, cadeia do snapshot e histórico de decisões.
- **s6f3** — Decisão por UPDATE condicional: Uma escrita condicionada ao estado que a autoriza. Zero linhas afetadas vira 409.
- **s6f4** — Lista de aprovação com filtro padrão: Lista com todas as colunas do enunciado, abrindo filtrada em 'aguardando minha decisão' para o aprovador.
- **s6f5** — Detalhe, cadeia desenhada e diálogo de rejeição: Itens, histórico, cadeia com a etapa corrente destacada, e decisão indisponível sempre explicada.

## Fora do escopo

- Busca por texto
- Ordenação configurável
- Aprovação em paralelo ou por quórum (fora de escopo no PRD)
- Delegação (fora de escopo no PRD)

## Mockups desta sprint

Fidelidade total ao desenho. Canvas: <https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo> — leia `project/<Artboard>.dc.html` antes de escrever tela.

- **`Aprovacoes`** — 2A · Aprovação (base)
- **`AprovacoesC`** — 2C · Overview do pedido (jornada)
- **`PedidoDetalhe`** — 2C · Pedido completo (detalhamento)

As divergências deliberadas estão na SPEC, em Mockups. A lista é fechada.

## Regras do agente

- A sprint só fecha com a tela usando a rota de verdade, nunca com dado simulado.
- Toda lista nasce com carregando, vazio e erro com repetição — não é passada posterior.
- Validação da tela usa o mesmo schema Zod do servidor, ancorada por error.fields.
- Regra de negócio fica no domínio; componente não decide alçada.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

**Modelos tocados:** Etapa, Fornecedor, ItemPedido, Obra, Pedido

## Features

### s6f1 · Listar pedidos com filtros e ações

**Categoria:** `api_endpoint`

Todos veem todos os pedidos submetidos; rascunho só do próprio criador. A resposta já diz o que a sessão pode fazer.

> Como aprovador, quero ver o que depende de mim, para não perder tempo com o que ainda não chegou na minha etapa.

**Steps:**

1. Escrever GET /api/pedidos com filtros de situação e obra
2. Incluir rascunhos apenas do usuário da sessão
3. Calcular, por pedido, as ações possíveis para a sessão
4. Devolver a alçada atual de cada pedido pendente

**Acceptance criteria:**

- [ ] Sem filtro, a lista traz todos os pedidos submetidos de todas as obras
- [ ] Rascunho de outro usuário NUNCA aparece na lista, para nenhum papel
- [ ] Rascunho próprio aparece apenas quando o filtro de situação inclui 'rascunho'
- [ ] Cada pedido traz identificador, obra, fornecedor, data, contagem de itens, total, situação e a etapa atual
- [ ] Cada pedido traz podeDecidir booleano, verdadeiro só para o aprovador da vez com papel aprovador
- [ ] Chamar como Amanda e como João devolve podeDecidir diferente para o mesmo pedido
- [ ] Filtro por situacao inválida responde 422
- [ ] Filtro por obra inexistente devolve lista vazia, não 404

**Edge cases:**

- Banco sem pedido nenhum: 200 com array vazio
- Pedido cuja faixa foi apagada: a alçada exibida vem do snapshot, não da faixa
- Mais de 200 pedidos: a resposta é paginada por padrão em 50, com query page e perPage

**`GET /api/pedidos`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

*Query:* `situacao`: rascunho|pendente|aprovado|rejeitado, opcional, repetível · `obraId`: string cuid, opcional · `page`: int >= 1, padrão 1 · `perPage`: int 1..100, padrão 50

| status | resposta |
|---|---|
| 200 | { itens: [{ id, obra, fornecedor, dataPedido, qtdItens, totalCentavos, situacao, etapaAtual, podeDecidir }], total, page, perPage } |
| 403 | SEM_PERMISSAO |
| 422 | VALIDACAO — filtro inválido |

**Modelos:** Pedido, Etapa, Obra, Fornecedor · **Arquivos:** `app/api/pedidos/route.ts` · **Depende de:** `s5f2`

**Fora de escopo:** Busca por texto · Ordenação configurável

### s6f2 · Detalhe do pedido com a cadeia gravada

**Categoria:** `api_endpoint`

Cabeçalho, itens, cadeia do snapshot e histórico de decisões.

> Como auditor, quero ver a cadeia sob a qual o pedido foi submetido, mesmo que a regra tenha mudado depois.

**Steps:**

1. Escrever GET /api/pedidos/[id]
2. Devolver os itens com total por linha
3. Devolver a cadeia lida das etapas gravadas
4. Devolver o histórico com quem decidiu, quando e o motivo

**Acceptance criteria:**

- [ ] A cadeia devolvida vem das Etapa gravadas, NUNCA recalculada a partir da alçada vigente
- [ ] Editar a faixa da obra e reabrir o pedido devolve a cadeia original
- [ ] Apagar a faixa e reabrir o pedido devolve a cadeia original e a alçada do snapshot
- [ ] O histórico traz, por etapa decidida, usuário, situação, decididoEm e motivo
- [ ] Rejeição aparece no histórico com o motivo preenchido
- [ ] Rascunho de outro usuário responde 404

**Edge cases:**

- Pedido inexistente: 404
- Rascunho próprio: devolvido com cadeia vazia e sem histórico
- Pedido cuja faixa foi apagada: faixaId nulo, e o detalhe mostra o limite do snapshot

**`GET /api/pedidos/{id}`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | { id, obra, fornecedor, dataPedido, observacoes, situacao, totalCentavos, faixa: { limiteCentavos, semTeto }, itens: [...], cadeia: [{ ordem, usuario, situacao, decididoEm, motivo }], podeDecidir } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |

**Modelos:** Pedido, ItemPedido, Etapa · **Arquivos:** `app/api/pedidos/[id]/route.ts` · **Depende de:** `s6f1`

### s6f3 · Decisão por UPDATE condicional

**Categoria:** `api_endpoint`

Uma escrita condicionada ao estado que a autoriza. Zero linhas afetadas vira 409.

> Como aprovador, quero que decidir fora de ordem seja recusado pelo servidor, para que a ordem da alçada seja real.

**Steps:**

1. Escrever POST /api/pedidos/[id]/decisoes
2. Validar a decisão pelo domínio para obter a etapa alvo
3. Executar UPDATE condicionado a situacao pendente e todas as anteriores aprovadas
4. Traduzir zero linhas afetadas em 409
5. Atualizar a situação do pedido na mesma transação

**Acceptance criteria:**

- [ ] Como 2º aprovador, antes da decisão do 1º, POST responde 409 com código NAO_E_SUA_VEZ
- [ ] Dois POST concorrentes na mesma etapa, disparados com Promise.all, produzem exatamente um 200 e um 409
- [ ] Após a corrida, a etapa tem exatamente uma decisão registrada no banco
- [ ] Aprovar a última etapa muda a situacao do pedido para 'aprovado'
- [ ] Aprovar uma etapa intermediária mantém o pedido 'pendente' e libera a etapa seguinte
- [ ] Rejeitar qualquer etapa muda o pedido para 'rejeitado' e nenhuma etapa posterior se torna decidível
- [ ] Rejeitar sem motivo responde 422 com campos.motivo
- [ ] Motivo acima de 500 caracteres responde 422
- [ ] Decidir pedido já concluído responde 409 CADEIA_CONCLUIDA
- [ ] Decidir como quem não está na cadeia responde 409 NAO_E_SUA_VEZ
- [ ] Usuário com papel comprador ou visualizador responde 403 SEM_PERMISSAO
- [ ] O criador do pedido que também é o aprovador da vez PODE decidir: não há restrição de segregação de função

**Edge cases:**

- Duplo clique no mesmo botão: segundo pedido recebe 409, mesmo mecanismo da corrida
- Pedido em rascunho: 409 CADEIA_CONCLUIDA, porque não há cadeia
- Falha no meio da transação: rollback, sem etapa decidida e sem situacao alterada
- tipo de decisão fora de aprovar|rejeitar: 422

**`POST /api/pedidos/{id}/decisoes`** — auth: sessao + papel aprovador ou admin · timeout 8000ms · payload 1MB

*Body:* `tipo`: 'aprovar' | 'rejeitar' · `motivo`: string 3..500, obrigatório quando tipo = rejeitar

| status | resposta |
|---|---|
| 200 | { pedido: { id, situacao }, etapa: { ordem, situacao, decididoEm } } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |
| 409 | NAO_E_SUA_VEZ ou CADEIA_CONCLUIDA — inclui o caso de corrida perdida |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO — motivo ausente ou longo demais |

*Efeitos:* UPDATE condicional na Etapa · atualiza Pedido.situacao na mesma transação

**Modelos:** Etapa, Pedido · **Arquivos:** `app/api/pedidos/[id]/decisoes/route.ts` · **Depende de:** `s6f2`, `s2f5`

**Fora de escopo:** Aprovação em paralelo ou por quórum (fora de escopo no PRD) · Delegação (fora de escopo no PRD)

### s6f4 · Lista de aprovação com filtro padrão

**Categoria:** `frontend`

Lista com todas as colunas do enunciado, abrindo filtrada em 'aguardando minha decisão' para o aprovador.

> Como aprovador, quero abrir a tela já vendo minha fila, para decidir sem procurar.

**Steps:**

1. Tabela com identificador, obra, fornecedor, data, itens, total, situação, alçada atual e ações
2. Filtros por situação e obra
3. Para papel aprovador, aplicar por padrão o filtro 'aguardando minha decisão', removível
4. Rascunhos próprios atrás de filtro explícito

**Acceptance criteria:**

- [ ] A lista traz as nove colunas do enunciado
- [ ] Entrando como aprovador, a lista abre filtrada em 'aguardando minha decisão'
- [ ] O filtro padrão é removível em um clique, e removê-lo mostra todos os pedidos submetidos
- [ ] Entrando como Amanda e depois como João, a mesma URL mostra filas diferentes
- [ ] Nenhum rascunho de outro usuário aparece em nenhum filtro
- [ ] A alçada atual exibida vem do back-end, não é recalculada na tela
- [ ] A lista tem estado de carregando, vazio e erro com repetição

**Edge cases:**

- Nenhum pedido aguardando a decisão do aprovador: empty state dizendo que a fila está vazia, com a ação de ver todos
- Banco vazio: empty state apontando o seed
- API fora do ar: erro com botão de tentar de novo

**Modelos:** Pedido · **Arquivos:** `app/pedidos/page.tsx`, `src/ui/hooks/` · **Depende de:** `s6f1`

### s6f5 · Detalhe, cadeia desenhada e diálogo de rejeição

**Categoria:** `frontend`

Itens, histórico, cadeia com a etapa corrente destacada, e decisão indisponível sempre explicada.

> Como aprovador, quero entender por que não posso decidir, para não ficar diante de um botão apagado em silêncio.

**Steps:**

1. Detalhe com itens e histórico de decisões
2. Componente de cadeia com concluídas, atual destacada e próximas
3. Ações de aprovar e rejeitar
4. Diálogo de rejeição com motivo obrigatório
5. Explicação própria para cada estado de decisão indisponível

**Acceptance criteria:**

- [ ] A cadeia mostra etapas concluídas, a atual destacada e as próximas
- [ ] A cadeia empilha no vertical e permanece legível em 390px de largura
- [ ] Rejeitar sem preencher o motivo não envia: a validação barra antes do submit
- [ ] O diálogo prende o foco, fecha com Esc e devolve o foco ao gatilho
- [ ] Nenhum botão de decisão fica desabilitado sem explicação ao lado
- [ ] Cadeia concluída, não é a sua vez e papel sem permissão têm, cada um, mensagem própria
- [ ] Rejeição aparece no histórico com o motivo
- [ ] Após aprovar, a tela reflete a nova etapa atual sem recarregar a página

**Edge cases:**

- 409 vindo do servidor enquanto a tela achava que podia decidir: a tela mostra a explicação e recarrega o estado
- Pedido rejeitado aberto: ações ausentes, com o motivo em destaque
- Tela estreita de 390px: tabela de itens vira cartões

**Modelos:** Pedido, Etapa, ItemPedido · **Arquivos:** `app/pedidos/[id]/page.tsx`, `src/ui/componentes/` · **Depende de:** `s6f2`, `s6f3`

## Critérios de aceite da sprint

1. [`s6f1`] Sem filtro, a lista traz todos os pedidos submetidos de todas as obras
2. [`s6f1`] Rascunho de outro usuário NUNCA aparece na lista, para nenhum papel
3. [`s6f1`] Rascunho próprio aparece apenas quando o filtro de situação inclui 'rascunho'
4. [`s6f1`] Cada pedido traz identificador, obra, fornecedor, data, contagem de itens, total, situação e a etapa atual
5. [`s6f1`] Cada pedido traz podeDecidir booleano, verdadeiro só para o aprovador da vez com papel aprovador
6. [`s6f1`] Chamar como Amanda e como João devolve podeDecidir diferente para o mesmo pedido
7. [`s6f1`] Filtro por situacao inválida responde 422
8. [`s6f1`] Filtro por obra inexistente devolve lista vazia, não 404
9. [`s6f2`] A cadeia devolvida vem das Etapa gravadas, NUNCA recalculada a partir da alçada vigente
10. [`s6f2`] Editar a faixa da obra e reabrir o pedido devolve a cadeia original
11. [`s6f2`] Apagar a faixa e reabrir o pedido devolve a cadeia original e a alçada do snapshot
12. [`s6f2`] O histórico traz, por etapa decidida, usuário, situação, decididoEm e motivo
13. [`s6f2`] Rejeição aparece no histórico com o motivo preenchido
14. [`s6f2`] Rascunho de outro usuário responde 404
15. [`s6f3`] Como 2º aprovador, antes da decisão do 1º, POST responde 409 com código NAO_E_SUA_VEZ
16. [`s6f3`] Dois POST concorrentes na mesma etapa, disparados com Promise.all, produzem exatamente um 200 e um 409
17. [`s6f3`] Após a corrida, a etapa tem exatamente uma decisão registrada no banco
18. [`s6f3`] Aprovar a última etapa muda a situacao do pedido para 'aprovado'
19. [`s6f3`] Aprovar uma etapa intermediária mantém o pedido 'pendente' e libera a etapa seguinte
20. [`s6f3`] Rejeitar qualquer etapa muda o pedido para 'rejeitado' e nenhuma etapa posterior se torna decidível
21. [`s6f3`] Rejeitar sem motivo responde 422 com campos.motivo
22. [`s6f3`] Motivo acima de 500 caracteres responde 422
23. [`s6f3`] Decidir pedido já concluído responde 409 CADEIA_CONCLUIDA
24. [`s6f3`] Decidir como quem não está na cadeia responde 409 NAO_E_SUA_VEZ
25. [`s6f3`] Usuário com papel comprador ou visualizador responde 403 SEM_PERMISSAO
26. [`s6f3`] O criador do pedido que também é o aprovador da vez PODE decidir: não há restrição de segregação de função
27. [`s6f4`] A lista traz as nove colunas do enunciado
28. [`s6f4`] Entrando como aprovador, a lista abre filtrada em 'aguardando minha decisão'
29. [`s6f4`] O filtro padrão é removível em um clique, e removê-lo mostra todos os pedidos submetidos
30. [`s6f4`] Entrando como Amanda e depois como João, a mesma URL mostra filas diferentes
31. [`s6f4`] Nenhum rascunho de outro usuário aparece em nenhum filtro
32. [`s6f4`] A alçada atual exibida vem do back-end, não é recalculada na tela
33. [`s6f4`] A lista tem estado de carregando, vazio e erro com repetição
34. [`s6f5`] A cadeia mostra etapas concluídas, a atual destacada e as próximas
35. [`s6f5`] A cadeia empilha no vertical e permanece legível em 390px de largura
36. [`s6f5`] Rejeitar sem preencher o motivo não envia: a validação barra antes do submit
37. [`s6f5`] O diálogo prende o foco, fecha com Esc e devolve o foco ao gatilho
38. [`s6f5`] Nenhum botão de decisão fica desabilitado sem explicação ao lado
39. [`s6f5`] Cadeia concluída, não é a sua vez e papel sem permissão têm, cada um, mensagem própria
40. [`s6f5`] Rejeição aparece no histórico com o motivo
41. [`s6f5`] Após aprovar, a tela reflete a nova etapa atual sem recarregar a página

## Definition of done

- [ ] Amanda e João veem filas diferentes na mesma lista
- [ ] Aprovar como Amanda libera a decisão do João
- [ ] Dois POST concorrentes produzem um 200 e um 409, verificado por script
- [ ] Rejeição exige motivo e encerra o pedido
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.