# Sprint 3 · Sessão e papéis

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/03-sessao-e-papeis.json`](../spec/03-sessao-e-papeis.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-backend`

**Entregável:** Dá para entrar como cada usuário do seed, o menu muda conforme o papel, e uma rota protegida responde 403 para quem não deve.

**Risco:** medio · **Pré-requisito:** s2 · **Stack permitida:** `next`, `react`, `typescript`, `prisma`, `zod`

## Escopo

Entrada sem senha atrás de DEMO_MODE, sessão em cookie httpOnly lida do Request, e a matriz dos quatro papéis imposta no servidor.

- **s3f1** — lerSessao recebendo Request: A sessão é lida do Request, nunca de cookies() de next/headers.
- **s3f2** — Entrar e sair, atrás de DEMO_MODE: POST abre sessão nova em cookie httpOnly; DELETE encerra. Com a flag desligada a rota não responde.
- **s3f3** — Matriz de permissão dos quatro papéis: Uma função consultada por toda rota, decidindo o que cada papel pode fazer.
- **s3f4** — Envelope de erro e wrapper de rota: Toda resposta de erro no mesmo formato, convertendo ErroDominio em resposta pelo mapa do domínio.
- **s3f5** — Tela de entrada e cabeçalho: Lista os usuários do seed com seu papel; cabeçalho mostra quem está dentro, com trocar de usuário e a marca fixa.

## Fora do escopo

- Senha, SSO e refresh de token
- Autenticação com senha ou SSO (fora de escopo no PRD)
- Permissão por obra
- Delegação e substituto
- Observabilidade, log estruturado e tracing
- SSO desenhado no artboard Login
- Seletor de empresa (ADR 0006)

## Mockups desta sprint

Fidelidade total ao desenho. Canvas: <https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo> — leia `project/<Artboard>.dc.html` antes de escrever tela.

- **`TrocarConta`** — 6 · Trocar de usuário (modo demo)
- **`Login`** — 7 · Login (entrada e SSO). Só o painel de marca e a faixa de estados valem. O formulário de senha e o botão de SSO estão fora do escopo do PRD: a entrada do Dokimos é sem senha, atrás de DEMO_MODE (ADR 0005).
- **`Perfis`** — 8 · Perfis, permissões e multi-tenant. A matriz de papéis e o bloco "O que muda na interface" valem. O escopo por tenant e o seletor de empresa ficam como desenho (ADR 0006).

As divergências deliberadas estão na SPEC, em Mockups. A lista é fechada.

## Regras do agente

- Toda escrita por Route Handler. Server Action para mutação é reprovação automática (ADR 0003).
- lerSessao recebe Request; cookies() de next/headers é proibido em código que o teste chama.
- Toda resposta de erro usa o envelope { error: { code, message, fields? } } e o código do enum.
- A rota não contém regra: lê sessão, valida, chama o domínio, traduz o resultado.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

**Modelos tocados:** Usuario

## Features

### s3f1 · lerSessao recebendo Request

**Categoria:** `auth`

A sessão é lida do Request, nunca de cookies() de next/headers.

> Como desenvolvedora, quero a sessão legível fora do contexto do Next, para que o teste de rota seja possível.

**Steps:**

1. Escrever src/server/sessao.ts com lerSessao(req: Request)
2. Ler o cookie do header do Request
3. Resolver o usuário e o papel no banco
4. Devolver null quando o cookie é ausente ou inválido

**Acceptance criteria:**

- [ ] lerSessao é chamável com um Request montado à mão, fora de uma requisição do Next
- [ ] grep por 'next/headers' em src/server/ não retorna nada
- [ ] Cookie ausente devolve null, não lança
- [ ] Cookie apontando para usuário inexistente devolve null
- [ ] O papel devolvido vem do banco, nunca do cookie

**Edge cases:**

- Cookie forjado com id de outro usuário: o servidor resolve pelo id e o papel vem do banco, então forjar não concede poder
- Cookie com formato inválido: devolve null

**Modelos:** Usuario · **Arquivos:** `src/server/sessao.ts`

**Fora de escopo:** Senha, SSO e refresh de token

### s3f2 · Entrar e sair, atrás de DEMO_MODE

**Categoria:** `auth`

POST abre sessão nova em cookie httpOnly; DELETE encerra. Com a flag desligada a rota não responde.

> Como avaliador do case, quero trocar de usuário sem senha, para conferir a cadeia inteira em poucos cliques.

**Steps:**

