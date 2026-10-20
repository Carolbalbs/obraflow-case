# INC1.2 · alcada.ts — resolverFaixa

Prioridade: Highest · Código: `src/domain/alcada.ts` (113 linhas)

## Problem Statement

Qual faixa se aplica a um total é a pergunta central do produto, e tem três respostas erradas
populares: tratar o limite como exclusivo, não prever obra sem faixa, e não prever total acima do
teto mais alto quando a obra não tem faixa aberta.

## Solution

Uma função que recebe a alçada da obra e o total, e devolve a faixa ou uma recusa explicada.
Limite superior inclusivo, faixa aberta cobrindo o resto, ordenação derivada do limite.

## User Stories

1. Como compradora, quero que R$ 10.000,00 exato caia na faixa "até R$ 10.000,00", para que o limite anunciado seja o praticado.
2. Como compradora, quero que R$ 10.000,01 suba de faixa, para que o centavo a mais mude o aprovador como prometido.
3. Como administradora, quero uma faixa sem teto cobrindo todo valor acima, para que não exista pedido alto demais.
4. Como compradora, quero ser avisada quando meu total não cai em faixa nenhuma, para que eu saiba por que não consigo submeter.
5. Como compradora, quero que a mensagem diga qual é o teto excedido, para que eu saiba o tamanho do problema.
6. Como administradora, quero que uma faixa sem aprovador não seja aplicável, para que nenhum pedido seja aprovado sem ninguém assinar.

## Implementation Decisions

- `comporta(faixa, total)` isola a inclusividade numa linha com nome. É a parte da regra que mais erra na prática.
- `faixasOrdenadas` deriva a ordem do limite, com a faixa aberta por último. Não há coluna de ordem: ela poderia divergir do limite, e então duas fontes diriam coisas diferentes sobre a mesma regra.
- Três caminhos para `SEM_REGRA_APLICAVEL`, com mensagens distintas: obra sem faixas, teto estourado (citando o valor), faixa aplicável sem aprovador.
- Devolve `Resultado`, não exceção: a recusa é caso previsto e quem chama precisa tratá-la como tal.
- `temFaixaAbertaDuplicada` existe para o INC3 recusar a segunda faixa aberta na escrita, não na leitura.

## Testing Decisions

Seam de função pura, sem banco. Os casos: valor exato no limite; um centavo acima; teto estourado;
obra sem faixas; faixa sem aprovador; faixa aberta absorvendo valor alto; faixas fora de ordem na
entrada resolvendo corretamente.

O teste monta a alçada no corpo do caso, com as faixas **fora de ordem** de propósito — fixture
pré-ordenada esconderia o bug de ordenação.

## Subtasks

1. Declarar `Aprovador`, `Faixa` e `Alcada` com limite nulável e sem limite inferior.
2. Implementar `comporta` com o limite inclusivo.
3. Implementar `faixasOrdenadas`, com a faixa aberta por último.
4. Implementar `resolverFaixa` com os três caminhos de recusa e suas mensagens.
5. Implementar `temFaixaAbertaDuplicada` para uso do INC3.

## Out of Scope

Persistir ou editar faixas (INC3). Montar a cadeia (INC1.3). Simular a cadeia ao vivo (EXTRA1).
