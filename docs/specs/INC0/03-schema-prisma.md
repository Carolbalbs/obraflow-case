# INC0.3 · Schema Prisma completo e primeira migration

Prioridade: Highest · Épico: INC0 · Esqueleto · Label: dia-29

## Problem Statement

É o trabalho mais caro de refazer de todo o case. Um erro de modelagem aqui — dinheiro em float,
cadeia derivada em vez de gravada, decisão em tabela separada — só aparece no INC4 ou INC5, e
corrigi-lo tarde obriga a mexer em migration, seed e domínio no mesmo movimento, com um dia e meio
de prazo restante.

## Solution

Os oito modelos de uma vez, com as três decisões estruturais já embutidas: dinheiro e quantidade
inteiros, snapshot da faixa como coluna do pedido, decisão como campo da etapa. Uma única
migration inicial.

## User Stories

1. Como desenvolvedora, quero o schema completo antes do domínio, para que o INC1 seja escrito contra tabelas reais.
2. Como aprovador, quero que o total do pedido que eu aprovo seja exatamente o que foi somado, para que não exista centavo nascido de arredondamento binário.
3. Como desenvolvedora, quero quantidade em milésimos, para que 2,5 kg seja 2500 e o total de item permaneça aritmética inteira.
4. Como auditor do processo, quero que o pedido guarde a faixa sob a qual foi submetido, para que editar a alçada da obra não reescreva a história de pedidos em andamento.
5. Como auditor, quero que apagar uma faixa não apague o registro do pedido que a usou, para que a trilha sobreviva à manutenção da regra.
6. Como desenvolvedora, quero a decisão dentro da própria etapa, para que o UPDATE condicional do ADR 0004 tenha um alvo único.
7. Como desenvolvedora, quero `@@unique([pedidoId, ordem])` em etapa e item, para que duas posições iguais sejam impossíveis por construção.
8. Como usuário, quero citar o pedido como "#1002", para que o identificador seja falável em voz alta.
9. Como desenvolvedora, quero que apagar uma obra apague suas faixas mas seja recusado se houver pedido, para que limpeza não vire perda de histórico.

## Implementation Decisions

- Oito modelos: `Usuario`, `Obra`, `Fornecedor`, `Faixa`, `FaixaAprovador`, `Pedido`, `ItemPedido`, `Etapa`.
- Dinheiro em `Int` de centavos; quantidade em `Int` de milésimos. `ItemPedido.totalCentavos` é persistido e calculado no domínio como `round(quantidadeMilesimos * precoUnitarioCentavos / 1000)`.
- SQLite não suporta enum no Prisma: `papel`, `Pedido.situacao` e `Etapa.situacao` são `String`, com a lista fechada vivendo em `src/domain/`.
- `Faixa.limiteCentavos` é `Int?`, inclusivo; nulo é faixa aberta. Não existe coluna de mínimo (ADR 0002).
- `Pedido` carrega `faixaId` (`onDelete: SetNull`), `faixaLimiteCentavos` e `faixaSemTeto` — o snapshot sobrevive à exclusão da faixa (ADR 0001).
- `Etapa` carrega `situacao`, `decididoEm` e `motivo`. Não há tabela de decisões: o histórico é a leitura ordenada das etapas.
- `Pedido.id` é `Int` autoincremento; as demais entidades usam cuid.
- `Cascade` em faixa→aprovadores, obra→faixas, pedido→itens, pedido→etapas. `Restrict` em usuário que decidiu, obra com pedido e fornecedor com pedido.
- Índices: `Faixa[obraId, limiteCentavos]` para a resolução ordenada; `Pedido[situacao, obraId]` para os filtros do INC5; `Etapa[usuarioId, situacao]` para a fila do aprovador.

## Testing Decisions

A migration é verificada aplicando-a: `prisma migrate dev` roda limpo contra banco vazio. Não há
asserção automatizada sobre o schema — ela repetiria a declaração.

As invariantes que o schema impõe (unicidade de ordem, recusa de exclusão por `Restrict`,
anulação do `faixaId` preservando o snapshot) são **comportamento do sistema** e serão exercitadas
no seam de Route Handler do INC5, não aqui. É ali que "apagar a faixa e reabrir o pedido" vira um
caso com asserção.

## Subtasks

1. Modelar `Usuario`, `Obra` e `Fornecedor` com as relações e os `onDelete`.
2. Modelar `Faixa` e `FaixaAprovador` com limite superior nulável, `@@unique([faixaId, ordem])` e `@@unique([faixaId, usuarioId])`.
3. Modelar `Pedido` com identificador inteiro, situação, total e as três colunas de snapshot da faixa.
4. Modelar `ItemPedido` com quantidade em milésimos, preço e total em centavos, e ordem única por pedido.
5. Modelar `Etapa` com ordem única por pedido, situação, decidido em e motivo.
6. Declarar os três índices de consulta.
7. Gerar e aplicar a migration inicial contra banco vazio.

## Out of Scope

Validação dos campos de domínio fechado (INC1, em `src/domain/`). Qualquer consulta. O seed
(INC0.5). Banco de teste separado (EXTRA2).
