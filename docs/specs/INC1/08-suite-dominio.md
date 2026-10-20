# INC1.8 · Suíte do domínio: 12 a 18 casos

Prioridade: Highest · Código: `src/domain/*.test.ts` (a escrever — 23 casos já verificados)

## Problem Statement

A regra de alçada é o que a avaliação pesa, e é verificável por inspeção apenas até o terceiro
caso de limite. Sem suíte, cada refatoração dos próximos três dias passa a ser uma aposta.

## Solution

Uma suíte no seam de domínio cobrindo os casos em que a regra erra na prática. Roda sem banco e
sem servidor, em milissegundos.

## User Stories

1. Como desenvolvedora, quero a suíte verde antes de começar as telas, para que um defeito de tela não se confunda com defeito de regra.
2. Como desenvolvedora, quero rodar a suíte a cada salvamento, para que o retorno seja imediato.
3. Como avaliadora, quero ver os casos de limite escritos, para que a regra esteja demonstrada e não afirmada.
4. Como desenvolvedora, quero cada caso montando seus próprios dados, para que um caso não quebre por causa de outro.

## Implementation Decisions

- Os casos cobrem o que já foi verificado contra a implementação atual, agrupados por módulo: dinheiro (6), alçada (7), cadeia (5), decisão (5).
- Arranjo explícito no corpo de cada caso. Sem fábrica compartilhada e sem `beforeEach` montando estado: fixture comum acopla casos, e um caso que quebra por causa de outro ensina a ignorar a suíte.
- Nas alçadas de teste, as faixas entram **fora de ordem** de propósito — entrada pré-ordenada esconderia o defeito de ordenação.
- Os casos afirmam o **código** da recusa, nunca o texto da mensagem.
- Sem mock: nenhum módulo do domínio tem dependência para simular, e essa ausência é o ponto.

## Testing Decisions

Esta task **é** a decisão de teste do bloco. O que ela não cobre, deliberadamente: duas decisões
simultâneas (precisa de escrita concorrente, vai para o seam de handler no INC5); editar a faixa
sem alterar o pedido submetido (precisa de persistência, idem); 403 por papel (a matriz é do
INC2).

Prior art: nenhuma. Esta suíte é a forma que as demais seguem.

## Subtasks

1. `dinheiro.test.ts` — três formatos de entrada, entrada inválida, arredondamento de 2,5 × R$ 3,33, quantidade fracionária, precisão excedente.
2. `alcada.test.ts` — limite exato, um centavo acima, teto estourado, obra sem faixa, faixa sem aprovador, faixa aberta, faixas fora de ordem.
3. `cadeia.test.ts` — ordem preservada, ordem reindexada, aprovador da vez, vez avançando, cadeia rejeitada sem vez.
4. `decisao.test.ts` — fora de ordem, fora da cadeia, após conclusão, rejeição sem motivo, aprovação final.
5. Rodar `npm test` e fechar o bloco verde.

## Out of Scope

Testes de rota (INC5 e EXTRA2). Cobertura como métrica. Testes de interface.
