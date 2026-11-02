# Progresso

Estado deixado por cada sprint, para a próxima — que começa com contexto zerado. O que não está
escrito aqui está perdido.

---

## Sprint 1 · Fundação — PASS em 2026-10-30

### Pronto

- Projeto Next 16.4.3 com App Router na raiz do fork, sem `src-dir`, convivendo com `site/`
  intocado (`site/` é o site institucional em Hugo e não é código da aplicação).
- Tema Tailwind v4 com as rampas de marca, neutra e superfícies extraídas de
  `site/assets/css/obraflow.css`, mais Inter e Lora por `next/font` ligadas aos tokens.
- `prisma/schema.prisma` com os oito modelos de uma vez — Usuario, Obra, Fornecedor, Faixa,
  FaixaAprovador, Pedido, ItemPedido, Etapa — e a migration inicial aplicada.
- `src/db/prisma.ts` como único lugar que instancia `PrismaClient`, com driver adapter
  better-sqlite3 e memoização em `globalThis` fora de produção.
- `prisma/seed.ts` com três obras, e os scripts `seed` e `db:reset`.
- `app/page.tsx` lê as obras pelo singleton e as renderiza.

### Decisões

- **Dinheiro em centavos `Int`, quantidade em milésimos `Int`** — porque ponto flutuante muda
  quem assina: um pedido de R$ 10.000,00 que vira R$ 9.999,99 cai em outra faixa. Nenhum campo
  do schema é `Float` ou `Decimal`.
- **Snapshot da faixa como coluna do pedido** (`faixaLimiteCentavos`, `faixaSemTeto`, além de
  `faixaId` com `onDelete: SetNull`) — porque apagar a faixa não pode reescrever o histórico de
  um pedido já submetido (ADR 0001).
- **A decisão vive na própria Etapa**, não numa tabela de decisões — porque é a etapa o alvo do
  UPDATE condicional do ADR 0004, e separar as duas coisas exigiria uma transação a mais para
  dizer o mesmo.
- **`Pedido.id` é `Int` autoincrement**, não cuid — porque o pedido é citado por humanos como
  "#1002"; as demais entidades usam id String.
- **Prisma pinado em 7.10.1, sem `^`** — porque o Prisma 7 mudou a configuração (URL saiu do
  schema e foi para `prisma.config.ts`, driver adapter obrigatório), e um minor automático
  quebraria o start sem aviso.

### Pendências

- Nenhuma do escopo da sprint.
- Corrigido nesta rodada, ao conferir o *definition of done*: o ESLint ainda varria `site/`
  (607 problemas, 40 erros vindos do tema Hugo), então `npm run lint` não estava limpo.
  `site/**` entrou no `globalIgnores` de `eslint.config.mjs` e `site` no `exclude` do
  `tsconfig.json` — era o passo 2 de s1f1, que não tinha sido feito.

### Próxima sprint começa em

`src/domain/` vazio, com o schema e o cliente Prisma prontos. A Sprint 2 escreve o domínio como
funções puras, sem tocar em banco.

---

## Sprint 2 · Domínio e testes — PASS em 2026-10-30

### Pronto

- `src/domain/tipos.ts` — `Centavos`, `Milesimos` e `Ordem` como tipos marcados; `PAPEIS`,
  `SITUACOES_DO_PEDIDO` e `SITUACOES_DA_ETAPA` como tuplas literais com seus type guards;
  `Resultado<T, E>` com `sucesso` e `falha`.
- `src/domain/erros.ts` — os sete códigos fechados, a fábrica `erro()` e `SITUACAO_HTTP` como
  `Record<Codigo, number>` completo.
- `src/domain/dinheiro.ts` e `quantidade.ts` — leitura da entrada do formulário, soma,
  `porMilesimos` com arredondamento único no produto, formatação pt-BR com locale fixo.
- `src/domain/alcada.ts` — `Faixa`, `Alcada`, `comporta`, `faixasOrdenadas`, `resolverFaixa` com
  os três caminhos de recusa e `temFaixaAbertaDuplicada`.
- `src/domain/cadeia.ts` — `Etapa`, `montarCadeia`, `aprovadorDaVez`, `foiRejeitada`,
  `foiAprovada`, `estaConcluida`, `historico`.
- `src/domain/decisao.ts` — `aprovar`, `rejeitar`, `podeDecidir`, `validar` e `situacaoApos`.
- `src/domain/schemas.ts` — `rascunhoSchema` e `submissaoSchema`, o adaptador
  `camposDoZodError` e os atalhos `validarRascunho` / `validarSubmissao`.
- `vitest.config.mts` com os projetos `dominio` e `api`, `.env.test`, `prisma/test.db` no
  `.gitignore` e os scripts `test` e `test:watch`.
- Suíte de **25 casos** em cinco arquivos: `dinheiro.test.ts`, `alcada.test.ts`,
  `cadeia.test.ts`, `decisao.test.ts`, `schemas.test.ts`.

### Decisões

- **Dois schemas Zod, não um com campos opcionais** — porque rascunho e submissão respondem a
  perguntas diferentes. O rascunho é permissivo quanto à *ausência* (todo campo pode faltar,
  inclusive a obra) mas estrito quanto ao que está presente e malformado: um preço ilegível não
  vira zero em silêncio, porque o total do rascunho é exibido ao comprador. Um schema só, com
  tudo opcional, acabaria validando a submissão em outro lugar — e as duas regras divergiriam.
- **A coerção de dinheiro e quantidade usa os parsers do domínio, não `z.coerce`** — porque
  `z.coerce.number()` passa por ponto flutuante e `"1.234,56"` viraria `NaN` ou `1.234`. Um
  segundo parser aqui faria a tela e a rota discordarem sobre o mesmo texto.
- **O erro do Zod não atravessa a borda**: `camposDoZodError` achata `issues` em
  `CamposComErro` (`{ 'itens.0.quantidade': '...' }`). O formato nativo carrega o vocabulário da
  biblioteca (`invalid_type`, `path` como array), e a tela passaria a depender dele.
- **`vitest` em dois projetos** — `dominio` é função pura, roda em paralelo e em segundos;
  `api` toca um SQLite único e tem `fileParallelism: false`, porque arquivos em paralelo
  disputariam o mesmo banco. Misturá-los arrastaria o domínio para a velocidade do banco.
  `passWithNoTests: true` na raiz porque o projeto `api` ainda não tem caso: sem isso, rodar
  `vitest run --project api` falharia por "nenhum arquivo", que não é erro de configuração.
- **`vitest` pinado em 4.1.12, não 5.0.5** — porque o vitest 5 exige `@types/node` `^22 || >=24`
  e o projeto está em `^20` (fixado pela Sprint 1). Subir `@types/node` para satisfazer a suíte
  seria mexer numa dependência de outra sprint; o vitest 4 aceita `^20` e tem a API de
  `projects`. `zod` pinado em 4.6.7. Ambos sem `^` ou `~`, como o projeto já faz com o Prisma.
- **Cada caso de teste monta os próprios dados no corpo** — sem fixture compartilhada, sem
  `beforeEach`, sem mock. Um valor montado três linhas acima do assert já obriga a rolar a tela
  para saber o que está em jogo.
- **Nos testes de alçada e de cadeia, as faixas e os aprovadores entram fora de ordem de
  propósito** — entrada pré-ordenada passaria mesmo com a ordenação quebrada.
- **Todo caso afirma o código do erro, nunca o texto da mensagem.** Duas exceções, ambas porque
  a própria regra é sobre a mensagem: o caso do teto estourado verifica que o valor do teto
  *aparece* na mensagem (critério 15), e o caso de `NAO_E_SUA_VEZ` verifica que as duas
  explicações *diferem entre si* (critério 26). Nenhum dos dois fixa a frase.

### Pendências

- `tests/api/` existe com um `.gitkeep` e nenhum caso: a suíte no seam de Route Handler é o
  extra E2. O projeto `api` já está configurado e roda limpo com zero casos.
- A suíte do domínio está em **25 casos**, no topo da faixa de 12 a 25 que a sprint pede. A
  próxima sprint que quiser acrescentar caso de domínio precisa consolidar algum antes, ou
  revisar o limite no JSON da spec.
- ~~Aviso do Vite em `npm test`~~ — **resolvido**: o arquivo foi renomeado para
  `vitest.config.mts`, que o Vite carrega como ESM sem exigir `"type": "module"` no
  `package.json`. A spec da sprint foi atualizada para nomear `.mts`. `npm test` agora sai
  limpo, sem aviso.

### Próxima sprint começa em

`src/domain/index.ts` como fachada pronta — `Dinheiro`, `Quantidade`, `Alcada`, `Cadeia`,
`Decisao`, `Schemas`, mais os tipos e os erros. A Sprint 3 escreve `src/server/`: `sessao.ts`,
`permissao.ts` e o envelope de erro em `http.ts`, que é quem traduz `ErroDominio` para resposta
HTTP usando `SITUACAO_HTTP`. Nenhuma rota existe ainda em `app/api/`.

---

## Sprint 3 · Sessão e papéis — PASS em 2026-10-30

Avaliada pelo agente `evaluator`: **27 de 27 critérios atendidos**. A seção "Mockups desta
sprint" ficou **não verificada**, não aprovada — os artboards vivem num canvas fora do
repositório e o avaliador não alcança a URL. As correções que a avaliação motivou estão nas
Decisões e nas Pendências abaixo.

### Pronto

- `src/server/sessao.ts` — `lerSessao(req: Request)`, `lerCookie`, `cookieDeEntrada` e
  `cookieDeSaida`. O cookie `obraflow_sessao` é httpOnly, `SameSite=Lax`, `Path=/`, `Max-Age` de
  uma semana, e `Secure` só em produção (em `localhost` ele faria o navegador descartá-lo).
- `src/server/permissao.ts` — as cinco ações (`ver_pedidos`, `criar_pedido`, `submeter_pedido`,
  `decidir`, `gerir_alcada`), a `MATRIZ` como `Record<Papel, Record<Acao, boolean>>`, `pode()` e
  `permissoesDe()`.
- `src/server/http.ts` — o envelope `{ error: { code, message, fields? } }`, `rota()`,
  `respostaDeErro()`, `recusar()`, `exigirSessao()`, `exigirPermissao()`, `exigirModoDemo()` e
  `lerCorpoJson()` com os tetos de 1 MB e 5 s.
- `app/api/sessao/route.ts` — `GET` (quem está dentro, com as permissões), `POST` (entrar) e
  `DELETE` (sair), as três atrás de `DEMO_MODE`.
- `app/api/usuarios/route.ts` — a lista da tela de entrada, atrás de `DEMO_MODE`.
- `app/api/alcada/route.ts` — rota protegida por `gerir_alcada`, a **prova** da matriz nesta
  sprint. Responde 403 SEM_PERMISSAO para aprovador, comprador, visualizador e para quem não
  tem sessão; 200 com as obras e a contagem de faixas para o admin.
- `app/entrar/page.tsx` + `src/ui/componentes/ListaDeUsuarios.tsx` — a tela de entrada no
  enquadramento do artboard `Login`: painel de marca escuro à esquerda, com a chamada, o texto
  de apoio e os três números lidos do banco; à direita, no lugar do formulário de credencial, a
  lista de quem pode entrar, com esqueleto, vazio e erro com repetição, mais a faixa âmbar de
  demonstração e o aviso de confidencialidade.
- `src/ui/componentes/Cabecalho.tsx`, `SeletorDeUsuario.tsx`, `BotaoSair.tsx`, `Avatar.tsx`,
  `icones.tsx` e `rotulos.ts` — a barra superior do artboard `TrocarConta`: marca `ObraFlow · Aprovações` mais a
  construtora, o menu que varia por papel e o seletor com a etiqueta DEMO, que abre o diálogo
  de troca com busca, os três grupos, a linha "Em uso" e a confirmação com desfazer, mais o
  botão `Sair`, que encerra a sessão pela rota.
- `src/ui/usuarios.ts` e `src/ui/tipos.ts` — as três chamadas da sessão (`pegarUsuarios`,
  `entrarComo`, `sair`) e o filtro da busca, fora de qualquer componente.
- `src/ui/sessao-no-servidor.ts` — a ponte que monta um `Request` a partir de `cookies()` e
  chama `lerSessao`. É o **único** lugar da aplicação que importa o `cookies()` do Next.
- `middleware.ts` — porteiro de `DEMO_MODE` para a tela `/entrar`.
- `prisma/seed.ts` — cinco usuários cobrindo os quatro papéis (Marina/admin, Amanda e
  João/aprovador, Caio/comprador, Teresa/visualizador) e as três obras, todos com id fixo.
- `app/page.tsx` virou redirecionamento; `app/pedidos/page.tsx` e `app/alcadas/page.tsx` são
  marcadores, para que a entrada leve a um lugar autenticado e o item de menu do admin não seja
  link morto.

### Decisões

- **`lerSessao` recebe `Request` e o papel vem do banco** — porque `cookies()` do Next só
  funciona dentro de uma requisição real do framework, e o seam de teste de rota do extra E2
  depende de montar o `Request` à mão. O cookie carrega só o id: forjá-lo com outro id faz o
  servidor responder como *aquele* usuário, com o papel *dele* lido do banco, e nunca concede
  poder a mais.
- **O import do `cookies()` mora em `src/ui/sessao-no-servidor.ts`, não em `src/server/`** —
  porque um Server Component não recebe `Request`. Em vez de dar ao módulo de sessão uma segunda
  forma de ler a identidade, que divergiria da primeira, a ponte monta o `Request` e chama a
  mesma função que a rota chama. `grep -rn "next/headers" src/server/` é vazio.
- **Papel fora do conjunto fechado devolve `null`, não uma sessão degradada** — porque a
  ausência de sessão e o papel inválido terminam no mesmo lugar (403 SEM_PERMISSAO) e dois
  caminhos para o mesmo destino só criam um a mais para testar.
- **Modo demo desligado é 404, não 403** — 403 anunciaria um recurso presente e protegido; 404
  não conta ao mundo que existe uma entrada sem senha neste servidor (ADR 0005).
- **Sessão ausente em rota protegida é 403, não 401** — não há autenticação a exigir neste case,
  e 401 obrigaria a responder um `WWW-Authenticate` que não existe.
- **Três códigos de borda (`ERRO_INTERNO`, `PAYLOAD_GRANDE`, `TEMPO_ESGOTADO`) vivem em
  `http.ts`, não no enum do domínio** — porque não descrevem recusa de regra de negócio: o
  domínio não conhece payload, timeout nem stack. O envelope é o mesmo; só a origem do número
  muda, e todo código de domínio continua saindo de `SITUACAO_HTTP`.