1. Escrever POST /api/sessao recebendo o id do usuário
2. Gravar cookie httpOnly, sameSite lax, path /
3. Escrever DELETE /api/sessao
4. Guardar as duas rotas atrás de DEMO_MODE

**Acceptance criteria:**

- [ ] POST /api/sessao com id válido responde 200 e devolve Set-Cookie com HttpOnly
- [ ] O cookie não é legível por document.cookie
- [ ] Trocar de usuário cria sessão nova: o papel efetivo muda, não só o nome na tela
- [ ] Com DEMO_MODE diferente de 'true', POST /api/sessao responde 404
- [ ] POST com id de usuário inexistente responde 404 com código NAO_ENCONTRADO
- [ ] DELETE /api/sessao responde 200 e expira o cookie

**Edge cases:**

- DEMO_MODE não definida: tratada como desligada
- Corpo sem usuarioId: 422 com código VALIDACAO e campos.usuarioId
- Chamar DELETE sem sessão: 200, idempotente

**`POST /api/sessao`** — auth: publica, atrás de DEMO_MODE · timeout 5000ms · payload 1MB

*Body:* `usuarioId`: string, obrigatório, cuid

| status | resposta |
|---|---|
| 200 | { usuario: { id, nome, papel } } + Set-Cookie httpOnly |
| 404 | NAO_ENCONTRADO — usuário inexistente, ou DEMO_MODE desligada |
| 422 | VALIDACAO — corpo inválido |

*Efeitos:* cria sessão no servidor · grava cookie httpOnly

**`DELETE /api/sessao`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | sessão encerrada, cookie expirado |
| 404 | DEMO_MODE desligada |

*Efeitos:* expira o cookie

**Modelos:** Usuario · **Arquivos:** `app/api/sessao/route.ts`, `src/server/sessao.ts` · **Depende de:** `s3f1`

**Fora de escopo:** Autenticação com senha ou SSO (fora de escopo no PRD)

### s3f3 · Matriz de permissão dos quatro papéis

**Categoria:** `auth`

Uma função consultada por toda rota, decidindo o que cada papel pode fazer.

> Como admin, quero que papel seja imposto no servidor, para que esconder item de menu não seja o controle.

**Steps:**

1. Escrever src/server/permissao.ts com pode(papel, acao)
2. Declarar as ações: ver_pedidos, criar_pedido, submeter_pedido, decidir, gerir_alcada
3. Aplicar a consulta em toda rota protegida

**Acceptance criteria:**

- [ ] admin pode gerir_alcada; aprovador, comprador e visualizador não
- [ ] comprador pode criar_pedido e submeter_pedido; aprovador e visualizador não
- [ ] aprovador pode decidir; comprador, admin e visualizador não
- [ ] Os quatro papéis podem ver_pedidos
- [ ] A matriz é exaustiva em tipo: acrescentar um papel sem mapeá-lo não compila
- [ ] Toda rota protegida responde 403 com código SEM_PERMISSAO antes de tocar no banco

**Edge cases:**

- Sessão ausente numa rota protegida: 403 SEM_PERMISSAO, não 401 — o case não tem autenticação
- Papel vindo do banco fora do conjunto: tratado como sem permissão

**Modelos:** Usuario · **Arquivos:** `src/server/permissao.ts` · **Depende de:** `s3f1`

**Fora de escopo:** Permissão por obra · Delegação e substituto

### s3f4 · Envelope de erro e wrapper de rota

**Categoria:** `api_endpoint`

Toda resposta de erro no mesmo formato, convertendo ErroDominio em resposta pelo mapa do domínio.

> Como desenvolvedora da tela, quero um formato só de erro, para que o tratamento seja escrito uma vez.

**Steps:**

1. Escrever src/server/http.ts com o envelope
2. Escrever o wrapper que captura ErroDominio e traduz pelo SITUACAO_HTTP
3. Converter erro inesperado em 500 com código genérico, sem vazar stack

**Acceptance criteria:**

- [ ] Toda resposta de erro tem o corpo { error: { code, message, fields? } }
- [ ] O status HTTP vem de SITUACAO_HTTP, nunca escolhido na rota
- [ ] Erro não previsto devolve 500 sem expor stack nem mensagem interna
- [ ] Corpo que não é JSON devolve 422 VALIDACAO
- [ ] Payload acima de 1 MB devolve 413 antes de interpretar o corpo

**Edge cases:**

- Erro lançado dentro de transação: rollback antes de responder
- Timeout de 5s excedido: 504 com código genérico

**Arquivos:** `src/server/http.ts` · **Depende de:** `s3f3`

