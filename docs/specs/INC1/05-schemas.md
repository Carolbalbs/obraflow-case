# INC1.5 · schemas.ts — um Zod por operação

Prioridade: High · Código: `src/domain/schemas.ts` (a escrever — depende de instalar `zod`)

## Problem Statement

O rascunho é incompleto por natureza; o pedido submetido é estrito. Um schema só para os dois
obriga a marcar tudo como opcional, e então a submissão deixa de ser validada por alguém —
sobrando para a rota, onde a regra vira `if` espalhado.

E se servidor e formulário validarem por meios diferentes, eles divergem: a tela aceita o que a
rota recusa, e o usuário descobre no envio.

## Solution

Um schema por operação, no domínio, importado pelas duas pontas. Rascunho permissivo e submissão
estrita são schemas diferentes, e a diferença entre eles é a definição de "completo".

## User Stories

1. Como compradora, quero salvar um rascunho com campos vazios, para que eu possa voltar depois.
2. Como compradora, quero que a submissão recuse um pedido sem itens, para que nada vá para aprovação vazio.
3. Como compradora, quero o erro ancorado no campo certo, para que eu não procure o que corrigir.
4. Como compradora, quero que a tela recuse o que a rota recusaria, para que eu não descubra no envio.
5. Como desenvolvedora, quero o schema fora de `app/`, para que o teste de domínio possa usá-lo.

## Implementation Decisions

- `zod` instalado como dependência do domínio. É a única dependência externa do bloco, e fica isolada neste módulo: os demais permanecem sem dependência nenhuma, que é o que os mantém baratos de testar.
- Schemas separados: `rascunhoSchema` (campos opcionais, itens possivelmente vazios) e `submissaoSchema` (obra, fornecedor, data e ao menos um item, cada item completo e com quantidade e preço positivos).
- Os schemas produzem `CamposComErro` do módulo `erros`, não o formato nativo do Zod — a borda e a tela consomem o formato do domínio, e trocar de biblioteca de validação não vaza para elas.
- A coerção de dinheiro e quantidade usa `Dinheiro.deEntrada` e `Quantidade.deEntrada`, não um parser próprio do Zod: duas leituras do mesmo texto divergiriam.

## Testing Decisions

Seam de função pura. Os casos: rascunho com tudo vazio aceito; submissão sem itens recusada;
submissão com item de quantidade zero recusada; erro ancorado no índice do item errado;
entrada monetária em formato brasileiro atravessando o schema corretamente.

## Subtasks

1. Instalar `zod` e fixar a versão.
2. Escrever `rascunhoSchema` permissivo.
3. Escrever `submissaoSchema` estrito, exigindo ao menos um item completo.
4. Escrever o adaptador do erro do Zod para `CamposComErro`.
5. Ligar a coerção de dinheiro e quantidade aos parsers do domínio.

## Out of Scope

Schemas de faixa (INC3) e de decisão (INC5) — cada um entra com a sua operação. Validação na tela
(INC6), que consome este módulo.