- **`usuarioId` é validado como texto não vazio, não como cuid** — embora a tabela da SPEC diga
  "cuid". Validar o formato da chave do Prisma faria "id que não existe" responder 422 para uns
  palpites e 404 para outros, a mesma pergunta com duas respostas. `src/domain/schemas.ts` já
  trata identificador assim, pelo mesmo motivo.
- **O wrapper `rota()` relança exceções com `digest`** — `redirect()`, `notFound()` e os sinais
  de prerender do Next viajam como exceção. Engoli-los transformaria desvio de fluxo do
  framework em 500.
- **`await connection()` em `GET /api/usuarios`** — o better-sqlite3 é síncrono e a rota não lê
  nada do `Request`: sem o marco, o Next resolvia a lista **e a checagem da flag** durante o
  build e servia um resultado congelado. Era o que fazia a rota aparecer como estática no
  relatório de build.
- **O cabeçalho fica dentro de um `<Suspense>` no layout** — ele depende da sessão, que é dado
  de requisição. Sem a fronteira, toda página do app bloquearia a casca até o banco responder
  (Cache Components está ligado no `next.config.ts`).
- **A flag da tela `/entrar` é imposta em `middleware.ts`, além do `notFound()` na página** —
  porque sob Cache Components a casca estática já saiu com 200 quando o componente decide, e a
  tela respondia 200 com a página de 404 no corpo. As **rotas** continuam conferindo a flag em
  `exigirModoDemo()`, e é lá que a conferência precisa estar: o teste de rota chama o handler
  direto, sem passar pelo middleware. Um flag, dois pontos de imposição, nunca duas respostas.
- **A interface da sprint foi escrita contra os artboards, não estimada** — `TrocarConta` dá a
  barra superior e o diálogo de troca, `Login` dá o enquadramento da tela de entrada, `Perfis`
  dá a regra de que o item que o papel não usa **some** do menu em vez de aparecer desabilitado.
  A exigência de fidelidade virou texto da SPEC nesta rodada (§ Mockups), com o mapa
  artboard → sprint e a lista fechada de divergências; `scripts/spec-md.mjs` passou a recusar
  artboard apontando para sprint inexistente, como já recusava id órfão.
- **A troca de usuário é um diálogo no cabeçalho, não só a página `/entrar`** — é o que o
  artboard desenha, e é o que `docs/specs/eventos-front.md` já inventariava (`abrirTroca`,
  `fecharTroca`, `filtrarPessoas`, `desfazerTroca`). `/entrar` continua sendo a porta de quem
  não tem sessão; o diálogo é a troca de quem já está dentro.
- **O botão "Sair" do cabeçalho é divergência declarada** — o artboard `TrocarConta` desenha a
  troca de pessoa e nada que encerre a sessão. `DELETE /api/sessao` existe e precisa de um
  controle na tela: sem ele a única saída seria apagar o cookie à mão. Em vez de inventar o
  controle em silêncio, ele entrou na lista fechada de divergências da SPEC, e o estilo é
  emprestado do "Desfazer" do próprio artboard, para não introduzir linguagem visual nova.
- **Onze tokens novos em `app/globals.css`** — a faixa âmbar do modo demonstração, o rosa de
  linha selecionada, o azul informativo das etiquetas e os cinco pares de avatar. Os artboards
  usam essas cores e elas não estavam nas três rampas da Sprint 1; entraram como token porque a
  SPEC proíbe hexadecimal cru na tela.
- **A cor do avatar é derivada do id, não gravada** — o artboard atribui uma cor por pessoa sem
  regra visível. Derivar do id dá estabilidade entre telas e recargas sem uma coluna no banco.
- **O texto sob o nome descreve o papel, não a pessoa** — o artboard escreve "Engenheira
  residente · Residencial Aurora · nível 1", que depende de cargo e obra, campos que o modelo
  não tem. A lista de divergências já declara os nomes e números dos artboards como
  ilustrativos, e "nível" não é vocabulário do GLOSSARY.
- **O alias `@/` passou a ser declarado em `vitest.config.mts`, por projeto** — o tsconfig tem o
  alias, o Vite não o lê, e sem repeti-lo um teste que importasse `@/src/server/sessao` falhava
  uma camada abaixo, em `@/src/db/prisma`, parecendo defeito do módulo importado. Fica dentro de
  cada entrada de `projects` porque um `resolve` na raiz não desce para elas.
- **As cores cruas do seletor viraram token** — o scrim é `bg-neutro-950/42`, o anel do botão
  aberto é `ring-3 ring-neutro-900/10`, e a cor de sombra dos artboards (`#101828`), que não
  pertence a rampa nenhuma, entrou como `--sombra-forte` e `--sombra-suave`. A SPEC § Mockups
  proíbe hexadecimal cru na tela, e `rgba(12,17,29,…)` escrito à mão é o mesmo problema com
  outra notação.
- **A mensagem do Zod para `usuarioId` ausente passou a vir em português** — `.min(1, …)` só
  cobre o campo presente e vazio; sem mensagem no construtor, corpo sem a chave caía no texto
  padrão da biblioteca, em inglês, e ele chegava à tela ancorado no campo.
- **Ids do seed são fixos, não cuid gerado** — para `db:reset` seguido de `seed` reproduzir
  exatamente o mesmo estado, que é critério da Sprint 8, e para o script de verificação por
  curl poder citá-los.
- **Cinco usuários, não quatro** — os quatro papéis exigem quatro, mas a Sprint 6 precisa de
  dois aprovadores distintos (Amanda e João) para a mesma lista mostrar filas diferentes.

### Pendências

- **`/alcadas` para quem não é admin responde 200 com a página de 404 no corpo**, pelo mesmo
  motivo de casca estática descrito acima — a página chama `notFound()` depois de a casca ter
  saído. Não entrou no middleware porque a Sprint 4 substitui essa página pela tela de verdade,
  cujo comportamento para não-admin é "explicação de acesso negado", não 404. A rota de API
  (`GET /api/alcada`) responde 403 corretamente, e é ela que impõe o acesso.
- **`app/pedidos/page.tsx` e `app/alcadas/page.tsx` são marcadores.** A lista de pedidos é da
  Sprint 6 e a tela de faixas é da Sprint 4; ambas substituem o arquivo inteiro. O artboard
  `Perfis` pede que quem não é admin veja "você não tem acesso a esta configuração, com quem
  procurar" ao digitar a URL da tela 3 — é critério da Sprint 4, e por ora o marcador responde
  `notFound()`.
- **O item `Aprovações` do menu entra na Sprint 6.** Os artboards o desenham; a rota e a tela
  ainda não existem, e um link morto custaria mais caro do que a ausência.
- **`app/api/alcada/route.ts` é a prova da matriz, não a API da alçada.** A Sprint 4 escreve
  `api/obras/[id]/faixas` e `api/faixas/[id]`; pode absorver ou manter esta.
- `tests/api/` tem **um** caso, `configuracao.test.ts`, que é guarda de configuração e não caso
  de regra: ele prova que o alias `@/` resolve dentro do projeto `api`. A suíte de rota de
  verdade continua sendo o extra E2. `src/server/http.ts`, `permissao.ts` e `sessao.ts` são
  chamáveis com um `Request` montado à mão — o avaliador exercitou os três assim.
  `DEMO_MODE="true"` entrou no `.env.test` para que essa suíte exercite as rotas de sessão.
- **A assinatura de `ok(dados, situacao = 200, cabecalhos?)` convida ao literal**: hoje duas
  chamadas escrevem `200` só para alcançar o terceiro argumento. Não é status de erro, então o
  mapa `SITUACAO_HTTP` segue sendo o único a decidir recusa — mas a próxima rota que precisar de
  cabeçalho repete o número. Trocar por um objeto de opções enquanto há três chamadores.
- **Tensão entre os critérios 5 e 17 da sprint, registrada para não ser rediscutida.** O 17 pede
  403 "antes de tocar no banco"; o 5 exige que o papel venha do banco, e `exigirPermissao`
  precisa resolver a sessão para saber o papel. A leitura adotada, e aceita na avaliação, é
  "antes de qualquer consulta de **negócio**": em `app/api/alcada/route.ts` a recusa acontece
  antes do `findMany` das obras.
- **A fidelidade aos mockups não é verificável por máquina neste arranjo.** O canvas é um
  artefato externo; quem avalia sem acesso a ele não consegue carimbar as seções visuais.
  Versionar os `.dc.html` em `docs/mockups/` resolveria, e é decisão de quem tocar a Sprint 4.
- A suíte do domínio segue em **25 casos**, no topo da faixa de 12 a 25.

### Próxima sprint começa em

`src/server/` completo — sessão, permissão e envelope — com `app/api/sessao`, `app/api/usuarios`
e `app/api/alcada` funcionando, e o cabeçalho já variando por papel. A Sprint 4 escreve as rotas
de faixa (`GET`/`POST /api/obras/[id]/faixas`, `PUT`/`DELETE /api/faixas/[id]`) usando
`exigirPermissao(req, 'gerir_alcada')` e `respostaDeErro`, e substitui o marcador
`app/alcadas/page.tsx` pela tela de regras da alçada — incluindo a explicação de acesso negado
para quem não é admin.

---

## Sprint 4 · Tela 3 — Regras da alçada — PASS em 2026-10-30

Avaliada pelo agente `evaluator` em duas voltas. Na primeira, os **24 critérios numerados** e a
*Definition of done* passaram, com evidência executada por `curl` critério a critério, e a seção
"Mockups desta sprint" **reprovou**, por duas divergências do artboard `Alcadas` fora da lista
fechada — o texto do aviso âmbar e a posição do bloco de pré-visualização. Na segunda volta, com
só essas duas corrigidas, a seção de mockups passou: **24 de 24 critérios, fidelidade aprovada,
três divergências deliberadas declaradas e justificadas**.

Nota de método, que vale para a próxima sprint de tela: os critérios de interação (19 a 22 e 24)
foram carimbados por leitura do componente somada ao comportamento já provado por `curl` das
rotas que a tela chama — o avaliador não conseguiu instrumentar um navegador, barrado pelo
sandbox. Quem quiser carimbo de interação de verdade na Sprint 5 tem dois caminhos: a suíte de
rota do extra E2, ou teste de componente. Harness ad hoc não.

### Pronto

- `app/api/obras/[id]/faixas/route.ts` — `GET` lista as faixas da obra, ordenadas pelo domínio
  (limite crescente, a aberta por último), cada uma com os aprovadores na ordem gravada e com
  `pedidosEmAndamento`; `POST` cria faixa numa transação com seus `FaixaAprovador`.
- `app/api/faixas/[id]/route.ts` — `PUT` substitui a faixa inteira (limite e lista ordenada) numa
  transação; `DELETE` remove e devolve `{ removida, pedidosAfetados }`.
- `src/server/alcada.ts` — o que as duas rotas compartilham: a serialização (`FaixaPublica`), a
  ordenação pelo domínio, `exigirObra`, `exigirFaixa`, `corpoDeFaixa` (corpo + schema + regras da
  obra + existência dos aprovadores) e `aprovadoresNaOrdem`.
- `src/domain/alcada.ts` ganhou as regras de **edição** da alçada, ao lado das de resolução:
  `MAX_FAIXAS_POR_OBRA`, `MAX_APROVADORES_POR_FAIXA`, `comFaixaProposta`, `conflitoNaAlcada`,
  `pisoImplicito` e `faixaDescrita`.
- `src/domain/schemas.ts` ganhou `faixaSchema` e `validarFaixa` — o mesmo schema que a rota roda
  e que o formulário roda antes de enviar.
- `app/alcadas/page.tsx` deixou de ser marcador: decide entre a tela e a explicação de acesso
  negado, e entrega a lista de usuários que podem virar aprovadores.
- `src/ui/componentes/RegrasDaAlcada.tsx`, `EditorDeFaixa.tsx`, `DialogoDeRemocao.tsx` e
  `AcessoNegado.tsx` — a tela do artboard `Alcadas`: seletor de obra, tabela com faixa, intervalo
  e aprovadores em cadeia, criar, editar, reordenar e remover, mais os avisos do mockup.
- `src/ui/hooks/useRecurso.ts` — carregando, vazio e erro com repetição escritos uma vez só.
- `src/ui/alcadas.ts` — as cinco chamadas da tela e `FalhaDaApi`, que carrega o envelope inteiro
  (`code`, `message`, `fields`) para o formulário ancorar a mensagem no campo.
- Onze tokens novos em `app/globals.css` (rosa escuro do aviso, âmbar e os cinco do vermelho de
  ação destrutiva), lidos dos artboards `Alcadas` e `Estados`.
- Três divergências deliberadas novas em `docs/spec/base.json`, com justificativa, e
  `npm run spec:md` rodado: a navegação lateral, o campo "Valor mínimo" editável e o texto do
  aviso "Valor sem faixa aplicável".

### Decisões

- **`app/api/alcada/route.ts` fica, e passa a ser consumida pela tela** — era a prova da matriz
  de permissão na Sprint 3 e corria o risco de virar código morto. Ela já devolve exatamente o
  que o seletor de obra precisa (obras e contagem de faixas) e já é exclusiva do admin; absorvê-la
  nas rotas de faixa exigiria uma rota `GET /api/obras` que nenhuma sprint pediu, e apagá-la
  custaria o ponto de prova do 403 sem nada em troca.
- **`GET /api/obras/[id]/faixas` exige sessão, não o papel admin** — é o que a tabela de contratos
  da sprint declara (`auth: sessao`), e faz sentido: a faixa explica por que um pedido foi parar
  com aquelas pessoas, e quem acompanha pedidos precisa poder ler isso. Quem **edita** é outra
  pergunta, e `POST`, `PUT` e `DELETE` cobram `gerir_alcada`.
- **Número no corpo é centavos; texto é entrada de formulário** — `{"limiteCentavos": 1000000}`
  são R$ 10.000,00, porque é o que o contrato declara (`int > 0`); `{"limiteCentavos": "10.000,00"}`
  é o mesmo valor digitado por uma pessoa. A primeira versão passava os dois por
  `Dinheiro.deEntrada` e multiplicava o número por cem em silêncio — um `curl` pedia R$ 10.000,00
  e gravava R$ 1.000.000,00. O caminho de texto continua sendo o parser do domínio, nunca
  `z.coerce`.
- **Aprovador inexistente é 422 com o erro em `campos.aprovadores`, não 404** — o recurso do
  caminho existe; o que está errado é um valor do corpo. Sem a checagem explícita, o erro viria do
  banco como violação de chave estrangeira e chegaria à tela como 500.
- **A conferência de conflito exclui a própria faixa no `PUT`** — senão salvar sem mudar o limite
  acusaria "limite duplicado" contra si mesma. É o que `conflitoNaAlcada(alcada, { id, … })` faz
  com o `id`.
