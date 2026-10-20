# INC0.5 · Seed mínimo e scripts npm

Prioridade: High · Épico: INC0 · Esqueleto · Label: dia-29

## Problem Statement

Banco vazio não prova nada, e repovoá-lo à mão a cada reset transforma uma operação de segundos
num motivo para evitar o reset — e trabalhar sobre dado sujo.

## Solution

Um seed mínimo com três obras e os scripts `seed` e `db:reset`. O seed imprime o que inseriu.

## User Stories

1. Como desenvolvedora, quero `npm run seed` populando o banco, para que a primeira página tenha o que mostrar.
2. Como desenvolvedora, quero `npm run db:reset` voltando ao estado limpo, para que experimentar não seja arriscado.
3. Como desenvolvedora, quero o seed imprimindo a contagem do que inseriu, para que sucesso seja visível e não presumido.
4. Como desenvolvedora, quero o seed idempotente por reset, para que rodá-lo duas vezes não crie obras duplicadas.
5. Como avaliador, quero chegar a dado visível com um comando, para que avaliar não dependa de cadastrar coisas antes.

## Implementation Decisions

- `prisma/seed.ts` executado por `tsx`. Três obras com nome e cidade.
- `db:reset` é `prisma migrate reset --force`, que recria o schema e dispara o seed.
- O seed assume banco limpo: o reset é quem garante a idempotência, não lógica de upsert. Upsert aqui esconderia divergência entre schema e dado.
- A saída imprime a contagem por entidade inserida.

## Testing Decisions

Verificação por execução: `npm run seed` imprime a contagem, e a página renderiza as obras. Teste
de seed afirmaria o conteúdo do próprio seed.

Este arquivo é o embrião do seed completo do INC7 — oito pedidos posicionados em cada ponto do
ciclo — e, a partir do EXTRA2, das fábricas de dados de teste. As fábricas não vão reusar o seed:
cada caso monta só o que precisa, porque fixture compartilhada acopla testes entre si.

## Subtasks

1. Escrever `prisma/seed.ts` inserindo três obras.
2. Imprimir a contagem por entidade ao final.
3. Declarar os scripts `seed` e `db:reset` no `package.json`.
4. Rodar `db:reset` seguido de `seed` e conferir a página.

## Out of Scope

Usuários, fornecedores, faixas e pedidos — entram no seed completo do INC7. Fábricas de dados de
teste (EXTRA2).
