# INC1.7 · Configurar Vitest em dois projetos

Prioridade: High · Código: `vitest.config.ts` (a escrever)

## Problem Statement

Testes de domínio rodam em milissegundos e em paralelo; testes de API precisam de banco, rodam em
série e levam segundos. Misturados numa configuração só, os dois adotam o pior dos dois: o
domínio herda o setup de banco e deixa de ser barato, e deixar de ser barato é deixar de ser
rodado.

## Solution

Dois projetos Vitest na mesma configuração. `dominio` sem setup, em paralelo. `api` em série,
com banco de teste — declarado agora, usado a partir do EXTRA2.

## User Stories

1. Como desenvolvedora, quero `npm test` rodando o domínio em segundos, para que eu rode a suíte a cada salvamento.
2. Como desenvolvedora, quero o projeto de API em série, para que casos que apagam tabelas não disputem o mesmo banco.
3. Como desenvolvedora, quero rodar só um dos projetos, para que o ciclo curto não espere o longo.
4. Como desenvolvedora, quero o banco de teste separado do de desenvolvimento, para que rodar testes não apague meu seed.

## Implementation Decisions

- `vitest.config.ts` com dois projetos: `dominio` (`src/domain/**/*.test.ts`, sem setup, paralelo) e `api` (`tests/api/**/*.test.ts`, `fileParallelism: false`, setup com reset de banco).
- O projeto `api` é **declarado agora e exercitado no EXTRA2**. Declará-lo aqui custa dez linhas e evita que, quando o seam de handler chegar, a configuração vire parte do custo dele.
- `.env.test` com `DATABASE_URL="file:./prisma/test.db"`, e `prisma/test.db` no `.gitignore`.
- Sem cobertura configurada: a métrica aqui mediria o que foi executado, não o que foi verificado, e o tempo gasto em persegui-la rende mais nos casos de limite.

## Testing Decisions

A configuração é verificada rodando-a: `npm test` executa o projeto de domínio verde; `npm test --project api` executa zero casos sem erro de configuração.

## Subtasks

1. Instalar `vitest` e fixar a versão.
2. Escrever `vitest.config.ts` com os dois projetos.
3. Criar `.env.test` e adicionar `prisma/test.db` ao `.gitignore`.
4. Declarar os scripts `test` e `test:watch` no `package.json`.

## Out of Scope

O setup de reset e as fábricas de dados (EXTRA2). Testes de componente ou de navegador — não há
seam de interface neste projeto.
