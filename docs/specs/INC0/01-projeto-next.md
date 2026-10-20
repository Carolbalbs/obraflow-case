# INC0.1 · Gerar projeto Next 16 com TypeScript, Tailwind v4 e App Router

Prioridade: Highest · Épico: INC0 · Esqueleto · Label: dia-29

## Problem Statement

Não há aplicação. O fork contém o material original do case — incluindo `site/`, que é referência
visual e não código de produção — e nada que execute.

## Solution

Um projeto Next com App Router e TypeScript ocupando a raiz do fork, convivendo com `site/` sem
tocá-lo. Sobe com `npm run dev` e serve uma página.

## User Stories

1. Como desenvolvedora, quero o projeto na raiz e não em subpasta, para que o fork continue sendo um repositório só e o avaliador não precise navegar para achar o código.
2. Como desenvolvedora, quero `site/` preservado byte a byte, para que a comparação entre o desenho original e a implementação continue possível.
3. Como desenvolvedora, quero App Router e não Pages Router, para que `app/api/*` seja o lugar natural das rotas do ADR 0003.
4. Como desenvolvedora, quero TypeScript com `strict` ligado, para que `null` e `undefined` sejam erros de compilação e não surpresas em tela.
5. Como desenvolvedora, quero ESLint configurado com `eslint-config-next`, para que import inválido e hook mal usado apareçam antes do commit.
6. Como desenvolvedora, quero o console limpo ao subir, para que todo aviso futuro signifique algo.

## Implementation Decisions

- `create-next-app` com TypeScript, App Router, sem `src-dir`. Tailwind v4 via `@tailwindcss/turbopack`.
- `app/` contém rotas e telas. `src/` é reservado para o que não é Next — `src/domain/`, `src/server/`, `src/db/`. A separação não é estética: é o que mantém o domínio importável por teste sem framework.
- `tsconfig.json` com `strict: true` e alias `@/*` apontando para a raiz.
- `site/` fica fora do `tsconfig` e do lint: é material de referência, não fonte compilável.

## Testing Decisions

Verificação operacional, sem asserção automatizada: `npm run dev` sobe e a página responde sem
erro nem aviso no console do servidor e do navegador. Testar o scaffold seria testar o Next.

A decisão que importa para teste futuro é estrutural: nada em `src/domain/` pode importar
`next/*`. Isso não é verificável agora — passa a ser no INC1, quando a suíte de domínio roda sem
o framework.

## Subtasks

1. Rodar `create-next-app` com TypeScript, App Router e sem `src-dir`, na raiz do fork.
2. Conferir que `site/` permaneceu intocado e adicioná-lo às exclusões de `tsconfig.json` e do ESLint.
3. Ligar `strict` no `tsconfig.json` e configurar o alias `@/*`.
4. Criar os diretórios `src/domain/`, `src/server/` e `src/db/` com um `README` de uma linha cada, declarando o que entra e o que não entra.
5. Subir `npm run dev` e zerar todo aviso de console remanescente.

## Out of Scope

Tema e tokens (INC0.2). Qualquer acesso a banco (INC0.3 e INC0.4). Qualquer tela de verdade.