**Fora de escopo:** Observabilidade, log estruturado e tracing

### s3f5 · Tela de entrada e cabeçalho

**Categoria:** `frontend`

Lista os usuários do seed com seu papel; cabeçalho mostra quem está dentro, com trocar de usuário e a marca fixa.

> Como avaliador, quero entrar como cada usuário em um clique, para percorrer a cadeia sem digitar credencial.

**Steps:**

1. Tela listando usuários do seed com nome e papel
2. Chamar POST /api/sessao ao escolher
3. Cabeçalho com nome, papel e ação de trocar
4. Menu variando conforme o papel

**Acceptance criteria:**

- [ ] A tela lista todos os usuários do seed com o papel de cada um
- [ ] Escolher um usuário leva à lista de pedidos autenticado como ele
- [ ] O cabeçalho mostra o nome da construtora como marca fixa, sem seletor de empresa
- [ ] O item de menu de regras da alçada só aparece para admin
- [ ] A lista de usuários tem estado de carregando e de erro com repetição

**Edge cases:**

- DEMO_MODE desligada: a tela de entrada não é acessível
- Nenhum usuário no banco: empty state explicando que o seed precisa rodar
- API fora do ar: estado de erro com botão de tentar de novo

**`GET /api/usuarios`** — auth: publica, atrás de DEMO_MODE · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | [{ id, nome, papel }] |
| 404 | DEMO_MODE desligada |

**Modelos:** Usuario · **Arquivos:** `app/entrar/page.tsx`, `app/layout.tsx`, `src/ui/componentes/` · **Depende de:** `s3f2`, `s3f3`

**Fora de escopo:** SSO desenhado no artboard Login · Seletor de empresa (ADR 0006)

## Critérios de aceite da sprint

1. [`s3f1`] lerSessao é chamável com um Request montado à mão, fora de uma requisição do Next
2. [`s3f1`] grep por 'next/headers' em src/server/ não retorna nada
3. [`s3f1`] Cookie ausente devolve null, não lança
4. [`s3f1`] Cookie apontando para usuário inexistente devolve null
5. [`s3f1`] O papel devolvido vem do banco, nunca do cookie
6. [`s3f2`] POST /api/sessao com id válido responde 200 e devolve Set-Cookie com HttpOnly
7. [`s3f2`] O cookie não é legível por document.cookie
8. [`s3f2`] Trocar de usuário cria sessão nova: o papel efetivo muda, não só o nome na tela
9. [`s3f2`] Com DEMO_MODE diferente de 'true', POST /api/sessao responde 404
10. [`s3f2`] POST com id de usuário inexistente responde 404 com código NAO_ENCONTRADO
11. [`s3f2`] DELETE /api/sessao responde 200 e expira o cookie
12. [`s3f3`] admin pode gerir_alcada; aprovador, comprador e visualizador não
13. [`s3f3`] comprador pode criar_pedido e submeter_pedido; aprovador e visualizador não
14. [`s3f3`] aprovador pode decidir; comprador, admin e visualizador não
15. [`s3f3`] Os quatro papéis podem ver_pedidos
16. [`s3f3`] A matriz é exaustiva em tipo: acrescentar um papel sem mapeá-lo não compila
17. [`s3f3`] Toda rota protegida responde 403 com código SEM_PERMISSAO antes de tocar no banco
18. [`s3f4`] Toda resposta de erro tem o corpo { error: { code, message, fields? } }
19. [`s3f4`] O status HTTP vem de SITUACAO_HTTP, nunca escolhido na rota
20. [`s3f4`] Erro não previsto devolve 500 sem expor stack nem mensagem interna
21. [`s3f4`] Corpo que não é JSON devolve 422 VALIDACAO
22. [`s3f4`] Payload acima de 1 MB devolve 413 antes de interpretar o corpo
23. [`s3f5`] A tela lista todos os usuários do seed com o papel de cada um
24. [`s3f5`] Escolher um usuário leva à lista de pedidos autenticado como ele
25. [`s3f5`] O cabeçalho mostra o nome da construtora como marca fixa, sem seletor de empresa
26. [`s3f5`] O item de menu de regras da alçada só aparece para admin
27. [`s3f5`] A lista de usuários tem estado de carregando e de erro com repetição

## Definition of done

- [ ] Entrar como cada usuário do seed funciona
- [ ] O menu muda conforme o papel
- [ ] Uma rota de alçada responde 403 para não-admin, verificado por curl
- [ ] Com DEMO_MODE desligada a rota de entrada responde 404
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.