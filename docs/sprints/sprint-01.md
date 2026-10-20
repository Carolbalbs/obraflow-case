# Sprint 1 · Fundação

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/01-fundacao.json`](../spec/01-fundacao.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-fundacao`

**Estado:** concluida

**Entregável:** npm run dev mostra uma página listando as obras do seed, com a tipografia e a cor de marca do ObraFlow.

**Risco:** baixo · **Pré-requisito:** nenhum · **Stack permitida:** `next`, `react`, `typescript`, `tailwind`, `prisma`, `sqlite`, `tsx`

## Escopo

Projeto Next que sobe, lê do banco e mostra na tela, com todas as decisões estruturais já gravadas no schema.

- **s1f1** — Projeto Next com App Router: Aplicação na raiz do fork, sem src-dir, convivendo com site/ intocado.
- **s1f2** — Tema com os tokens do ObraFlow: Rampa de marca, rampa neutra, superfícies e fontes Inter/Lora iguais a site/assets/css/obraflow.css.
- **s1f3** — Schema completo e migration inicial: Oito modelos de uma vez, com dinheiro em centavos, quantidade em milésimos e snapshot da faixa no pedido.
- **s1f4** — Cliente Prisma singleton com adapter: Prisma 7 exige prisma.config.ts e driver adapter; singleton para o HMR não abrir conexão por recarga.
- **s1f5** — Seed mínimo e scripts npm: Três obras, os usuários dos quatro papéis, os fornecedores e os scripts seed e db:reset, com contagem impressa.

## Fora do escopo

- Qualquer tela de produto
- Qualquer rota de API
- Modo escuro
- Responsividade (Sprint 7)
- Validação dos campos de domínio fechado (Sprint 2)
- Qualquer consulta
- Banco de teste (extra E2)
- Transações (Sprints 5 e 6)
- Seed completo com as faixas e os oito pedidos posicionados (Sprint 8)

## Regras do agente

- Nenhuma decisão de produto: o que não estiver na SPEC, pergunte em vez de inventar.
- Migration é única e inicial; schema novo depois disso é sinal de decisão fora de hora.
- Dinheiro em centavos Int e quantidade em milésimos Int, sem exceção.
- Entrega com npx tsc --noEmit limpo.

**Modelos tocados:** Etapa, Faixa, FaixaAprovador, Fornecedor, ItemPedido, Obra, Pedido, Usuario

## Features

### s1f1 · Projeto Next com App Router

**Categoria:** `estrutura`

Aplicação na raiz do fork, sem src-dir, convivendo com site/ intocado.

> Como desenvolvedora, quero clonar e rodar um comando, para que começar não dependa de conhecimento não escrito.

**Steps:**