- **`PUT` apaga e recria os `FaixaAprovador` em vez de casar linha a linha** — a lista nova pode
  ser a antiga em outra ordem, e um `update` por posição esbarraria no índice único
  `(faixaId, ordem)` no meio do caminho. Apagar e recriar dentro da transação é a única forma de a
  faixa nunca existir meio reordenada.
- **A reordenação é estado local do formulário até alguém salvar** — cada seta não é uma escrita.
  É o que dispensa uma rota de reordenação, e é por isso que o `PUT` substitui a faixa inteira.
- **O campo "Valor mínimo" existe, na posição do artboard, mas é de leitura** — não há coluna de
  mínimo (ADR 0002); o que ele mostra é `Alcada.pisoImplicito`, recalculado a cada tecla digitada
  no valor máximo. Divergência declarada na SPEC, com o motivo.
- **A navegação lateral do artboard não foi implementada** — `Alcadas` desenha a navegação numa
  coluna à esquerda e `TrocarConta` desenha a mesma navegação como barra superior. Os dois não
  cabem juntos; a barra superior é a que a Sprint 3 implementou e as telas seguintes herdam.
  Divergência declarada na SPEC, com o motivo.
- **A lista de usuários disponíveis chega com a página, não por `fetch`** — `GET /api/usuarios` só
  existe com `DEMO_MODE` ligada (ADR 0005), e a tela de alçada não pode depender de uma rota de
  demonstração para funcionar. É dado real lido do banco no Server Component, não dado simulado:
  o que a sprint proíbe é a tela fingir ter servidor, não o servidor renderizar.
- **A obra escolhida vive na URL (`?obra=…`), por `history.replaceState`** — recarregar a tela
  depois de criar uma faixa precisa voltar à mesma obra, senão o critério 19 só é demonstrável
  reclicando o seletor. `replaceState` e não `router.replace` porque nada no servidor depende da
  obra: a navegação remontaria a página inteira para mudar um parâmetro de leitura.
- **`useRecurso` ajusta o estado durante a renderização quando a chave muda**, em vez de corrigi-lo
  num efeito — o efeito deixaria um quadro com as faixas da obra anterior sob o nome da obra nova.
  É também o que o `react-hooks/set-state-in-effect` do ESLint cobra.
- **Nenhum caso de teste novo no projeto `dominio`** — a suíte está em 25 casos, que é o topo da
  faixa de 12 a 25 que o critério da Sprint 2 fixa, e acrescentar caso faria uma sprint já
  aprovada passar a falhar. As regras novas foram exercitadas por `curl` contra o servidor,
  critério a critério, e a suíte de rota continua sendo o extra E2.

- **O texto do aviso âmbar diverge do artboard, e a divergência foi declarada** — o artboard
  escreve "o pedido **não é criado**", e isso contradiz o vocabulário do produto: o rascunho é
  criado, e é a submissão que a falta de faixa impede (GLOSSARY, verbete "Sem regra aplicável";
  ADR 0001). A tela escreve "não é submetido". A frase final do artboard, "Decisão documentada no
  README", também não entrou: o README é da Sprint 8, e aviso de tela não aponta para documento
  que ainda não existe. Levantado pela avaliação, corrigido por declaração e não por mudança de
  texto, porque mudar o texto para o do artboard é que seria o erro.
- **O bloco "Pré-visualização" é irmão do cartão do editor, não filho dele** — estava dentro do
  `<form>`, depois dos botões, e condicionado a haver aprovador. O artboard o desenha entre o
  cartão e o aviso de regra, e é lá que ele voltou: `EditorDeFaixa` devolve um fragmento com os
  dois. Com zero aprovadores a frase muda em vez de sumir, porque o bloco existe no desenho.
  Levantado pela avaliação.
- **A sombra dos cartões é `shadow-xs` do Tailwind** — que é exatamente
  `0 1px 2px 0 rgb(0 0 0 / 0.05)`, o `box-shadow` do `.card` do artboard. Antes estava escrita à
  mão em três arquivos; a Sprint 3 tokenizou as cores de sombra justamente para isso não
  acontecer.

### Pendências

- **As regras novas de `src/domain/alcada.ts` (`conflitoNaAlcada`, `pisoImplicito`,
  `faixaDescrita`) não têm caso automatizado**, pelo limite de 25 casos descrito acima. Quem tocar
  o extra E2 deve cobri-las no projeto `api`, junto com as rotas — ou revisar o limite no JSON da
  Sprint 2 e cobri-las como função pura, que é o nível certo.
- **`pedidosAfetados` do `DELETE` conta todos os pedidos vinculados; `pedidosEmAndamento` do `GET`
  conta só os pendentes.** São números diferentes de propósito — o diálogo precisa falar do que
  ainda vai ser decidido, e a resposta da remoção, de tudo que perdeu o vínculo. Os dois nomes
  dizem isso, mas a diferença é sutil o bastante para alguém confundir.
- **Não há controle de versão otimista na faixa** — dois `PUT` concorrentes: o último escreve. É
  "fora do escopo" declarado da sprint, não esquecimento.
- **A fidelidade aos mockups continua não verificável por máquina.** O artboard foi lido do canvas
  e salvo em arquivo local para a avaliação desta rodada, mas o arquivo não está versionado.
  Versionar os `.dc.html` em `docs/mockups/` resolveria de vez, e segue sendo decisão de quem
  tocar a próxima sprint de tela.
- **`app/pedidos/page.tsx` continua marcador** e o item `Aprovações` do menu continua fora: são da
  Sprint 6.
- **A assinatura de `ok(dados, situacao = 200, cabecalhos?)` continua convidando ao literal.**
  `POST /api/obras/[id]/faixas` passou a ser o terceiro chamador a escrever um número — `201`,
  desta vez. Trocar por objeto de opções enquanto são três.

### Próxima sprint começa em

As rotas de faixa e a tela de alçada funcionando, com a alçada do seed configurável pela
interface. A Sprint 5 escreve a Tela 1 — cadastro de pedido: `POST /api/pedidos` (rascunho),
`PUT`/`DELETE /api/pedidos/[id]` e `POST /api/pedidos/[id]/submissao`, que é quem chama
`Alcada.resolverFaixa` e `Cadeia.montarCadeia` para gravar o snapshot do ADR 0001. O artboard é
`Main`.

O seed continua sem pedido e sem fornecedor. O banco de desenvolvimento em disco (`prisma/dev.db`)
tem, a mais do que o seed, **duas faixas na obra Residencial Aurora** — "até R$ 10.000,00 →
Amanda" e a aberta "→ Amanda → João" —, criadas pela própria tela durante a verificação desta
sprint e deixadas de propósito, para que a Sprint 5 tenha alçada configurada e um pedido
submetível. Os pedidos e o fornecedor criados para provar os critérios 12, 13 e 16 foram apagados.
`npm run db:reset && npm run seed` devolve o banco ao seed puro, sem faixa nenhuma.

---

## Sprint 5 · Tela 1 — Cadastro de pedido — entregue em 2026-10-30

Os **30 critérios numerados** e a *Definition of done* foram exercitados nesta rodada: os 21 de
rota por `curl` contra o servidor, critério a critério, e os 9 de tela pelo navegador embutido,
com leitura da árvore de acessibilidade e dos valores dos campos. A avaliação pelo agente
`evaluator` ainda não rodou — o que está abaixo é a entrega do coder.

### Pronto

- `app/api/pedidos/route.ts` — `POST` cria o rascunho do usuário da sessão, com `situacao`
  rascunho, `totalCentavos` somado dos itens e `criadoPorId` vindo do cookie. Corpo ausente,
  `{}` ou completo, todos aceitos.
- `app/api/pedidos/[id]/route.ts` — `GET` devolve o pedido que a sessão pode ver; `PUT`
  substitui cabeçalho e itens numa transação, recalculando o total; `DELETE` apaga o rascunho,
  com os itens em cascata.
- `app/api/pedidos/[id]/submissao/route.ts` — `POST` valida o rascunho gravado com
  `submissaoSchema`, carimba `dataPedido` e `submetidoEm`, resolve a faixa pelo total, grava o
  snapshot (`faixaId`, `faixaLimiteCentavos`, `faixaSemTeto`) e as `Etapa` da cadeia, e muda a
  situação — tudo dentro de uma transação, com `UPDATE` condicionado a `situacao: 'rascunho'`.
- `src/domain/pedido.ts` — `totalDoItem`, `linhasDeItens` (que reindexa a ordem pela posição),
  `totalDosItens`, `conflitoDeImutabilidade`, `entradaDeSubmissao` e `planejarSubmissao`, que
  junta `Alcada.resolverFaixa` e `Cadeia.montarCadeia` numa decisão só. Exportado em
  `src/domain/index.ts`.
- `src/domain/dinheiro.ts` e `quantidade.ts` ganharam `paraEntrada`, o caminho de volta de
  `deEntrada`.
- `src/server/pedido.ts` — `pedidoDaSessao` (as duas recusas da sprint, na ordem),
  `corpoDeRascunho`, `itensParaGravar`, `linhasDoBanco`, `publicar`, `idDoCaminho` e
  `alcadaComAprovadores`, que lê a alçada **dentro** da transação.
- `app/pedidos/novo/page.tsx` + `src/ui/componentes/FormularioDePedido.tsx`,
  `ItensDoPedido.tsx`, `ResumoDoPedido.tsx` e `src/ui/formulario-de-pedido.ts` — a tela do
  artboard `Main`: dados gerais, editor de itens N com total por linha calculado e não editável,
  resumo com o total ao vivo, botão de envio desabilitado com o motivo visível, e os três
  estados (carregando, vazio, erro com repetição) na retomada do rascunho e na leitura da alçada
  da obra.
- `src/ui/api.ts` — `FalhaDaApi` e `pedir` saíram de `alcadas.ts` para um módulo próprio;
  `src/ui/pedidos.ts` é o conjunto de chamadas da tela nova.
- `app/pedidos/page.tsx` deixou de ser só marcador: tem o botão **Novo pedido** e a lista dos
  **rascunhos de quem está dentro**.
- `src/ui/componentes/estilos.ts` — as classes que a tela 1 e a tela 3 repetem, num lugar só.
- `AcessoNegado` virou dois textos num componente, por `acao`.
- Migration `20261030162301_pedido_obra_opcional_no_rascunho`.
- Três divergências do artboard `Main` declaradas em `docs/spec/base.json`, com
  `npm run spec:md` rodado.

### Decisões

- **`Pedido.obraId` passou a ser nulo** (migration nova). O critério 2 exige que `POST` aceite
  corpo com todos os campos ausentes e o contrato declara `obraId` "opcional no rascunho" — e a
  coluna obrigatória tornava os dois impossíveis de satisfazer ao mesmo tempo. "Obrigatório" na
  tabela da SPEC descreve o pedido **submetido**, e é a submissão que o cobra: sem obra, 422 com
  `fields.obraId`. Um rascunho sem obra é estado legítimo, não falta.
- **A submissão não lê corpo.** O que ela valida é o rascunho gravado, por
  `Pedido.entradaDeSubmissao` + `submissaoSchema`. Isso resolve dois critérios de uma vez:
  `dataPedido` enviada pelo cliente é ignorada porque nunca é lida, e não existe caminho em que
  a submissão grave algo que o `PUT` não tenha gravado antes. A tela salva e depois submete.
- **O rascunho gravado volta ao formato de entrada por `paraEntrada`, não por `formatar`.** O
  `submissaoSchema` lê texto de formulário, e `Dinheiro.formatar` agrupa o milhar: 1.200 unidades
  reentrariam como 1,2 e o pedido mudaria de faixa no caminho de volta. `toFixed` é o único
  formato que atravessa `deEntrada` sem perder nem ganhar nada.
- **Imutabilidade antes de propriedade, em `pedidoDaSessao`.** Pedido submetido é visível a
  qualquer sessão e escrever nele é 409 para todo mundo, inclusive para quem não o criou;
  rascunho alheio, ao contrário, é 404 — nunca 403, porque 403 contaria que ele existe. Nessa
  ordem os critérios 4 e 5 convivem sem se contradizer, e edição concorrente de rascunho deixa
  de ser representável: nunca há duas sessões com escrita no mesmo rascunho.
