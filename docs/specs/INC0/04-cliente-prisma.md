# INC0.4 · Cliente Prisma com driver adapter e singleton

Prioridade: Highest · Épico: INC0 · Esqueleto · Label: dia-29

## Problem Statement

Prisma 7 não inicializa sem `prisma.config.ts` e driver adapter — descobrir isso no meio do INC3
custa tempo que não existe. E instanciar o cliente a cada import faz o recarregamento a quente do
Next abrir uma conexão por salvamento, até o SQLite recusar.

## Solution

Um módulo único em `src/db/prisma.ts` que exporta um cliente memoizado em `globalThis` fora de
produção, com o adapter `better-sqlite3` configurado em `prisma.config.ts`.

## User Stories

1. Como desenvolvedora, quero um único lugar de onde o cliente vem, para que trocar configuração seja uma edição e não uma varredura.
2. Como desenvolvedora, quero o cliente memoizado em desenvolvimento, para que uma tarde de HMR não esgote as conexões.
3. Como desenvolvedora, quero o adapter configurado desde já, para que o Prisma 7 não me surpreenda quando a primeira rota precisar escrever.
4. Como desenvolvedora, quero que `src/db/` seja a única fronteira com o banco, para que o seam de handler do INC5 saiba exatamente o que substituir.
5. Como avaliador, quero ver uma página server-side lendo do banco, para que a integração esteja provada e não afirmada.

## Implementation Decisions

- `prisma.config.ts` na raiz, declarando o adapter `@prisma/adapter-better-sqlite3` e a URL do datasource.
- `src/db/prisma.ts` exporta uma instância única, guardada em `globalThis` quando `NODE_ENV !== 'production'`.
- Prisma pinado em `7.10.1`. O dist-tag `latest` aponta para release candidate.
- Nenhum outro arquivo instancia `PrismaClient`. Todo acesso a dados importa deste módulo.

## Testing Decisions

Verificação por execução: uma página server-side lê e renderiza dado do banco. Se o cliente
estiver mal configurado, a página não responde — o teste é o render.

O singleton em si não é testado: afirmar que duas chamadas devolvem a mesma referência testa a
implementação, não o comportamento. O sintoma real — esgotamento de conexão sob HMR — não cabe em
teste automatizado e é observado em uso.

A decisão com valor para teste é a fronteira: com todo acesso passando por `src/db/`, o seam de
handler do INC5 tem um ponto único de isolamento.

## Subtasks

1. Pinar `prisma` e `@prisma/client` em 7.10.1 e instalar `@prisma/adapter-better-sqlite3`.
2. Criar `prisma.config.ts` com o adapter e a URL do datasource.
3. Escrever `src/db/prisma.ts` com a memoização em `globalThis` fora de produção.
4. Fazer `app/page.tsx` ler as obras por esse cliente e renderizá-las.
5. Conferir que nenhum outro arquivo instancia `PrismaClient`.

## Out of Scope

Banco de teste e limpeza entre casos (EXTRA2). Transações (INC4 e INC5). Qualquer repositório ou
camada de abstração sobre o Prisma — as rotas consultam direto.