1. Rodar create-next-app com TypeScript, App Router e sem src-dir
2. Excluir site/ do tsconfig e do ESLint
3. Ligar strict no tsconfig e o alias @/*
4. Criar src/domain, src/server e src/db
5. Zerar avisos de console em npm run dev

**Acceptance criteria:**

- [ ] npm run dev sobe e responde em http://localhost:3000 sem erro no console do servidor
- [ ] npx tsc --noEmit termina com código 0
- [ ] npm run lint termina sem erro
- [ ] O diretório site/ não foi modificado: git diff em site/ é vazio
- [ ] tsconfig.json tem strict igual a true

**Edge cases:**

- Node em versão abaixo da exigida: falhar no start com a versão esperada e a encontrada
- Porta 3000 ocupada: Next sobe em 3001 e imprime a porta usada

**Arquivos:** `app/layout.tsx`, `app/page.tsx`, `tsconfig.json`, `eslint.config.mjs`

**Fora de escopo:** Qualquer tela de produto · Qualquer rota de API

### s1f2 · Tema com os tokens do ObraFlow

**Categoria:** `estrutura`

Rampa de marca, rampa neutra, superfícies e fontes Inter/Lora iguais a site/assets/css/obraflow.css.

> Como avaliador, quero reconhecer o ObraFlow na primeira tela, para que a entrega não pareça um template genérico.

**Steps:**

1. Extrair as rampas e superfícies de site/assets/css/obraflow.css
2. Declarar o bloco @theme em app/globals.css
3. Carregar Inter e Lora por next/font ligadas aos tokens
4. Aplicar os tokens no layout
5. Renderizar um eyebrow em Lora itálico

**Acceptance criteria:**

- [ ] Os valores de cor em @theme são idênticos aos de site/assets/css/obraflow.css
- [ ] Nenhum componente usa cor arbitrária: grep por 'text-[#' e 'bg-[#' em app/ e src/ não retorna nada
- [ ] O eyebrow renderiza em Lora itálico
- [ ] body tem cor de fundo explícita vinda de token

**Edge cases:**

- Fonte do Google indisponível no build: next/font usa o fallback local sem quebrar o build

**Arquivos:** `app/globals.css`, `app/layout.tsx` · **Depende de:** `s1f1`

**Fora de escopo:** Modo escuro · Responsividade (Sprint 7)

### s1f3 · Schema completo e migration inicial

**Categoria:** `database`

Oito modelos de uma vez, com dinheiro em centavos, quantidade em milésimos e snapshot da faixa no pedido.

> Como desenvolvedora, quero o schema completo antes do domínio, para que a regra seja escrita contra tabelas reais.

**Steps:**

1. Modelar Usuario, Obra e Fornecedor com os on_delete
2. Modelar Faixa e FaixaAprovador com limite nulável e as duas unicidades
3. Modelar Pedido com id inteiro e as três colunas de snapshot
4. Modelar ItemPedido e Etapa com ordem única por pedido
5. Declarar os três índices
6. Gerar e aplicar a migration inicial

**Acceptance criteria:**

- [ ] prisma migrate dev aplica contra banco vazio sem erro
- [ ] Nenhum campo do schema é Float ou Decimal: grep por 'Float' e 'Decimal' em schema.prisma não retorna nada
- [ ] Pedido.faixaId tem onDelete SetNull e as colunas faixaLimiteCentavos e faixaSemTeto existem
- [ ] Etapa e ItemPedido têm @@unique([pedidoId, ordem])
- [ ] Pedido.id é Int com autoincrement

**Edge cases:**

- Banco já existente com schema divergente: migrate reset recria do zero
- Tentar apagar Usuario com etapa decidida: Prisma recusa por restrict

**Modelos:** Usuario, Obra, Fornecedor, Faixa, FaixaAprovador, Pedido, ItemPedido, Etapa · **Arquivos:** `prisma/schema.prisma`, `prisma/migrations/` · **Depende de:** `s1f1`

**Fora de escopo:** Validação dos campos de domínio fechado (Sprint 2) · Qualquer consulta

### s1f4 · Cliente Prisma singleton com adapter

**Categoria:** `database`

Prisma 7 exige prisma.config.ts e driver adapter; singleton para o HMR não abrir conexão por recarga.

> Como desenvolvedora, quero um único lugar de onde o cliente vem, para que trocar configuração seja uma edição.

**Steps:**

1. Pinar prisma e @prisma/client em 7.10.1
2. Criar prisma.config.ts com o adapter better-sqlite3
3. Escrever src/db/prisma.ts com memoização em globalThis fora de produção
4. Fazer app/page.tsx ler as obras por esse cliente

**Acceptance criteria:**

- [ ] package.json pina prisma e @prisma/client na versão exata 7.10.1, sem ^ ou ~
- [ ] Nenhum arquivo além de src/db/prisma.ts instancia PrismaClient
- [ ] A página inicial renderiza as obras vindas do banco

**Edge cases:**

- DATABASE_URL ausente: falhar no start com mensagem nomeando a variável
- Arquivo de banco inexistente: migrate cria; a aplicação não cria silenciosamente

**Modelos:** Obra · **Arquivos:** `prisma.config.ts`, `src/db/prisma.ts`, `app/page.tsx` · **Depende de:** `s1f3`

**Fora de escopo:** Banco de teste (extra E2) · Transações (Sprints 5 e 6)

### s1f5 · Seed mínimo e scripts npm

**Categoria:** `build`

Três obras, os usuários dos quatro papéis, os fornecedores e os scripts seed e db:reset, com contagem impressa.

> Como desenvolvedora, quero voltar ao estado limpo com um comando, para que experimentar não seja arriscado.

**Steps:**

1. Escrever prisma/seed.ts inserindo três obras
2. Inserir os fornecedores sem os quais nenhum pedido chega a ser submetido
3. Imprimir a contagem por entidade
4. Declarar os scripts seed e db:reset
5. Rodar db:reset seguido de seed

**Acceptance criteria:**

- [ ] npm run seed termina com código 0 e imprime a contagem por entidade
- [ ] npm run db:reset recria o schema e dispara o seed
- [ ] Depois do reset, a página inicial lista exatamente três obras
- [ ] Depois do reset existe ao menos um fornecedor, porque a submissão exige fornecedorId

**Edge cases:**

- Seed rodado duas vezes sem reset: falha por unicidade em vez de duplicar em silêncio

**Modelos:** Obra, Fornecedor · **Arquivos:** `prisma/seed.ts`, `package.json` · **Depende de:** `s1f4`

**Fora de escopo:** Seed completo com as faixas e os oito pedidos posicionados (Sprint 8)

## Critérios de aceite da sprint

1. [`s1f1`] npm run dev sobe e responde em http://localhost:3000 sem erro no console do servidor
2. [`s1f1`] npx tsc --noEmit termina com código 0
3. [`s1f1`] npm run lint termina sem erro
4. [`s1f1`] O diretório site/ não foi modificado: git diff em site/ é vazio
5. [`s1f1`] tsconfig.json tem strict igual a true
6. [`s1f2`] Os valores de cor em @theme são idênticos aos de site/assets/css/obraflow.css
7. [`s1f2`] Nenhum componente usa cor arbitrária: grep por 'text-[#' e 'bg-[#' em app/ e src/ não retorna nada
8. [`s1f2`] O eyebrow renderiza em Lora itálico
9. [`s1f2`] body tem cor de fundo explícita vinda de token
10. [`s1f3`] prisma migrate dev aplica contra banco vazio sem erro
11. [`s1f3`] Nenhum campo do schema é Float ou Decimal: grep por 'Float' e 'Decimal' em schema.prisma não retorna nada
12. [`s1f3`] Pedido.faixaId tem onDelete SetNull e as colunas faixaLimiteCentavos e faixaSemTeto existem
13. [`s1f3`] Etapa e ItemPedido têm @@unique([pedidoId, ordem])
14. [`s1f3`] Pedido.id é Int com autoincrement
15. [`s1f4`] package.json pina prisma e @prisma/client na versão exata 7.10.1, sem ^ ou ~
16. [`s1f4`] Nenhum arquivo além de src/db/prisma.ts instancia PrismaClient
17. [`s1f4`] A página inicial renderiza as obras vindas do banco
18. [`s1f5`] npm run seed termina com código 0 e imprime a contagem por entidade
19. [`s1f5`] npm run db:reset recria o schema e dispara o seed
20. [`s1f5`] Depois do reset, a página inicial lista exatamente três obras
21. [`s1f5`] Depois do reset existe ao menos um fornecedor, porque a submissão exige fornecedorId

## Definition of done

- [ ] npm run dev sobe sem erro
- [ ] npx tsc --noEmit limpo
- [ ] npm run lint limpo
- [ ] A página inicial lista as obras do seed com a identidade visual correta
- [ ] git diff em site/ é vazio

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.