- **A submissão usa `exigirPermissao(req, 'submeter_pedido')`, e isso recusa o admin** — o
  contrato da sprint diz "comprador ou admin", mas a matriz da Sprint 3, já avaliada, dá
  `criar_pedido: false` e `submeter_pedido: false` ao admin ("Configura as faixas de alçada das
  obras"; o comprador "cria e submete pedidos"). Mudar a matriz reprovaria uma sprint aprovada
  para satisfazer uma linha de contrato; o critério 9, que é o que a sprint cobra, só nomeia
  aprovador e visualizador, e esses continuam recebendo 403. Divergência declarada aqui.
- **A faixa é relida dentro da transação.** É o que faz a faixa apagada entre a leitura e a
  escrita virar `SEM_REGRA_APLICAVEL` em vez de uma cadeia gravada a partir de regra que já não
  existe — e é o que mantém a contagem de `Etapa` em zero quando a submissão é recusada: tudo o
  que pode recusar acontece antes da primeira escrita.
- **O `UPDATE` da submissão é condicionado a `situacao: 'rascunho'`**, como a decisão do
  ADR 0004 é condicionada à etapa. Dois `POST` concorrentes chegam os dois até a transação; é a
  condição que faz o segundo não escrever e receber o mesmo 409 que receberia se tivesse chegado
  depois. Verificado com dois `curl` em paralelo: 200 e 409, uma etapa gravada.
- **`PUT` substitui o rascunho inteiro; campo ausente é campo em branco.** É o mesmo significado
  do `PUT` da faixa, e é o que dispensa uma rota de reordenação de itens: a `ordem` é a posição
  no array, sempre, e ordem repetida deixa de ser representável. Um verbo, um significado.
- **Item incompleto é gravado com zero, não descartado.** O rascunho é incompleto por natureza, e
  descartar a linha meio digitada faria "salvar e voltar depois" perder justamente o que estava
  sendo escrito. Zero é exatamente o que a submissão recusa, porque ela exige quantidade e preço
  estritamente maiores que zero.
- **`lerCorpoJson` passou a devolver `undefined` para corpo ausente.** Um corpo que não existe não
  é um corpo malformado, e tratá-lo como JSON inválido tornava o critério 2 inalcançável por
  `curl` sem `-d`. Corpo ilegível continua sendo 422.
- **`rota()` aceita `tempoLimiteEmMs`.** O contrato da submissão declara 8 s, e não os 5 s do teto
  geral. O número continua saindo do contrato e não da rota — o que mudou é de onde o wrapper o
  lê.
- **Mensagens em português nos schemas da Sprint 2.** `submissaoSchema` sem obra devolvia
  "Invalid input" e `.max(100)` devolvia "Too big: expected array to have <=100 items", em inglês
  e ancorados no campo — é o mesmo defeito que a Sprint 3 corrigiu em `usuarioId`. Nenhuma regra
  mudou; só o texto.
- **O total do item e o total do pedido são `<input readOnly>`.** O artboard os desenha como
  texto, mas o critério 23 fala de inputs com `readonly`, e um campo de leitura torna a recusa
  verificável em vez de inferida. O estilo é sem borda e sem fundo: visualmente é o texto do
  artboard.
- **Item inválido fica fora da soma e aparece com travessão.** Somar meia linha mostraria um total
  que o servidor não confirmaria — e é pelo total que a alçada é decidida. Melhor um número a
  menos do que um número errado.
- **O erro de campo só aparece depois de a pessoa tocar nele**, e todos aparecem depois de uma
  tentativa de envio. Um formulário que nasce vermelho ensina a ignorar o vermelho. O motivo do
  bloqueio, esse, é visível desde o começo, ao lado do botão desabilitado.
- **O número do rascunho entra na URL por `history.replaceState`**, como a obra escolhida na tela
  de alçada: nada no servidor depende do parâmetro, e `router.replace` remontaria a página
  inteira para mudar um dado de leitura.
- **Os rascunhos de quem está dentro são lidos pelo Server Component de `/pedidos`, não por rota
  nova.** `GET /api/pedidos` com filtros é contrato da Sprint 6, e antecipá-lo faria a sprint
  seguinte começar com uma rota a corrigir. Rascunho é privado e não aparece na lista principal
  (decisão de revisão da SPEC), então esta lista não é a lista da Sprint 6 e não vai virar.
- **Obras e fornecedores chegam com a página**, pelo mesmo motivo que a lista de usuários da
  Sprint 4: não existe `GET /api/obras` nem `GET /api/fornecedores` em sprint nenhuma. É dado real
  lido do banco — o que a sprint proíbe é a tela fingir ter servidor, não o servidor renderizar.
- **Três divergências novas do artboard `Main`, declaradas na SPEC**: o botão "Salvar rascunho",
  que o artboard não desenha e a história de usuário exige; o cartão "Alçada prevista", que é o
  simulador do extra E1 e que a própria sprint declara fora do escopo; e a navegação lateral, que
  já estava declarada para `Alcadas` e passou a nomear `Main`. A divergência da data já constava
  da lista desde a revisão da SPEC e ganhou o detalhe do que a tela põe no lugar do campo.

### Pendências

- **`src/domain/pedido.ts` não tem caso automatizado.** A suíte do domínio está em 25 casos, que é
  o topo da faixa de 12 a 25 que o critério 40 da Sprint 2 fixa, e acrescentar caso faria uma
  sprint aprovada passar a falhar — é a mesma trava que a Sprint 4 encontrou e registrou. As
  regras novas foram exercitadas por `curl` contra o servidor, critério a critério. Quem tocar o
  extra E2 deve cobrir `linhasDeItens`, `planejarSubmissao` e `entradaDeSubmissao` no projeto
  `api`, junto com as rotas — ou revisar o limite no JSON da Sprint 2, que já são **duas** sprints
  bloqueadas por ele.
- **`GET /api/pedidos/[id]` está incompleto de propósito.** Devolve o cabeçalho, o snapshot da
  faixa e os itens — o que a tela 1 precisa para retomar um rascunho. A cadeia gravada, o
  histórico e `podeDecidir` são contrato da Sprint 6, no mesmo arquivo.
- **`exigirObraDoCorpo` e `exigirFornecedorDoCorpo` são duas funções iguais** em
  `src/server/pedido.ts`, e `exigirAprovadoresExistentes` em `src/server/alcada.ts` é uma terceira
  variação do mesmo "o id do corpo existe?". Na quarta vale generalizar.
- **A assinatura de `ok(dados, situacao = 200, cabecalhos?)` continua convidando ao literal.**
  `POST /api/pedidos` é o quarto chamador a escrever um número. Segue valendo trocar por objeto
  de opções.
- **Não há controle de versão otimista no pedido**, como não há na faixa. Para o rascunho a
  pergunta nem chega a existir — ele é privado do criador, e a privacidade elimina a escrita
  concorrente por construção. Para a submissão, o `UPDATE` condicional já resolve o caso real.
- **A fidelidade ao artboard foi verificada por leitura e por navegador, não por captura
  comparada.** O artboard `Main` foi lido do canvas para um arquivo local durante esta rodada, e o
  arquivo **não** está versionado — é a mesma pendência que as Sprints 3 e 4 registraram.
  Versionar os `.dc.html` em `docs/mockups/` resolveria de vez.
- **O seed continua sem fornecedor**, e sem fornecedor a tela 1 não envia pedido nenhum: o campo
  mostra o estado vazio apontando o seed, que é o que a sprint pede. O fornecedor e as faixas
  usados na verificação desta rodada foram criados por fora e **apagados**; `prisma/dev.db` está
  no estado do seed puro — 3 obras, 5 usuários, zero faixas, zero fornecedores, zero pedidos. O
  seed completo é da Sprint 8, e é ele que vai tornar a demonstração reproduzível sem preparo
  manual.
- **O item `Aprovações` do menu continua fora** e `app/pedidos/page.tsx` continua sem a lista de
  pedidos submetidos: são da Sprint 6.

### Próxima sprint começa em

As três rotas de pedido e a tela 1 funcionando: dá para montar um pedido de três itens, salvá-lo
como rascunho, sair, voltar pela lista de rascunhos de `/pedidos`, completá-lo e enviá-lo — e a
cadeia fica gravada no banco com as etapas na ordem da faixa.

A Sprint 6 escreve a tela 2 e a decisão: `GET /api/pedidos` com filtros, `GET /api/pedidos/[id]`
completo (cadeia lida das `Etapa` gravadas, histórico e `podeDecidir`) e
`POST /api/pedidos/[id]/decisoes`, com o `UPDATE` condicional do ADR 0004 — que é o mesmo
mecanismo já usado aqui no `UPDATE` condicionado a `situacao: 'rascunho'`. Os artboards são
`Aprovacoes`, `AprovacoesC` e `PedidoDetalhe`, e é a Sprint 6 que acrescenta o item `Aprovações`
ao menu do cabeçalho.

Para exercitar a Sprint 6 é preciso, de novo, criar faixas (pela tela de alçada, como Marina) e
um fornecedor por fora do seed, e um pedido submetido por Caio — exatamente o preparo que a
Sprint 8 elimina.

---

## Sprint 6 · Tela 2 — Aprovação — entregue em 2026-10-30

Os **41 critérios numerados** e a *Definition of done* foram exercitados nesta rodada: os 26 de
rota por `curl` contra o servidor, critério a critério, e os 15 de tela pelo navegador embutido,
com leitura da árvore de acessibilidade, medição de foco e de largura. A avaliação pelo agente
`evaluator` ainda não rodou — o que está abaixo é a entrega do coder.

**Esta sprint foi escrita por duas sessões.** Uma terceira sessão abriu a Sprint 6 em paralelo,
no mesmo checkout e sem worktree, e as duas se sobrescreveram por algumas horas antes de a
colisão ser notada. A sessão mais antiga entregou a camada de rota e de domínio; esta entregou o
seed, a camada de tela e a verificação. A árvore final compila, passa lint e passa os 26 casos —
mas quem revisar deve saber que `Cabecalho.tsx`, `globals.css`, `tipos.ts`, `pedidos.ts`,
`DialogoDeRejeicao.tsx`, `DetalheDoPedido.tsx` e `app/pedidos/[id]/page.tsx` tiveram dois
autores. O relato está em `sprint-06-COLISAO-duas-sessoes.md`, na pasta de notas das sessões.

### Pronto

- `app/api/pedidos/route.ts` — `GET` com `situacao` repetível, `obraId`, `page` e `perPage`
  (padrão 50, teto 100). O `where` é um `OR` de duas famílias: o submetido, que qualquer sessão
  vê, e o rascunho, que só o criador vê. A privacidade do rascunho é parte da consulta, não um
  filtro da tela — e é o que a torna impossível de esquecer.
- `app/api/pedidos/[id]/route.ts` — `GET` completo: cabeçalho, snapshot da faixa, itens, a cadeia
  lida das `Etapa` gravadas, o histórico das decididas, `etapaAtual` e `podeDecidir`.
- `app/api/pedidos/[id]/decisoes/route.ts` + `src/server/decisao.ts` — a decisão como **uma**
  escrita condicionada ao estado que a autoriza (ADR 0004). O `where` do `updateMany` é o
  contrato inteiro: a etapa é esta, é desta pessoa, está pendente, o pedido está pendente e
  `pedido.etapas.none({ ordem: { lt: alvo }, situacao: 'pendente' })`. Zero linhas vira 409.
  Etapa e situação do pedido mudam na mesma transação.
- `src/domain/schemas.ts` — `decisaoSchema` (motivo de 3 a 500, cobrado só na rejeição) e
  `filtroDePedidosSchema` (situação do conjunto fechado, página e tamanho lidos de texto).
- `src/server/pedido.ts` — `publicar`, `resumir`, `cadeiaDoBanco`, `podeDecidirAgora`, mais os
  `include` `COM_ITENS` e `PARA_LISTA`.
- `prisma/seed.ts` — **quatro fornecedores**. Era o furo que travava a sprint: `submissaoSchema`
  exige `fornecedorId` e o seed não tinha nenhum, então num banco recém-semeado ninguém submetia
  pedido e a tela 2 não tinha o que decidir. `docs/spec/01-fundacao.json` (s1f5) passou a cobrar
  isso, e `npm run spec:md` rodou.
- `app/pedidos/page.tsx` + `src/ui/componentes/ListaDePedidos.tsx` — a tela do artboard
  `Aprovacoes`: as nove colunas do enunciado, abas de situação, filtro por obra, paginação e os
  três estados. Abre em **Aguardando minha decisão** para quem decide, com a saída do filtro ao
  lado da frase que o anuncia.
- `app/pedidos/[id]/page.tsx` + `src/ui/componentes/DetalheDoPedido.tsx` — o detalhe dos
  artboards `AprovacoesC` e `PedidoDetalhe`: dados gerais, itens (tabela no desktop, cartões em
  tela estreita), histórico, a regra aplicada lida do snapshot e a barra de decisão.
- `src/ui/componentes/CadeiaDoPedido.tsx` — `TrilhaDaCadeia` (pastilhas da linha da lista) e
  `CadeiaVertical` (o trilho do detalhe), com `faseDaEtapa` distinguindo os cinco estados.
- `src/ui/componentes/DialogoDeRejeicao.tsx` — motivo obrigatório, armadilha de foco, `Esc` e
  foco devolvido ao gatilho.
- `src/ui/componentes/estados.tsx` — `EsqueletoDeLista`, `Vazio` e `CaixaDeErro` num lugar só.
- `src/ui/tipos.ts` e `src/ui/pedidos.ts` — `EtapaPublica`, `ResumoDePedido`, `PaginaDePedidos`,
  `DecisaoPublica`, `listarPedidos` e `decidirPedido`.
- `src/ui/componentes/Cabecalho.tsx` — o item **Aprovações**, só para quem a matriz autoriza a
  decidir.
- Oito divergências novas de artboard declaradas em `docs/spec/base.json`.

### Decisões, com motivo

- **A decisão não relê o pedido para conferir: ela condiciona a escrita.** `Decisao.validar`
  roda antes, mas só para produzir a mensagem boa no caso comum — fora de ordem, fora da cadeia e
  cadeia concluída saem de lá com texto próprio. A última palavra é a contagem de linhas do
  `updateMany`. Entre validar e escrever, outra requisição pode decidir a mesma etapa; é
  exatamente essa janela que o ADR 0004 fecha, e conferir em memória antes de escrever é a
  corrida que ele rejeita.
- **A corrida foi exercitada, e o que ela prova é o resultado, não o caminho.** Dois `POST` em
  paralelo na mesma etapa deram **um 200 e um 409**, com **uma** linha decidida no banco. Vale
  registrar o detalhe: com SQLite as transações são serializadas, então o perdedor costuma ser
  barrado já na validação — a mensagem que voltou foi a de `Decisao.validar`. O `UPDATE`
  condicional é a rede embaixo, para o caso em que as duas leiam o mesmo estado; ele não deixou
  de valer por não ter sido o que pegou desta vez.
- **`GET /api/pedidos` não ganhou filtro de "aguardando minha decisão".** O contrato declara
  `situacao` e `obraId`, e mais nada. A aba pede os pendentes e guarda aqueles em que
  `podeDecidir` é verdadeiro — inventar um terceiro parâmetro faria a tela depender de rota que
  a SPEC não descreve. O preço é que o recorte é da página carregada, e o rodapé diz isso com
  todas as letras: "N de M pendentes aguardam você nesta página".
- **A lista virou tabela de nove colunas, e o artboard desenha faixas.** As informações são as
  mesmas; o enunciado do case pede nove colunas e a tabela é o que torna isso verificável em vez
  de inferido. A linguagem visual do mockup fica dentro das células. Divergência declarada.
- **O id da sessão entra na chave do `useRecurso`**, no detalhe e na lista. `podeDecidir` é
  resposta **para uma sessão**: trocar de pessoa pelo cabeçalho troca a pergunta, e o
  `router.refresh()` do seletor renderiza o Server Component de novo mas não refaz o `fetch` do
  cliente. Sem a sessão na chave, a tela poderia anunciar a vez de quem acabou de sair. Não
  cheguei a reproduzir essa tela velha — o caso que me fez olhar era clique meu no elemento
  errado —, então isto é precaução raciocinada, não correção de defeito observado.
- **Nenhum botão de decisão fica apagado em silêncio, e a explicação é diferente para cada
  motivo.** São quatro: rascunho sem cadeia, papel que não decide, cadeia concluída (aprovada ou
  rejeitada) e não é a sua vez — esta última ainda se divide entre quem está na cadeia e quem
  não está. Uma frase genérica obrigaria quem lê a adivinhar qual é o seu caso.
- **O 409 que chega depois do clique não é defeito: é a premissa caindo.** A tela mostra a
  explicação e **relê** o pedido, sem recarregar a página. Verificado: com o detalhe aberto como
  aprovadora da vez, aprovei o mesmo pedido por `curl` e cliquei em Aprovar na tela — veio o
  aviso e a cadeia se redesenhou com a etapa seguinte.
- **O diálogo valida com o mesmo schema Zod do servidor**, `Schemas.validarDecisao`. Duas
  validações para a mesma coisa discordam na primeira mudança, e quem paga é quem escreve um
  motivo que a tela aceita e a rota recusa.
- **A mensagem de `NAO_E_SUA_VEZ` para quem está na cadeia mudou** de "há uma etapa anterior
  aguardando decisão" para "outra etapa da cadeia está em decisão". A frase antiga era falsa no
  caso mais comum de corrida: quem já teve a sua etapa aprovada e clica de novo não tem etapa
  **anterior** nenhuma pendente — tem uma posterior.
- **`Aprovações` e `Pedidos` apontam para a mesma rota, em abas diferentes** (`?aba=para-mim` e
  `?aba=todos`). O artboard `PedidoDetalhe` desenha os dois itens; duas rotas para a mesma tabela
  seriam duas telas a manter dizendo a mesma coisa. Sem `?aba=`, quem decide cai na própria fila
  — o critério vale para `/pedidos` puro, não só para o link do menu.
- **A lista de rascunhos que a Sprint 5 pôs em `/pedidos` virou a aba "Meus rascunhos"**, servida
  pela mesma rota. A garantia continua sendo o `where` do servidor: Amanda pedindo
  `situacao=rascunho` recebe zero, e o rascunho de Caio não aparece nem para Caio sob "Todos".
- **O admin continua recebendo 403 ao decidir.** O contrato da feature diz "aprovador ou admin",
  mas a matriz da Sprint 3, já avaliada, dá `decidir: false` ao admin. É a mesma divergência que
  a Sprint 5 registrou para `submeter_pedido`: mudar a matriz reprovaria uma sprint aprovada, e o
  critério 25, que é o que esta sprint cobra, só nomeia comprador e visualizador.
- **O critério 26 foi demonstrado com montagem direta no banco.** "O criador que também é o
  aprovador da vez PODE decidir" não é alcançável pelas rotas, porque a matriz dá
  `criar_pedido: false` ao aprovador — nenhum aprovador consegue criar pedido. Transferi a autoria
  de um pedido submetido para a aprovadora da vez e decidi por `curl`: 200. O que a sprint cobra é
  que **não exista** restrição de segregação de função no caminho da decisão, e não existe.

### Pendências

- **Nenhum caso automatizado novo.** A suíte segue em 26, que é o topo da faixa de 12 a 25 que o
  critério 40 da Sprint 2 fixa — e acrescentar caso faria uma sprint aprovada passar a falhar. É
  a **terceira** sprint travada pelo mesmo limite (Sprint 4, Sprint 5, Sprint 6). `src/server/
  decisao.ts` e `src/domain/pedido.ts` seguem sem cobertura automatizada, exercitados só por
  `curl`. Quem tocar o extra E2 deve cobri-los — ou revisar o limite no JSON da Sprint 2, que a
  esta altura é a decisão mais honesta.
- **A corrida não exercitou o caminho de zero linhas afetadas.** Com SQLite serializando as
  escritas, o perdedor é barrado na validação. Para provar o `updateMany` vazio seria preciso
  forçar duas transações a ler o mesmo estado — num banco com isolamento menos estrito, ou com
  um ponto de espera injetado no teste. O extra E2 é o lugar.
- **O contador por aba do artboard `Aprovacoes` não existe**, porque `GET /api/pedidos` devolve o
  total de uma consulta só. Cinco contagens exigiriam cinco chamadas por carga.
- **`src/ui/componentes/RegrasDaAlcada.tsx` continua com as suas próprias cópias** de
  `Esqueleto`, `Vazio`, `CaixaDeErro` e das constantes de estilo. `estados.tsx` nasceu nesta
  sprint e as telas novas o usam; migrar a tela 3 é mexer em sprint aprovada, e ficou de fora.
- **A fidelidade aos artboards foi verificada por leitura e por navegador, não por captura
  comparada** — mesma pendência das Sprints 3, 4 e 5. Os três `.dc.html` foram lidos do canvas
  para arquivo local nesta rodada e **não** estão versionados.
- **Duas sessões escreveram esta sprint** (ver o aviso no topo). Os arquivos de autoria dupla
  merecem uma passada de revisão com olhos frescos.
- **O banco foi devolvido ao estado do seed**: 5 usuários, 3 obras, 4 fornecedores, zero faixas,
  zero pedidos. As faixas e os pedidos usados na verificação foram criados pelas rotas das
  Sprints 4 e 5 e apagados. O seed completo é da Sprint 8.

### Próxima sprint começa em

As três rotas de decisão e as duas telas funcionando de ponta a ponta: entrando como Amanda e
depois como João, a mesma URL mostra filas diferentes; aprovar como Amanda libera a decisão do
João; rejeitar exige motivo, encerra o pedido e nenhuma etapa posterior se torna decidível; e
editar ou apagar a faixa depois da submissão não muda uma linha da cadeia gravada.

A Sprint 7 é a passada de estados, validações e responsividade sobre o que as Sprints 4, 5 e 6
deixaram. Vale saber o que esta sprint já cobriu, para não refazer: as duas listas novas nascem
com carregando, vazio e erro com repetição; o diálogo de rejeição já prende o foco, fecha com
`Esc` e devolve o foco ao gatilho; a cadeia já empilha e a tabela de itens já vira cartões em
390 px. O que esta sprint **não** fez é a passada sistemática — teclado em todas as telas,
contraste medido, `prefers-reduced-motion`, e os estados das telas das sprints anteriores.

---

## Sprint 7 · Estados, validações e responsividade — em 2026-10-30

### Pronto

- `src/ui/componentes/estados.tsx` ganhou **`<Recurso>`**: o componente que escolhe entre
  esqueleto, caixa de erro com repetição, vazio e conteúdo **pela forma do hook**. Quem chama
  entrega o `Recurso<T>` que `useRecurso` devolve, o que desenhar com os dados e o que dizer
  quando não há nenhum; a ordem dos estados — esqueleto antes de tudo — está escrita uma vez só.
- **A tela 3 foi migrada** (`RegrasDaAlcada.tsx`): saíram as cópias locais de `Esqueleto`,
  `Vazio`, `CaixaDeErro` e de sete constantes de estilo. Eram dois recursos aninhados escritos à
  mão numa cadeia de seis ternários; viraram dois `<Recurso>`. É a pendência que a Sprint 6
  deixou nomeada, e era o coração da s7f1.
- **A tela de entrada foi migrada** (`ListaDeUsuarios.tsx`): tinha a sua própria máquina de
  estados com `useState` + `useEffect` e três blocos de desenho próprios. Agora usa `useRecurso`
  e `<Recurso>` como as outras, e passou a ter um vazio de verdade — antes era uma caixa
  tracejada ad hoc.
- **A lista de pedidos** (`ListaDePedidos.tsx`) também passou por `<Recurso>`, com
  `estaVazio={() => linhas.length === 0}`: a aba "aguardando minha decisão" é um recorte da
  página carregada, e é o recorte que pode estar vazio com a página cheia.
- `FormularioDePedido.tsx` trocou a sua `ErroComRepeticao` local pela `CaixaDeErro`
  compartilhada.
- **Campo do servidor sem input correspondente não some mais.** `chavesAncoradas` e
  `mensagensSemAncora`, em `src/ui/formulario-de-pedido.ts`, separam o que o formulário sabe
  ancorar do que não sabe; o que não sabe vira mensagem geral, com lista.
- **Corrigir o campo limpa o erro sem novo envio na tela 3.** `EditorDeFaixa` guarda o conjunto
  de campos mexidos desde a última recusa e os desconta dos problemas — vale tanto para a recusa
  local quanto para a que veio do servidor em `error.fields`.
- **A tabela de itens do formulário vira cartões abaixo de 768px** (`ItensDoPedido.tsx`), do
  mesmo jeito que o detalhe do pedido já fazia: `hidden md:block` na tabela, `md:hidden` na lista
  de cartões. `Campo` ganhou `variante` para que tabela e cartão não produzam dois ids iguais no
  DOM.
- **Alvo de toque de 44px abaixo de 768px**, via `ALVO_DE_TOQUE` em `estilos.ts`, nos botões
  pequenos de todas as telas (paginação, ações da linha, setas de ordenação, adicionar item,
  sair, voltar, repetir).
- `estilos.ts` recebeu `ALVO_DE_TOQUE`, `BOTAO_PEQUENO`, `BOTAO_ICONE`, `CABECALHO` e `CODIGO`,
  que estavam copiados em três arquivos.
- **Sete casos automatizados novos** em `src/ui/formulario-de-pedido.test.ts`, num projeto
  Vitest `ui` novo. A suíte foi de 26 para 33.

### Decisões, com motivo

- **`<Recurso>` existe porque o critério fala da forma do hook, não do cuidado de cada tela.**
  Quatro telas tinham a mesma cadeia de ternários, e cada cópia divergia um pouco — a da tela 3
  nem tinha botão de repetir no vazio, a da entrada tinha um esqueleto de outra forma. Enquanto o
  acerto depender de alguém lembrar de escrever quatro ramos na ordem certa, a quinta lista vai
  nascer errada. Agora o esqueleto antes do vazio é propriedade do componente.
- **`estaVazio` é parâmetro, e não `dados.length === 0`.** "Não há nada" nem sempre é a lista
  vazia: a fila do aprovador é um recorte feito depois do hook. Sem o parâmetro, a tela que
  filtra voltaria a decidir sozinha quando mostrar o vazio — que é justamente o que esta feature
  tira dela.
- **O 44px é `max-md:`, e não global.** O artboard `Estados` desenha `.btn-sm` com 38px e, na
  mesma folha, cobra "alvos de toque de 44px". As duas coisas não se contradizem: 38px é alvo de
  ponteiro, 44px é alvo de dedo. Subir todo botão pequeno para 44px no desktop mudaria a
  densidade de três telas aprovadas por causa de um critério que fala de toque.
- **Falha ao entrar não ganhou caixa de erro com repetição.** Não há leitura a refazer — o
  caminho de volta é clicar na pessoa de novo —, e um botão "Tentar novamente" que só fecha o
  aviso promete uma ação que ele não faz.
- **Tabela e cartões renderizam os dois, e a troca é por `md:`.** Medir a largura em JavaScript
  erraria a primeira pintura. O preço é o mesmo input desenhado duas vezes; por isso `variante`,
  que é o que impede `erro-itens-0-quantidade` de existir em duplicata no DOM.
- **O teto de casos da Sprint 2 foi revisto**, de "entre 12 e 25 casos" para "ao menos 12 casos"
  em `docs/spec/02-dominio-e-testes.json`, com `npm run spec:md` rodado. Um teto no **número** de
  testes pune cobertura, e a intenção do critério — granularidade — já está no piso e na regra
  "um critério, uma afirmação" do ciclo. Era a pendência que travou as Sprints 4, 5 e 6.
- **Os casos novos foram para um projeto `ui`, não para `dominio`.** `src/ui/
  formulario-de-pedido.ts` não é domínio, e misturá-lo ali faria a contagem do critério da
  Sprint 2 falar de duas coisas. O que eles afirmam são **chaves** de `error.fields`, nunca o
  texto de uma mensagem — a mesma regra que a suíte do domínio segue.
- **O subtítulo do cartão de faixas deixou de mentir.** Com zero obras ele dizia "Carregando as
  faixas desta obra…" ao lado do vazio que diz que não há obra nenhuma.

### Como os estados foram demonstrados

O servidor de desenvolvimento ficou de pé (é compartilhado); a falha foi injetada na fronteira
do `fetch` do navegador, que é por onde a queda do servidor chega à tela — `FalhaDaApi`
`SEM_RESPOSTA`, o mesmo caminho.

- **Lista de pedidos, 390px:** com o `fetch` rejeitando, trocar de aba acendeu "Não foi possível
  carregar os pedidos" com "Tentar novamente". Clicar no botão elevou o contador de chamadas de
  1 para 2 **sem recarregar a página** (o contador vive em `window` e sobreviveu;
  `performance.getEntriesByType('navigation').length` continuou 1). Com o `fetch` restaurado, o
  mesmo botão voltou ao esqueleto e depois aos dados.
- **Regras da alçada, 390px:** mesma caixa, mesmo botão, mesma recuperação — é a tela migrada.
- **Banco sem obras:** `/api/alcada` respondendo `[]` → "Nenhuma obra cadastrada · Sem obra não
  existe alçada. Rode `npm run seed` para popular a demonstração." O banco não foi apagado para
  isso.
- **Obra sem faixa:** estado real do seed → "Nenhuma faixa nesta obra · … nenhum pedido dela
  poderá ser submetido".
- **Banco sem pedidos:** estado real do seed → vazio da aba, nunca tabela com zero linhas.
- **Resposta lenta (3 s):** o esqueleto permaneceu os 3 segundos inteiros, `aria-busy="true"`,
  `aria-label="Carregando os pedidos"`, sem nenhum texto de vazio na tela e sem `<table>`; só
  depois veio a tabela.
- **Validação por campo:** quantidade `-5` no item 1 acendeu `erro-cartao-itens-0-quantidade`
  dentro do item, e nada no topo. Trocar para `5` apagou o erro sem novo envio. Salvando um
  rascunho com `abc` na quantidade, o 422 do servidor voltou com `fields` e acendeu
  `itens.0.descricao`, `itens.0.quantidade` e `itens.0.precoUnitario` nos inputs de mesmo nome,
  com "Revise os campos destacados." como alerta geral.
- **390px:** `/entrar`, `/pedidos`, `/pedidos/40`, `/pedidos/novo` e `/alcadas` — com e sem
  dados — não rolam na horizontal (`scrollTo(9999, 0)` deixa `scrollX` em 0 nas cinco).
  `document.documentElement.scrollWidth` reporta 545 em `/alcadas` com faixas, mas
  `document.body.scrollWidth` é 390 e a página não rola: é a sobreposição de desenvolvimento do
  Next fora do fluxo do `body`, não a tabela — cujo `overflow-x-auto` contém os 620px dela
  (`clientWidth` 325, `scrollWidth` 620).
- **768px:** a tabela de itens do formulário tem `display: none` em 390px e `block` em 1024px; a
  lista de cartões, o inverso.

### Pendências

- **Links de texto em prosa seguem abaixo de 44px** — a marca no cabeçalho, a trilha "Pedidos de
  compra / Novo" e "configurar a alçada da obra" dentro de uma frase. São 15 a 23px de altura de
  linha, e esticá-los a 44px quebraria o parágrafo. O critério 15 e o artboard falam de botões;
  os botões estão todos em 44px no toque. Fica declarado em vez de silenciado.
- **O vazio de obras não tem o botão "Cadastrar obra" do artboard.** A tela de cadastros está
  fora do recorte (divergência declarada na SPEC, item do menu "Empresa"), e o botão não teria
  para onde levar. `Vazio` já aceita `acao` quando a rota existir.
- **A fidelidade aos artboards segue verificada por leitura e por navegador, não por captura
  comparada** — mesma pendência das Sprints 3 a 6.
- **Nenhum caso automatizado cobre o React.** Os sete casos novos cobrem as funções puras por
  trás da ancoragem; a renderização dos estados foi verificada no navegador. Uma suíte de
  componente exigiria jsdom e Testing Library, que nenhuma sprint do recorte declara.
- **`src/server/decisao.ts` e `src/domain/pedido.ts` continuam sem cobertura automatizada.** O
  teto que travava isso caiu nesta sprint, mas acrescentar caso de domínio é escopo da Sprint 8
  ou do extra E2, não desta.
- **O banco foi devolvido ao estado do seed**: 5 usuários, 3 obras, 4 fornecedores, zero faixas,
  zero pedidos. As duas faixas e o pedido #40 usados na verificação foram criados pelas rotas das
  Sprints 4 e 5 e apagados por `npm run seed`.

### Próxima sprint começa em

As cinco telas com os três estados vindos de um lugar só, validação por campo ancorada por
`error.fields` nas duas pontas e 390px sem rolagem horizontal. `docs/sprints/sprint-08.md` — o
seed completo, a prova e a documentação — começa com a suíte em 33 casos, sem teto no caminho, e
com `src/ui/componentes/estados.tsx` como o lugar onde qualquer lista nova nasce completa.

---

## Sprint 8 · Seed completo, prova e documentação — entregue em 2026-10-30

A sprint que o avaliador lê primeiro. O código já funcionava desde a Sprint 7; o que faltava era
tornar isso evidente para quem nunca viu o projeto — sem preparo manual, sem cadastrar nada.

### Pronto

- **`prisma/seed.ts` completo.** 3 obras, **6** usuários cobrindo os quatro papéis, 4
  fornecedores, **3 faixas em 2 obras** e **8 pedidos**, um em cada ponto do ciclo:

  | # | Total | Situação | O que prova |
  |---|---|---|---|
  | 1001 | R$ 8.388,00 | rascunho | rascunho completo de Caio, submetível |
  | 1002 | R$ 0,00 | rascunho | rascunho **incompleto de Rafael** — Caio pedindo `/api/pedidos/1002` recebe 404 |
  | 1003 | R$ 24.420,00 | pendente | pendente na **1ª etapa**, fila de Amanda |
  | 1004 | R$ 16.300,00 | pendente | pendente na **2ª etapa**, 1ª aprovada, fila de João |
  | 1005 | R$ 3.176,00 | aprovado | aprovado por inteiro, obra Galpão |
  | 1006 | R$ 30.960,00 | rejeitado | rejeitado na 1ª com **motivo** no histórico |
  | 1007 | R$ 4.485,00 | pendente | **faixa editada após a submissão**: cadeia gravada = João; faixa de mesmo id hoje = "até R$ 10.000,00 → Amanda" |
  | 1008 | R$ 14.600,00 | aprovado | **faixa apagada após a submissão**: `faixaId` nulo, `faixaLimiteCentavos` = 2.000.000 |

- **A alçada semeada é desenhada para os estados, não para parecer realista.** Aurora tem faixa
  com teto *e* faixa aberta (todo valor cai em alguma regra); Galpão tem teto de R$ 5.000,00 e
  **nenhuma faixa aberta** (é por ali que `SEM_REGRA_APLICAVEL` fica alcançável); Reforma da Sede
  não tem faixa nenhuma (o vazio da tela 3).
- **`scripts/verificar.sh`** — quatro blocos comentados, status HTTP de cada chamada, saída 0 só
  quando todos os esperados ocorrem: 409 `NAO_E_SUA_VEZ` fora de ordem, 403 `SEM_PERMISSAO` em
  `PUT /api/faixas/{id}` como aprovador (e 200 como admin), 422 `SEM_REGRA_APLICAVEL` com o
  rascunho preservado, e a corrida com exatamente um 200 e um 409 mais a contagem de etapas
  decididas no banco. Falha cedo, com instrução, se o servidor estiver fora do ar ou o banco fora
  do estado do seed.
- **`scripts/capturar-telas.mjs`** — captura as nove imagens por CDP (Chrome headless + o
  `WebSocket` global do Node), sem dependência nova no `package.json`. Recapturar depois de mexer
  em tela é um comando.
- **`docs/screenshots/`** — nove PNG a 2× (2,5 MB): as três telas do enunciado, o detalhe do
  pedido, a fila do aprovador, o formulário vazio, a prova do snapshot (`#1007`), a entrada e a
  lista em 390 px.
- **`README.md` reescrito** como documentação da entrega: instalação, execução, seed, quem entrar
  como, os oito pedidos, roteiro de avaliação em 5 minutos, verificação por `curl`, tecnologias
  com motivo, modelagem da alçada (modelada/calculada/persistida), comunicação front-back com a
  tabela de rotas e exemplos de `curl`, consistência e concorrência, a tabela do que cada papel vê
  e pode fazer, estados e validações, divergências deliberadas e o que mudaria em produção.
- **`docs/enunciado.md`** — o `README.md` original do case, preservado na íntegra.
- **`docs/pull-request.md`** — a descrição do PR pronta, com os marcadores de e-mail e telefone
  por preencher. **O PR não foi aberto**: é ação externa, e quem decide é a autora.
- **`.gitignore`** passou a versionar `.env.example`, que estava sendo excluído por `.env*`.

### Decisões, com motivo

- **O seed escreve o estado direto, em vez de encená-lo pelas rotas.** Os pedidos `#1007` e
  `#1008` são precisamente estados que nenhuma sequência de chamadas produz: "faixa editada
  **depois** de um pedido ter sido submetido sob ela" exigiria um segundo passo manual, que é o
  que esta sprint existe para eliminar. O que importa demonstrar é o estado — e ele é o que o
  ADR 0001 promete.
- **Todo id é literal, inclusive o dos pedidos, das etapas e dos itens**, e **toda data é
  literal**. Sem isso, `db:reset && seed` não reproduziria o mesmo estado e as capturas do README
  envelheceriam a cada execução. `Pedido.id` é `AUTOINCREMENT`, então o seed também zera
  `sqlite_sequence`: sem isso o **próximo** pedido criado pela interface dependeria do histórico
  do banco.
- **Um sexto usuário, Rafael Souza (comprador).** A privacidade do rascunho só é demonstrável com
  dois compradores: sem o segundo, não há rascunho alheio para responder 404.
- **Os pedidos começam em 1001.** O produto cita o pedido como "#1002" (é o que o schema já
  registrava e o que os artboards desenham), e quatro dígitos leem melhor que `#3`.
- **O script de verificação cria os próprios pedidos para o que escreve.** A corrida consumiria
  um pedido do seed e tornaria o script não repetível — a segunda execução daria 409/409. Os
  blocos que só leem (fora de ordem, 403) usam o seed, porque é isso que prova que o seed está
  certo. O rascunho do bloco 3 é apagado ao fim; o da corrida não tem como ser (pedido submetido é
  imutável), e o script diz isso na saída.
- **`node` e não `jq` no script.** O projeto já exige Node; exigir `jq` faria o script falhar na
  máquina de quem só seguiu o README.
- **As capturas saem por CDP, não por Playwright.** O Node 25 tem `WebSocket` global e o Chrome
  está na máquina: falar o protocolo direto evitou uma dependência de desenvolvimento inteira
  para tirar nove imagens. A sobreposição de desenvolvimento do Next é removida **na captura**,
  por `Runtime.evaluate` — nenhuma linha do produto muda por causa disso.
- **A altura de cada captura é medida com a janela curta de propósito.** Numa janela alta,
  `scrollHeight` devolve a altura da própria janela quando o conteúdo é menor, e as imagens saíam
  com rodapé vazio e o cabeçalho fixo repetido no fim.
- **O `README.md` da raiz virou a documentação da entrega, e o enunciado foi para
  `docs/enunciado.md`.** É o `README.md` que o enunciado manda preencher, e é o primeiro arquivo
  que o avaliador abre. Preservar o original em `docs/` custa um arquivo e evita perder o texto
  contra o qual a solução é lida.
- **A captura da tela 3 aponta para `?obra=cseedobraaurora000001`.** Sem o parâmetro a tela abre
  no Galpão, que tem uma faixa só; a Aurora tem as duas do exemplo do enunciado ("até
  R$ 10.000,00 → Amanda" e a aberta "→ Amanda → João").

### Verificações desta rodada

- `npx tsc --noEmit` limpo, `npm run lint` limpo, `npm test` com **33 casos** (25 `dominio`, 7
  `ui`, 1 `api`) — a suíte não mudou nesta sprint.
- `./scripts/verificar.sh` — 12 asserções, todas verdes, saída **0**. Os dois caminhos de falha
  também foram exercitados: servidor fora do ar e banco sem o pedido do seed saem com 1 e a
  instrução certa.
- **Reprodutibilidade provada por dump.** `npm run seed` rodado sobre banco já populado produz um
  dump SQL idêntico (md5 `20df43d2…`). E um banco criado **do zero** em outro caminho
  (`prisma migrate deploy` + `seed`) tem dump idêntico ao de `dev.db` quando se desconta a tabela
  `_prisma_migrations` — que guarda o instante em que cada migration rodou, e não dado da
  aplicação.

### Pendências

- **`npm run db:reset` não pôde ser executado nesta rodada.** O Prisma 7 traz um guard que
  **recusa `migrate reset` quando detecta que foi invocado por um agente**, exigindo consentimento
  explícito da pessoa. A ordem da sprint era não forçar, e não foi forçado. A reprodutibilidade
  ficou provada pelos dois caminhos descritos acima, que cobrem o que o critério 7 pergunta; falta
  só o carimbo do comando exato, que leva um `npm run db:reset && npm run seed` de quem tiver o
  terminal.
- **O e-mail e o telefone do PR continuam como marcadores** em `docs/pull-request.md`, e **o PR
  não foi aberto**. Abrir é ação externa e irreversível; a decisão é da autora.
- **A tela 3 diz "a cadeia é formada na criação do pedido, pelo total".** Está errado pelo
  vocabulário do produto: a cadeia é formada na **submissão** (ADR 0001, GLOSSARY). O texto é da
  Sprint 4, aparece na captura `tela-3-regras-da-alcada.png` e **contradiz o README**, que explica
  o contrário. Não foi corrigido porque mexer em tela de sprint aprovada está fora deste recorte —
  mas é uma linha, e vale a correção antes da entrega.
- **A divergência declarada sobre o aviso "Valor sem faixa aplicável" ficou desatualizada.** Ela
  justifica não escrever "Decisão documentada no README" porque "o README é da Sprint 8 e ainda
  não existe". O README existe agora. Quem revisar `docs/spec/base.json` pode rever o item.
- **`scripts/tmp/`** (três arquivos de cenário da Sprint 6) continua no checkout, sem uso desde
  que o seed passou a montar o cenário. Deveria sair antes do commit; a remoção foi barrada pelo
  harness nesta sessão.
- **Nenhum caso automatizado novo.** `src/server/decisao.ts` e `src/domain/pedido.ts` seguem
  cobertos só por `curl` — agora pelo `scripts/verificar.sh`, que é repetível e versionado, o que
  é melhor do que o `curl` ad hoc das sprints anteriores, mas não é suíte. Continua sendo o
  extra E2.
- **As capturas dependem do `next dev`.** São do servidor de desenvolvimento, não do build de
  produção; a diferença visível é nenhuma depois de remover a sobreposição, mas quem quiser rigor
  recaptura contra `npm run build && npm start`.

### Próxima sprint começa em

Não há próxima sprint no recorte: as oito estão entregues e os extras E1 a E4 são opcionais. O que
falta para a entrega do case é **humano, não técnico** — preencher e-mail e telefone em
`docs/pull-request.md`, decidir sobre as duas correções de uma linha listadas acima, commitar e
abrir o PR contra `ObraFlow/obraflow-case` até 31/10, com um dia de folga sobre o prazo de 01/11.

---

## Sprint E3 · Extra — Gráfico na administração — entregue em 2026-10-30

Extra de **menor prioridade** do backlog: a própria SPEC o classifica como o único que não melhora
critério nenhum do enunciado diretamente, e a sua definition of done é literalmente "o gráfico
existe e não atrapalha nenhuma tela". Foi entregue nesse tamanho — uma rota, um componente, uma
tela nova — e **nenhuma linha das oito sprints aprovadas foi reescrita**.

### Pronto

- **`GET /api/pedidos/resumo`** (`app/api/pedidos/resumo/route.ts`) — contagem agrupada por
  situação, com `obraId` opcional na query. Responde `{ porSituacao: { rascunho, pendente,
  aprovado, rejeitado } }` com as quatro chaves **sempre** presentes, inclusive em zero.
- **Ação nova na matriz: `ver_resumo`** (`src/server/permissao.ts`), verdadeira só para `admin`.
  Foi acrescentada à lista `ACOES`, e o `Record<Papel, Record<Acao, boolean>>` obrigou o
  compilador a cobrar a decisão nos quatro papéis — que é exatamente o que o comentário da matriz
  promete desde a Sprint 3.
- **Tela `/admin`** (`app/admin/page.tsx`) com o cartão "Situação dos N pedidos" do artboard
  `Dashboard`, desenhado por `src/ui/componentes/GraficoDeSituacoes.tsx`.
- **Item "Administração" no menu** (`src/ui/componentes/Cabecalho.tsx`), guardado por
  `pode(papel, 'ver_resumo')` — some para quem não é admin, como todos os outros itens.
- **Entrada `ver_resumo` em `AcessoNegado`**: quem chega a `/admin` pela URL sem o papel recebe a
  explicação de acesso negado, e não tela branca nem 404.
- `src/ui/tipos.ts` ganhou `ResumoDePedidos`; `src/ui/pedidos.ts` ganhou `pegarResumo(obraId?)`.

### Onde a tela ficou, e por quê

A ordem da sprint mandava avaliar duas opções — **(a)** uma seção no topo de `/alcadas` ou **(b)**
uma rota nova — e preferir (a) *se ela não atrapalhasse a tela de alçadas*. Ficou **(b)**, e a
condição da preferência é a razão:

1. **`/alcadas` tem critério de fidelidade a um artboard que não desenha gráfico nenhum.** A regra
   do projeto é "fidelidade total ao artboard da sua sprint": a tela de alçada responde ao artboard
   `Alcadas`, e o gráfico pertence ao artboard `Dashboard` — que é **outra tela** no mesmo canvas,
   não uma seção daquela. Empurrar o cartão para o topo de `/alcadas` faria uma tela já aprovada
   divergir do desenho que ela foi aprovada por seguir.
2. **A inserção não seria uma linha.** `RegrasDaAlcada` devolve o `<main>` inteiro; o cartão teria
   de entrar *dentro* dele, acima do cabeçalho de "Regras de alçada" ou dentro da coluna das
   faixas. Qualquer um dos dois mexe na estrutura de um componente de 400 linhas cujos critérios
   já passaram — risco alto para o extra de **menor** retorno do backlog. A instrução da sprint é
   explícita: entre sofisticar o gráfico e não mexer no que funciona, não mexer.
3. **O artboard `Dashboard` existe e é uma tela de painel.** Dar-lhe um endereço próprio é o que o
   canvas já desenha, e deixa espaço para os KPIs e os cortes por faixa e por aprovador, se um dia
   saírem do "fora de escopo" — sem reabrir `/alcadas`.

O custo de (b) é um arquivo de página a mais e **duas linhas** em `Cabecalho.tsx` (o item de menu,
no mesmo padrão guardado dos outros três). É menos superfície tocada do que (a) custaria.

### Decisões

- **`rascunho` conta só o próprio, e isso é parte do `where`, não um filtro na tela.** O escopo de
  leitura do projeto diz que rascunho é privado de quem o criou, e a agregação não é uma visão
  privilegiada dos mesmos dados — é a mesma visão, contada. O `OR` da rota é o mesmo de
  `GET /api/pedidos`: submetidos para todos, rascunho só do criador. Na prática, como `admin` não
  pode criar pedido, `rascunho` é sempre 0 para quem vê esta rota — e é assim que deve ser.
- **O `where` está escrito na rota do resumo, e não importado da rota da lista.** Arquivo de rota
  exporta manipulador; não é lugar de onde outra rota puxa regra. Extraí-lo para `src/server/`
  obrigaria a reescrever `app/api/pedidos/route.ts`, que é de sprint aprovada — fora deste recorte.
  Fica anotado como dívida: **duas cópias do mesmo `OR`**, e a segunda tem de acompanhar a primeira
  se a regra de visibilidade mudar.
- **A query `obraId` reusa o schema da lista, recortado com `.pick({ obraId: true })`.** Mesmo
  formato de id, mesma mensagem, mesmo 422 com `fields`. O recorte existe porque esta rota não
  pagina: herdar `page` e `perPage` do schema inteiro faria a rota recusar quem não mandasse o que
  ela ignora (foi o que aconteceu na primeira tentativa, e o `curl` pegou).
- **Barras horizontais, uma por situação — divergência declarada do artboard.** O artboard empilha
  três segmentos e escreve a contagem *dentro* de cada um. Com os números reais do seed, o segmento
  de 1 em 6 fica com 17% da largura e o número não cabe; a 390px nenhum dos quatro cabe. Uma barra
  por situação põe o número **fora** da barra, e usa o mesmo idioma `.hbar-row` que o próprio
  artboard `Dashboard` já aplica nos dois cartões de baixo.
- **Quatro situações, e não as três do artboard.** O contrato da rota tem as quatro do domínio;
  omitir `rascunho` faria a soma das barras não bater com o total escrito no título.
- **As barras escalam pela maior contagem, não pelo total.** Pelo total, uma situação de 1 em 21
  viraria uma barra de 5%, indistinguível de zero. O percentual ao lado continua sendo sobre o
  total, porque é esse o número que interessa a quem lê. Contagem **zero** não ganha o piso de 3px
  que as demais ganham: é o que separa "nenhum" de "pouco".
- **A alternativa textual é o número visível, não um `aria-label`.** A contagem e o percentual são
  texto ao lado de cada barra, e a barra é `aria-hidden`. Barra colorida sozinha não comunica, e
  uma descrição escondida só serviria a quem usa leitor de tela — não a quem não distingue as cores.
- **Sem biblioteca de gráfico.** Quatro `<span>` com `width` em porcentagem resolvem; uma
  dependência nova no extra de menor prioridade do backlog seria o pior negócio do projeto.
- **Zero hexadecimal novo.** Os preenchimentos saem de tokens que já existiam — `neutro-350`,
  `aviso-texto`, `sucesso-acao`, `erro-texto` —, que são os mesmos tons da etiqueta de situação na
  versão sólida. Nenhum token novo entrou em `app/globals.css`.
- **Sem seletor de obra na tela.** A rota aceita `obraId` e isso está provado por `curl`; um
  seletor na tela seria estado novo, mais um caminho de erro e mais superfície — num extra cuja
  definition of done é "existe e não atrapalha".

### Verificações desta rodada

- `npx tsc --noEmit` limpo · `npm run lint` limpo · `npm test` com os **33 casos** verdes (a suíte
  não mudou: a sprint não acrescentou caso automatizado).
- `npm run build` limpo, com `/admin` e `/api/pedidos/resumo` na árvore de rotas. As provas por
  `curl` e as capturas foram feitas contra o **build de produção** (`next start`), não contra o
  `next dev`.
- `curl` como **admin**: `{"porSituacao":{"rascunho":0,"pendente":3,"aprovado":2,"rejeitado":1}}`
  — idêntico à contagem lida direto do SQLite (`SELECT situacao, COUNT(*) … GROUP BY situacao`:
  aprovado 2, pendente 3, rascunho 2, rejeitado 1), descontados os **dois rascunhos**, que são de
  Caio e de Rafael.
- `curl` como **aprovador**, **comprador**, **visualizador** e **sem sessão**: `403 SEM_PERMISSAO`
  nos quatro, com a mensagem nomeando o papel.
- **Privacidade do rascunho, provada pelos dois lados:** `GET /api/pedidos?situacao=rascunho` como
  Caio devolve `total=1, ids=[1001]`; como Rafael, `total=1, ids=[1002]` — cada um vê só o seu. No
  mesmo banco, o resumo do admin diz `rascunho: 0`. Os dois rascunhos existem e não entram na conta
  de ninguém.
- `?obraId=cseedobraaurora000001` devolve `{rascunho:0,pendente:3,aprovado:1,rejeitado:1}`, igual
  ao `SELECT … WHERE obraId = 'cseedobraaurora000001' AND situacao <> 'rascunho'`.
- **Os três estados, vistos na tela:** carregando e **erro com repetição** (com o `fetch` de
  `/api/pedidos/resumo` quebrado de propósito no navegador — a caixa de erro aparece, e "Tentar
  novamente", com o `fetch` restaurado, desenha o gráfico); **vazio** contra uma **cópia** do banco
  com `Pedido` zerado, servida num segundo `next start` — `/admin` mostra "Nenhum pedido para
  contar", nunca quatro barras a zero. O `dev.db` da demonstração não foi tocado.
- **Legível a 390px** (barra abaixo do rótulo, número e percentual na mesma linha do rótulo) e
  nenhuma mensagem de erro no console.
- **Nenhuma tela existente quebrou:** `/pedidos` e `/alcadas` revisitadas como Marina depois da
  mudança, iguais ao que eram; como Amanda, o menu não mostra "Administração" e `/admin` pela URL
  dá a explicação de acesso negado.

### Pendências

- **Nenhum caso automatizado novo.** `GET /api/pedidos/resumo` está provado por `curl` e contra o
  SQL do banco, mas não por Vitest. O caso que mais valeria — "rascunho alheio não entra na
  contagem" — continua sendo o extra **E2**.
- **O `OR` de visibilidade está duplicado** entre `app/api/pedidos/route.ts` e
  `app/api/pedidos/resumo/route.ts`. Unificá-lo em `src/server/pedido.ts` é uma extração limpa, mas
  toca rota de sprint aprovada e ficou fora deste recorte.
- **`scripts/verificar.sh` não cobre a rota nova.** Acrescentar um bloco "403 no resumo para quem
  não é admin" seria natural, mas o script é entregável da Sprint 8 e mexer nele estava fora do
  recorte. As chamadas estão registradas acima.
- ~~**A tela `/admin` tem um cartão só.**~~ **Resolvido na rodada seguinte** — ver a seção
  *Painel da administração completo*, abaixo. A autora pediu o artboard `Dashboard` inteiro, e ele
  foi implementado, inclusive a série temporal que a sprint E3 listava como fora de escopo.
- As pendências da Sprint 8 continuam de pé — em especial o e-mail e o telefone de
  `docs/pull-request.md`, o PR não aberto e as duas correções de uma linha lá listadas.

### Próxima sprint começa em

Nada em curso. Restam os extras **E1**, **E2** e **E4**, todos opcionais e nenhum iniciado — e,
antes deles, o que a Sprint 8 deixou escrito: a entrega do case é decisão humana (preencher o PR,
commitar, abrir contra `ObraFlow/obraflow-case`).

---

## Painel da administração completo — artboard `Dashboard` — entregue em 2026-10-31

Fora do recorte da Sprint E3, **a pedido explícito da autora**, que depois de ver o cartão isolado
pediu a tela 10 do canvas inteira: "queria isso mesmo e inclusive queria como está na tela de
mockup 10 · Painel do admin (KPIs e gráficos)". Entra aqui, e não como emenda da E3, porque
contradiz duas coisas que a sprint declarava: a série temporal estava em **fora de escopo**, e a
definition of done da E3 era "o gráfico existe". Misturar as duas apagaria o registro de que a
E3 foi entregue no tamanho em que foi pedida.

### Pronto

- **`GET /api/pedidos/painel?dias=7|30|90&obraId=`** (`app/api/pedidos/painel/route.ts`), restrita
  ao mesmo `ver_resumo`. Devolve, de **uma** leitura: os cinco KPIs com o par do período anterior,
  a série semanal por obra, o corte por faixa, o corte por aprovador, a fila de atenção, a lista
  de obras do seletor e dois totais auxiliares.
- **`src/domain/painel.ts`** — todas as derivações, puras: `recebeuAVezEm`, `etapaDaVez`,
  `concluidoEm`, `tempoAteDecisaoEmMs`, `paradoHaEmMs`, `janela`/`janelaAnterior`, `kpis`,
  `serieSemanal`, `porFaixa`, `porAprovador`, `filaDeAtencao`, `comUmaAssinatura`.
- **`src/domain/painel.test.ts` — 18 casos novos.** A suíte foi de **33 para 51**. É a dívida que
  o `PROGRESS` registrava desde a Sprint 8 ("nenhum caso automatizado novo"), paga na parte que
  mais precisava: a aritmética de tempo, que nenhum `curl` confere por inspeção.
- **`src/ui/componentes/PainelDoAdmin.tsx`** (filtros, KPIs, montagem) e
  **`PainelCartoes.tsx`** (série, corte por faixa, corte por aprovador, fila).
- **`src/ui/componentes/duracao.ts`** — `duracao`, `duracaoCurta`, `variacao` e `milReais`.
- `GraficoDeSituacoes` ganhou a propriedade `obraId` e continua lendo `/api/pedidos/resumo`.
- Dois tokens novos em `app/globals.css`: `--color-serie-azul` (#175cd3, a segunda série) e
  `--color-alerta-texto` (#b54708, o ícone do KPI de alerta e a barra do gargalo). Ambos lidos do
  artboard; nenhum hexadecimal solto entrou em tela.

### Decisões

- **Uma rota para a tela inteira, e não uma por cartão.** Os cinco KPIs e os quatro cartões saem
  do mesmo conjunto de pedidos lido num instante só. Em rotas separadas, decidir um pedido no meio
  das chamadas faria o topo dizer 21 e o gráfico dizer 22 — e o `agora` de cada cartão seria outro.
  A rota lê o relógio **uma vez** e passa o mesmo `agora` a todas as derivações.
- **Exceto a contagem por situação, que continua em `/api/pedidos/resumo`.** É o contrato dela
  desde a E3, e um número com duas fontes é um número que um dia diverge. O cartão recebe só o
  `obraId` do seletor e busca o resto sozinho. O período **não** chega a ele de propósito: "estado
  atual da cadeia" é do agora, não de uma janela.
- **"Quando a etapa recebeu a vez" é derivado, não gravado.** A primeira recebe na submissão; cada
  seguinte, quando a anterior foi decidida (ADR 0001 — a cadeia inteira é gravada na submissão).
  Uma coluna nova para isso poderia divergir do que aconteceu; a derivação não pode.
- **Os quatro primeiros KPIs são do período; o quinto é do agora.** Um pedido travado há quarenta
  dias continua travado hoje, e recortá-lo pela janela de 30 dias o esconderia justamente de quem
  precisa vê-lo. Há caso de teste cobrindo exatamente isso.
- **Variação contra período anterior em zero é `null`, não 100%.** "Cresceu 100%" sobre base zero
  é afirmação que o dado não sustenta: a tela escreve "sem base de comparação". Com o seed atual é
  o que aparece em quase todos os cartões, porque não há histórico antes de 15/10.
- **No tempo médio, menor é melhor** — a seta para baixo é a verde. Reusar a regra dos outros KPIs
  pintaria de vermelho uma melhora.
- **A série por semana usa blocos de sete dias contados para trás a partir de agora**, rotulados
  `S1…S6` como no artboard, e não a semana do calendário: evita a discussão de fuso e de que dia
  começa a semana, que mudaria o número conforme quem olha. O pedido entra na semana em que foi
  **concluído**, não na em que foi submetido — o cartão se chama "valor aprovado por semana".
- **O eixo do gráfico é escalado pelo maior valor real**, arredondado para cima, e não por um teto
  fixo de 120 mil: o teto do mockup achataria qualquer banco que não seja o do mockup.
- **O corte por faixa lê o snapshot do pedido, nunca a alçada de hoje** (ADR 0001). Agrupar pela
  alçada vigente reescreveria o passado a cada edição de faixa. `aprovadores` sai do tamanho da
  cadeia gravada, pelo mesmo motivo.
- **O corte por aprovador só conta etapa decidida.** Etapa pendente não tem duração — tem espera, e
  a espera é a fila de atenção. Misturar as duas inflaria a média de quem ainda não foi chamado.
- **Sem biblioteca de gráfico, de novo.** O de linhas é `<polyline>` e `<circle>` em SVG inline:
  seis pontos por série, e a conta de onde cada ponto cai cabe em quatro linhas.
- **Cor de série como classe Tailwind, nunca `var(--token)` em atributo inline.** O Tailwind v4
  **poda de `:root` as variáveis de tema que não vê usadas no código-fonte**, e uma cor citada só
  dentro de um `var()` num atributo `stroke` não conta como uso: a variável sumia do CSS, o
  `stroke` ficava inválido e a linha inteira desaparecia da tela. Foi o defeito da primeira versão
  deste cartão, pego por inspeção do CSS servido — `stroke-serie-azul` como classe resolve.

### Correção de fidelidade, na mesma rodada

A primeira versão dos gráficos foi reprovada por quem pediu a tela: *"achei que a arte dos
gráficos não ficou igual"*. Estava certo — eu tinha trocado três coisas do desenho por decisão
minha, sem necessidade. As três voltaram para o artboard:

1. **O cartão de situações volta a ser barra empilhada + lista de ícones** (`.stack` +
   `.status-list`). Eu havia trocado por quatro barras horizontais com medo de o número não caber
   dentro de um segmento estreito. O medo tinha conserto mais barato que a troca: o número é
   escrito dentro do segmento **quando ele passa de 12% do total**, e abaixo disso fica só na
   lista — que tem a contagem de todas as situações, sempre. A lista com ícone redondo, nome,
   contagem e percentual é a do artboard, e é ela a alternativa textual da barra.
2. **As barras dos dois cortes voltam ao `.hbar-row`**: rótulo curto com um `<small>` de uma linha
   ("Residencial Aurora · 2 aprovadores") e o detalhe longo num balão, como o artboard. Eu havia
   empilhado tudo no `<small>`, o que dava três linhas de texto cinza por barra e afogava o
   gráfico. O balão aparece no **hover e no foco** — o artboard só tem hover, e detalhe que só
   existe sob o ponteiro não existe para quem navega por tabulação —, e o mesmo texto vai num
   `sr-only`, porque balão com `opacity` não é alternativa textual confiável.
3. **O gráfico de linhas ganha o rótulo de ponta** ("Residencial Aurora 14,6") ao lado do último
   ponto, que o artboard tem e eu não tinha desenhado. Ele só é escrito quando a última semana
   **tem** valor: em zero todas as séries caem na linha de base e os rótulos se empilhariam para
   dizer "0,0". A legenda do topo continua nomeando as obras.

Duas tentativas malsucedidas no caminho, registradas porque custam tempo a quem repetir: cortar o
nome da obra na primeira palavra transformava "Residencial Aurora" em "Residencial" — justamente
o pedaço que não identifica a obra, já que as três do seed começam por palavra genérica; e
reservar 130px à direita da linha não bastava para nome mais valor.

### Divergências deliberadas do artboard

1. **Sem o filtro por faixa de alçada** (o artboard tem três seletores; a tela tem dois). A faixa
   de um pedido é snapshot e pode apontar para uma faixa já editada ou apagada: o seletor listaria
   rótulos que não existem mais na alçada de hoje. O corte por faixa está no cartão próprio.
2. **Sem as frases de leitura editorial.** O artboard escreve "o limite de R$ 10.000 da Aurora está
   separando bem" e "é o número que justifica dar um suplente ao João". São opinião de quem
   desenhou, não derivação — inventá-las a partir do banco poria na boca do produto uma conclusão
   que o dado não sustenta. O que **é** derivável ficou, calculado de verdade: quantos pedidos
   passam por uma assinatura só, quantos pendentes estão parados e com quanto travado.
3. **Sem "+1 vs ontem" no cartão de alerta.** Comparar com ontem exige histórico do próprio
   indicador, que o modelo não guarda. O cartão mostra o valor travado e quantos passaram de 72 h.
4. **O cartão de situações tem quatro segmentos, não três** — a mesma divergência já declarada na
   E3: o artboard desenha aprovado, pendente e rejeitado, e o contrato da rota tem as quatro
   situações do domínio. Omitir rascunho faria a soma dos segmentos não bater com o total do
   título. A ordem é a do ciclo de vida do pedido (rascunho → pendente → aprovado → rejeitado), e
   não a do artboard (aprovado → pendente → rejeitado), porque é a mesma ordem das abas de
   `/pedidos`: duas telas do produto discordando da ordem das situações é pior do que divergir do
   mockup numa.

### Verificações desta rodada

- `npx tsc --noEmit` limpo · `npm run lint` limpo · `npm test` com **51 casos** (33 anteriores +
  18 do painel) · `npm run build` limpo, com `/api/pedidos/painel` na árvore de rotas.
- **Os KPIs conferidos contra SQL cru**, com um script que refaz as cinco contas direto no SQLite —
  inclusive a de "parado há", que percorre as etapas de cada pendente. Saída idêntica à da rota:
  `6` pedidos, `R$ 17.776,00` aprovados, `57.940.000 ms` de tempo médio, `1` rejeitado, `3` parados
  com `R$ 45.205,00` travados e `3` críticos.
- `403 SEM_PERMISSAO` para aprovador, comprador e sem sessão; `422 VALIDACAO` com
  `fields.dias` para `?dias=15`.
- **Filtros exercidos na tela:** `7 dias` devolve 2 pedidos contra 3 do período anterior (−33,3%,
  em vermelho), valor aprovado zero (−100,0%), tempo médio `—` e "Nenhuma rejeição no período" —
  enquanto "parados" segue em 3, porque é do agora. O seletor de obra recorta tudo e **chega ao
  cartão de situações**, que passa a dizer "Situação do 1 pedido".
- **Estado vazio** contra uma cópia do banco com `Pedido` zerado, servida num segundo `next start`:
  a tela mostra "Nenhum pedido submetido ainda" em vez de cinco KPIs em zero e eixos vazios. O
  `dev.db` da demonstração não foi tocado.
- **Legível a 390px**: KPIs em coluna, barras com rótulo em cima e número à direita, e a tabela da
  fila com rolagem horizontal própria. Nenhum erro de console; `/api/pedidos/painel` e
  `/api/pedidos/resumo` ambos 200 no carregamento da página.
- **Nenhuma tela existente quebrou:** `/pedidos` e `/alcadas` revisitadas depois da mudança.
- As capturas e os `curl` foram feitos contra **`npm run build && next start`**. Vale o aviso:
  um `next dev` já em execução quando `app/globals.css` muda pode continuar servindo o CSS antigo
  — foi o que escondeu os dois tokens novos até o build provar que estavam lá. Reinicie o
  `npm run dev` depois de mexer nos tokens.

### Pendências

- **O `OR` de visibilidade está em três lugares agora** — a lista, o resumo e o painel. A extração
  para `src/server/pedido.ts` segue sendo a limpeza certa, e segue tocando rota de sprint aprovada.
- **`scripts/verificar.sh` não cobre nem `/resumo` nem `/painel`.** Os `curl` estão registrados
  acima, mas não no script versionado.
- **Os KPIs comparativos ficam sem base no seed.** Não há pedido anterior a 15/10, então quase
  todo cartão mostra "sem base de comparação" e a série só tem valor em duas das seis semanas. É o
  dado honesto; quem quiser ver as setas verdes e vermelhas precisa de um seed com mais história.
- **O painel não tem teste de interface.** Os números têm 18 casos no domínio; a montagem da tela
  foi conferida por captura, não por suíte.

---

## Fixes finais — antes da entrega, em 2026-11-01

Fechamento das pendências levantadas em [`docs/criterios-do-enunciado.md`](criterios-do-enunciado.md),
cruzando o enunciado original critério a critério. No meio do trabalho a autora decidiu
**alinhar o projeto ao enunciado** inclusive onde antes havia divergência deliberada: a data do
pedido e o preço zero. As duas divergências deixaram de existir.

### Pronto

- **`GET /api/obras` e `GET /api/fornecedores`** (`app/api/obras/route.ts`,
  `app/api/fornecedores/route.ts`). Só listagem — cadastro continua fora de escopo (PRD § 3).
  Sessão de qualquer papel; sem sessão, `403 SEM_PERMISSAO`. Mesma forma que
  `app/pedidos/novo/page.tsx` entrega ao formulário. Feature **`s5f4`** na SPEC.
- **Feature `e3f2`** para `GET /api/pedidos/painel`, que não tinha feature que respondesse por
  ela. Descreve o comportamento atual; a rota não foi tocada.
- **Data do pedido é campo obrigatório**, como o enunciado pede. `<input type="date">` na posição
  do artboard Main, no lugar do texto que dizia que a data era registrada no envio. `rascunhoSchema`
  a aceita ausente ou vazia; `submissaoSchema` a exige ("Informe a data do pedido.", em
  `fields.dataPedido`) e recusa data fora do calendário. `POST` e `PUT /api/pedidos` a gravam; a
  submissão **não a sobrescreve mais** — carimba só `submetidoEm`. É a distinção que fica:
  `dataPedido` é a data de emissão que quem compra declara; `submetidoEm` é o registro auditável
  de quando o pedido entrou no fluxo. Nenhuma regra de data futura ou retroativa.
  - **Fuso.** A data é civil ("AAAA-MM-DD") e é gravada ao **meio-dia UTC**: meia-noite UTC já é
    o dia anterior na Bahia, e a tela (`dataCurta`, fuso `America/Bahia`) mostraria outra data.
    `Schemas.dataCivil` e `Schemas.dataParaEntrada` são o caminho de ida e volta.
  - O rascunho completo `#1001` do seed ganhou data (28/10/2026), para continuar submetível.
- **Preço unitário aceita zero** e recusa negativo ("O preço unitário não pode ser negativo.").
  Quantidade continua maior que zero — o enunciado a pede positiva.
  - **Migration nova, `20261101110631_preco_unitario_opcional_no_rascunho`** — testada num banco
    criado do zero (arquivo temporário: `migrate deploy` das 3 migrations e seed, limpos) e aplicada
    ao `dev.db` (`migrate dev`: "Already in sync", sem reset):
    `ItemPedido.precoUnitarioCentavos` passou a ser nulo. Antes, preço **ausente** no rascunho era
    gravado como zero, e zero era recusado na submissão. Aceitando zero, a ausência gravada como
    zero passaria pela submissão como item de R$ 0,00. Agora ausente é `null` (a submissão
    responde "Informe o preço unitário.") e zero é zero. O rascunho `#1002` do seed grava o preço
    que falta como `null`. Mesmo padrão da migration de `Pedido.obraId`, da Sprint 5.
- **`scripts/verificar.sh`** manda `dataPedido` nos dois rascunhos que submete — sem ela, o bloco 4
  passaria a receber 422.
- **SPEC:** decisões da revisão, notas de `Pedido.dataPedido` e `ItemPedido.precoUnitarioCentavos`,
  invariante de `ItemPedido`, critérios de `s2f6`, `s5f1`, `s5f2`, `s5f3`; a divergência de data
  saiu da lista de divergências do mockup.
- **README:** `/admin` e as quatro rotas que faltavam; tabela de telas em "Onde está cada coisa";
  as duas datas explicadas na seção de comunicação; a seção volta a ser "Divergências
  deliberadas do mockup", porque nenhuma diverge mais do enunciado. **`docs/pull-request.md`**
  perdeu a divergência da data e passou de 33 para 56 casos; os marcadores de e-mail e telefone
  continuam lá.
- **Diagramas.** Quatro diagramas do canvas de planejamento (29/10) entraram na documentação —
  entidades, estados do pedido, submissão e decisão, operações por camada — **corrigidos contra o
  código** antes: métodos de "domínio rico" que não existem trocados pelas funções puras reais de
  `src/domain` e `src/server`; `Pedido.obraId` e `ItemPedido.precoUnitarioCentavos` nuláveis;
  `400` → `422 VALIDACAO` e a data obrigatória no fluxo de submissão; nomes de incremento e a rota
  de simulação (extra E1, não feito) trocados pelas rotas de leitura que existem. PNGs em
  `docs/diagramas/` (seção "Diagramas" do README) e `site/static/diagramas/`. O canvas original não
  foi alterado. O quinto quadro, **Eventos do front**, ficou de fora: é o inventário do
  planejamento, com handlers e hooks (`useObras`, `usePedidos`…) que o código não tem.
- **Site Hugo (`site/`) com a documentação do README**, seguindo o menu existente, sem página nova:
  Introdução, Primeiros passos (com roteiro de 5 minutos e verificação por `curl`), as cinco
  páginas do Guia (com os diagramas e, em Consistência, os testes), Escopo (cada página do
  enunciado ganhou "como foi resolvido"), Entrega (checklist marcado com onde está cada item, e os
  sete ADRs em Contato e entrevista) e os dois Tutoriais. É cópia: o README mantém todas as seções
  e ganhou um link para o site. Screenshots copiadas para `site/static/screenshots/`. Três links
  relativos que já existiam no site e o Hugo resolvia errado (`avaliacao`, `backend`, `frontend`)
  foram corrigidos.
- **Screenshots da tela 1 recapturadas** (`tela-1-cadastro-de-pedido.png`,
  `tela-1-cadastro-vazio.png`) com `scripts/capturar-telas.mjs`, depois do seed.
- **Números do README conferidos contra o estado real.** Suíte de **33 → 56** casos; `dominio`
  **25 → 47** (18 do painel, 4 novos de data e preço); `ui` **7 → 8**. Conferidos e mantidos:
  3 obras, 6 usuários, 4 fornecedores, 3 faixas em 2 obras, 8 pedidos e os oito totais; Caio criou
  7 dos 8; 9 screenshots; 7 ADRs; 12 goals; 4 blocos do `verificar.sh`; o `#1009` do exemplo.

### Verificado

- `npx tsc --noEmit`, `npm run lint` e `npm test` (56/56) limpos; `npm run spec:md` sem id órfão.
- `curl`: rotas novas `200` para os quatro papéis, `403` sem sessão, `405` em `POST`. Submissão
  sem data: `422` com `fields.dataPedido`; com `"2026-10-29"`, `dataPedido` gravada
  `2026-10-29T12:00:00.000Z` e `submetidoEm` igual ao relógio do servidor. Item sem preço:
  `422` em `itens.0.precoUnitario`; com preço `"0"`: `200`. Preço `"-1"`: `422`.
- `hugo --source site --destination <temporário>`: sem erro nem aviso; 1.136 referências locais
  do HTML gerado conferidas, nenhuma quebrada, as 9 screenshots e os 4 diagramas presentes.
- `npm run seed` → `bash scripts/verificar.sh` sai com **0** → `npm run seed`: 8 pedidos,
  `sqlite_sequence` em 1008.
- O `next dev` já em execução precisou ser **reiniciado** depois do `prisma generate`: ele mantinha
  o cliente Prisma antigo em memória e respondia 500 ao gravar preço nulo.

### Pendências

- **Commit e Pull Request** — decisão da autora, inclusive a composição do commit.
- As outras sete capturas não mostram o formulário e não foram trocadas.
- O link do site no topo do README (`carolbalbs.github.io/obraflow-case`) só funciona depois que o
  workflow `pages.yml` publicar, o que exige o push. A capa do site (`site/content/_index.md`) não
  foi tocada e ainda mostra um pedido ilustrativo (#1042, "João Vieira", "Amanda Reis") que não é
  do seed.
- O comentário de `app/api/pedidos/painel/route.ts` diz que as obras do seletor saem "dos pedidos
  visíveis"; a consulta lista todas as obras. O comportamento é o certo; o comentário, não.
- `verificar.sh` não cobre `/resumo`, `/painel`, as rotas novas, a data nem o preço zero; nada
  disso tem teste de rota (o extra E2 não foi feito).
