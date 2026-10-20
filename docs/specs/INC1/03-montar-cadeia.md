# INC1.3 · cadeia.ts — montarCadeia e leitura do snapshot

Prioridade: Highest · Código: `src/domain/cadeia.ts` (77 linhas)

## Problem Statement

Se a cadeia for derivada da regra a cada leitura, trocar o aprovador de uma faixa remove do fluxo
alguém que já decidiu: o histórico passa a contradizer o que de fato aconteceu, e a trilha
auditável — razão de existir do Dokimos — deixa de valer.

## Solution

A cadeia é montada uma única vez, na submissão, a partir da faixa resolvida, e gravada no pedido.
Este módulo monta e lê; não resolve faixa e não conhece a alçada.

## User Stories

1. Como auditor, quero que a cadeia gravada não mude quando a alçada da obra for editada, para que o histórico não seja reescrito.
2. Como aprovador, quero a cadeia na ordem definida na faixa, para que a hierarquia desenhada seja a exercida.
3. Como aprovador, quero ver qual etapa é a atual, para que eu saiba se a decisão é minha.
4. Como compradora, quero ver as etapas já concluídas com quem decidiu, para que o andamento seja visível.
5. Como aprovador, quero que uma cadeia rejeitada não tenha aprovador da vez, para que ninguém seja convidado a decidir o que terminou.

## Implementation Decisions

- **Nenhuma função deste módulo recebe `Alcada`.** É o ADR 0001 como impossibilidade estrutural: sem acesso à regra vigente, recalcular na leitura não é uma tentação, é um erro de compilação.
- `montarCadeia` roda na submissão e não na criação do rascunho: rascunho tem total provisório, e a cadeia derivada dele seria derivada de um valor que ainda vai mudar.
- A ordem é reindexada de 0 a partir da ordem dos aprovadores na faixa, de modo que buraco na numeração da faixa não vire buraco na cadeia.
- `foiRejeitada` basta uma etapa: rejeição encerra o pedido inteiro.
- `historico` filtra as etapas já decididas; não há tabela de decisões, o histórico é a leitura ordenada das etapas.

## Testing Decisions

Seam de função pura. Os casos: ordem preservada; ordem reindexada a partir de ordens não
contíguas; aprovador da vez na cadeia nova; a vez avançando após aprovação; cadeia rejeitada sem
aprovador da vez; `estaConcluida` para aprovada e para rejeitada; histórico contendo só as
decididas.

A invariante mais valiosa — editar a faixa não altera o pedido submetido — **não é testável neste
seam**, porque envolve persistência. Ela é um caso do seam de Route Handler no INC5, e o seed do
INC7 traz um pedido nessa condição para a prova visual.

## Subtasks

1. Declarar `Etapa` e `Cadeia` sem referência a `Faixa` ou `Alcada` além do argumento de montagem.
2. Implementar `montarCadeia` com reindexação da ordem.
3. Implementar `aprovadorDaVez`, devolvendo `null` em cadeia concluída.
4. Implementar `foiRejeitada`, `foiAprovada` e `estaConcluida`.
5. Implementar `historico`.

## Out of Scope

Gravar a cadeia (INC4). Validar quem pode decidir (INC1.4). Desenhar a cadeia na tela (INC5).
