# Plano — etapa 2 de testes (API)

A etapa 1 (domínio, funções puras, sem banco) entra junto com o código e não está neste plano.
Aqui está o que falta para testar a API de verdade, o que cada parte exige e o que ela custa.

## A decisão que vem antes de tudo

Route Handler do Next é uma função `(req: Request, ctx) => Response`. Isso significa que existem
**dois níveis** de teste de API, e eles custam coisas muito diferentes:

| Nível | O que faz | Exige servidor? | Custo |
|---|---|---|---|
| **2a — handler** | importa `POST` da rota e chama com um `Request` montado à mão | não | ~2h |
| **2b — HTTP** | sobe o app e faz `fetch` contra `localhost` | sim | ~4-6h |

2a exercita validação Zod, domínio, Prisma, transação e envelope de erro — ou seja, tudo que é
arriscado. 2b acrescenta só o que o Next faz por conta própria: casar a URL com o arquivo, ler
cookie, serializar a resposta. Pouco risco, muito arcabouço.

**Faça 2a. Só considere 2b se 2a estiver pronta e sobrar tempo.**

## Pré-requisito que precisa estar no código desde já

O handler não pode depender de `cookies()` de `next/headers`: fora de uma requisição real do Next,
essa função não tem contexto e lança. A sessão tem que ser lida do `Request`:

```ts
// src/server/sessao.ts
export async function lerSessao(req: Request): Promise<Sessao | null>
```

O handler recebe `req` e repassa. No teste, você monta o `Request` com o header `cookie` que
quiser e não precisa de nada do framework. Se isso não for feito agora, 2a deixa de ser possível
e só sobra 2b.

Mesma regra para qualquer outra leitura de contexto: nada de `headers()`, `draftMode()` ou
`redirect()` dentro de código que o teste vai chamar.

## O que a etapa 2a precisa ter

### 1. Banco de teste separado

Nunca o banco de desenvolvimento: os testes apagam tabelas entre casos.

- `.env.test` com `DATABASE_URL="file:./prisma/test.db"`.
- `prisma/test.db` no `.gitignore`.
- Antes da suíte: `prisma migrate reset --force --skip-seed` apontando para esse arquivo, para
  garantir schema novo e banco vazio.

### 2. Limpeza entre casos

Cada teste monta só os dados de que precisa. Em `beforeEach`, apagar na ordem das dependências
— decisões, etapas, itens, pedidos, faixas, obras, usuários, fornecedores — e então inserir a
fixture do caso. Ordem invertida da criação, senão a chave estrangeira recusa.

Não use `prisma.$transaction` com rollback para isolar: o código sob teste abre a própria
transação, e transação aninhada em SQLite não se comporta como você espera.

### 3. Fábricas de dados

Pequenas funções em `tests/fabricas.ts`, não o seed de demonstração. O seed existe para o
avaliador ver o fluxo; teste que depende dele quebra toda vez que você ajusta um valor de
demonstração.

```ts
criarObra({ nome })
criarUsuario({ nome, papel })
criarFaixa({ obraId, limiteCentavos, aprovadores: [id, id] })
criarPedidoSubmetido({ obraId, totalCentavos })  // já com cadeia gravada
```

Cada uma devolve o registro criado. Valores padrão razoáveis, sobrescrevíveis por argumento.

### 4. Ajudante de requisição

Montar `Request` à mão em todo teste polui. Um ajudante resolve:

```ts
req("POST", "/api/pedidos/1002/decisoes", { tipo: "aprovar" }, { comoUsuario: joao.id })
```

Ele monta URL, corpo JSON, `content-type` e o header `cookie` com a sessão daquele usuário.

### 5. Configuração do Vitest em dois projetos

Os dois conjuntos têm exigências opostas: domínio é paralelo e instantâneo, API precisa de banco
e tem que rodar em série, senão um caso apaga a tabela do outro.

- projeto `dominio`: `src/domain/**/*.test.ts`, sem setup.
- projeto `api`: `tests/api/**/*.test.ts`, `setupFiles` com o reset do banco,
  `fileParallelism: false`, `env` carregando `.env.test`.

Scripts: `test` roda os dois, `test:dominio` roda só o rápido durante o desenvolvimento.

### 6. Os casos que justificam a etapa

Não replique o que a etapa 1 já cobre. Teste o que só existe quando há banco e HTTP:

**Decisão fora de ordem** — pedido com cadeia Amanda → João, nenhuma decisão ainda. João decide.
Espera 409 com `code: "NAO_E_SUA_VEZ"`, e nenhuma linha de decisão gravada.

**Decisão duplicada** — Amanda decide duas vezes seguidas. Primeira 200, segunda 409.

**Corrida real** — duas decisões idênticas disparadas com `Promise.all`. Exatamente uma devolve
200 e exatamente uma devolve 409. Este é o caso que prova o UPDATE condicional, e é o único que
nenhum teste de unidade alcança.

**Permissão** — Lívia (`visualizador`) em `POST /api/obras/:id/faixas`: 403. Amanda (`aprovador`)
na mesma rota: 403. Marina (`admin`): 201.

**Escopo de leitura** — `GET /api/pedidos` como Carla e como João devolvem conjuntos diferentes
de ações possíveis. Garante que a autorização está na API, não na tela.

**Submissão sem regra aplicável** — pedido em obra sem faixa: 422 com
`code: "SEM_REGRA_APLICAVEL"`, pedido continua rascunho, nenhuma etapa criada.

**Snapshot** — submete um pedido, altera a faixa, relê o pedido: a cadeia continua a antiga.

Sete casos. Entre 2 e 3 horas com as fábricas prontas.

## O que a etapa 2b acrescentaria

Subir o app (`next build && next start -p 3100`) em `globalSetup`, esperar a porta responder,
rodar os mesmos casos por `fetch`, derrubar no fim. Acrescenta cobertura de roteamento e de
parsing de cookie pelo framework. Só vale se 2a estiver verde e houver meio dia sobrando.

## Ordem de execução

1. Ajustar `lerSessao` para receber `Request` — agora, junto do código.
2. `.env.test`, `vitest.config.ts` em dois projetos, script de reset. (~40 min)
3. `tests/fabricas.ts` e o ajudante de requisição. (~40 min)
4. Os sete casos. (~2h)
5. 2b, só se sobrar.
