# SPEC — ObraFlow — aprovações por alçada

> **Gerado por `npm run spec:md` a partir de [`docs/spec/`](spec/). Não edite este arquivo à mão.**
> Fonte: [`spec/base.json`](spec/base.json) + um JSON por sprint.
> PRD: [`PRD.md`](PRD.md) · Glossário: [`GLOSSARY.md`](../GLOSSARY.md) · ADRs: [`adr/`](adr/)
> Versão 1.0.0 · aprovada · 2026-10-30 · prazo 2026-11-01T23:59:00-03:00

**12 sprints · 43 features · 280 critérios de aceite · 20 endpoints · 8 modelos**

## Notas

- Sprint = incremento do plano original (docs/plano-incremental.md). INC0 vira Sprint 1.
- As sprints 4, 5 e 6 são fatias verticais (rota + tela), e não sprints de back e front separadas como o SPEC-TEMPLATE sugere. A divergência é deliberada: o plano exige que cada incremento termine com a aplicação rodando e demonstrando algo a mais. Uma sprint só de API não é entregável nesse critério.
- Estado em 2026-10-30: Sprint 1 concluída; Sprint 2 com o domínio escrito (src/domain, 585 linhas, tsc limpo) e sem a suíte Vitest; Sprints 3 a 8 não iniciadas.

## Decisões da revisão de SPEC

- Escopo de leitura: todos veem todos os pedidos submetidos; a lista do aprovador abre filtrada em 'aguardando minha decisão', com o filtro removível.
- O criador pode aprovar o próprio pedido. Segregação de função é out_of_scope declarado.
- Rascunho é privado do criador e não aparece na lista principal.
- Apagar ou editar faixa em uso é permitido, com aviso contando os pedidos em andamento.
- Não existe cancelamento de pedido submetido; desfazer é rejeitar.
- Limites: 100 itens, 20 faixas, 10 aprovadores, 200/2000/500 caracteres, R$ 10.000.000,00 unitário, payload 1 MB.
- dataPedido é a data de emissão do pedido, campo obrigatório do formulário como o enunciado pede (revisto em 2026-11-01; antes era carimbada pelo servidor). O rascunho a aceita vazia; a submissão a exige. O servidor carimba só submetidoEm, o registro auditável de quando o pedido entrou no fluxo. Sem regra de data futura ou retroativa: o enunciado não pede.
- Quantidade deve ser maior que zero; preço unitário deve ser não negativo — zero é aceito, como o enunciado pede (revisto em 2026-11-01). No rascunho, preço não informado é nulo, nunca zero.
- Reaproveitar pedido rejeitado fica como extra E4.

## Mockups

Canvas com 13 artboards: <https://claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo>

Os artboards são especificação visual, não referência solta. O que está dentro do recorte de uma sprint é implementado com fidelidade total ao artboard dela: estrutura, hierarquia, ordem dos elementos, textos, estados, cores, tipografia, espaçamento e raio. "Parecido" é reprovação; divergir exige constar da lista de divergências deliberadas abaixo, que é fechada — o agente não acrescenta item a ela.

O canvas serve os arquivos em project/<Artboard>.dc.html, um por artboard, com o CSS e o markup completos. Leia o artboard da sua sprint antes de escrever tela, e tire dele os valores — não os estime a partir da imagem.

O CSS dos artboards usa os mesmos hexadecimais de site/assets/css/obraflow.css, que já viraram tokens Tailwind na Sprint 1. Use o token, nunca o hexadecimal cru.

| artboard | tela | sprint |
|---|---|---|
| `Main` | 1 · Cadastro de pedido | `s5` |
| `Aprovacoes` | 2A · Aprovação (base) | `s6` |
| `AprovacoesB` | 2B · Aprovação ao vivo | `e1` |
| `AprovacoesC` | 2C · Overview do pedido (jornada) | `s6` |
| `PedidoDetalhe` | 2C · Pedido completo (detalhamento) | `s6` |
| `Alcadas` | 3 · Regras da alçada | `s4` |
| `Estados` | 4 · Estados e validações | `s7` |
| `TrocarConta` | 6 · Trocar de usuário (modo demo) | `s3` |
| `Login` | 7 · Login (entrada e SSO) — Só o painel de marca e a faixa de estados valem. O formulário de senha e o botão de SSO estão fora do escopo do PRD: a entrada do serviço de aprovações é sem senha, atrás de DEMO_MODE (ADR 0005). | `s3` |
| `Perfis` | 8 · Perfis, permissões e multi-tenant — A matriz de papéis e o bloco "O que muda na interface" valem. O escopo por tenant e o seletor de empresa ficam como desenho (ADR 0006). | `s3` |
| `Dashboard` | 10 · Painel do admin (KPIs e gráficos) | `e3` |
| `TempoReal` | 5 · Tempo real: as duas pontas — Referência para a seção de produção do README. Nada dele é implementado. | — |
| `Empresa` | 9 · Empresa (obras, usuários, fornecedores) — Fora do recorte: o enunciado dispensa cadastros. Nenhum item "Empresa" entra no menu. | — |

### Divergências deliberadas do mockup

Lista fechada. O que não está aqui é para ser implementado como está desenhado.

- Senha e SSO (artboard Login): a entrada é sem senha atrás de DEMO_MODE (ADR 0005). O formulário de e-mail e senha, o "Manter conectada", o "Esqueci minha senha" e o botão de SSO não são implementados.
- Seletor de empresa e tenant_id (artboard Perfis): não existe entidade Empresa (ADR 0006). O nome da construtora é marca fixa no cabeçalho, sem troca.
- Perfil "Suporte ObraFlow" (artboard Perfis): o domínio tem quatro papéis fechados. A quinta linha da matriz é desenho de produção.
- Item "Empresa" no menu (artboards Perfis e TrocarConta): a tela de cadastros está fora do recorte, então o item não existe para papel nenhum.
- Item "Estados" no menu (artboard TrocarConta): é um artboard de catálogo de estados, não uma rota do produto.
- A palavra "nível" nas legendas dos mockups ("nível 1", "nível 2"): o vocabulário do produto é faixa e ordem na cadeia (GLOSSARY).
- Os nomes das pessoas e os números dos artboards são ilustrativos; o que vale é o seed (prisma/seed.ts).
- Botão "Sair" no cabeçalho (artboard TrocarConta): o artboard não desenha encerramento de sessão, só a troca de pessoa. DELETE /api/sessao existe e precisa de um controle na tela — sem ele a única saída seria apagar o cookie à mão. O estilo é emprestado do "Desfazer" do próprio artboard, para não introduzir linguagem visual nova.
- Navegação lateral (artboards Alcadas, Main e Aprovacoes): o artboard desenha a navegação numa coluna à esquerda, com a marca, o menu e a identidade de quem está dentro; o artboard TrocarConta desenha a mesma navegação como barra superior. Os dois não cabem juntos, e a barra superior é a que a Sprint 3 implementou e as telas seguintes herdam — trocá-la agora mudaria a casca de toda a aplicação por causa de uma tela. As telas 1 e 3 ocupam a área de conteúdo, e o item "Regras de alçada" vive no menu do cabeçalho, onde só o admin o enxerga.
- Campo "Valor mínimo" editável (artboard Alcadas): a faixa guarda apenas o limite superior (ADR 0002), e o mínimo é o limite da faixa anterior mais um centavo. O campo existe na tela, na posição em que o artboard o desenha, mas é de leitura e se recalcula a cada tecla digitada no valor máximo. Torná-lo editável criaria uma segunda fonte para o mesmo intervalo, e com ela buracos e sobreposições que o modelo torna irrepresentáveis.
- Texto do aviso "Valor sem faixa aplicável" (artboard Alcadas): o artboard escreve "o pedido não é criado", e isso contradiz o vocabulário do produto — o rascunho é criado, e é a submissão que a falta de faixa impede (GLOSSARY, verbete "Sem regra aplicável"; ADR 0001, a faixa só é resolvida na submissão). A tela escreve "o pedido não é submetido". A frase final do artboard, "Decisão documentada no README", também não é implementada: o README é da Sprint 8, e um aviso de tela não aponta para documento que ainda não existe.
- Botão "Salvar rascunho" (artboard Main): o artboard desenha só "Cancelar" e "Cadastrar pedido", e a sprint exige salvar um rascunho incompleto e voltar depois — é a história de usuário da s5f1. Sem o controle, a única forma de gravar um rascunho seria chamar a rota por fora da tela. O botão entra entre os dois do artboard, com o estilo do secundário do próprio mockup, para não introduzir linguagem visual nova.
- Cartão "Alçada prevista" e a lista de aprovadores do artboard Main: é o simulador de cadeia ao vivo, que a própria sprint declara fora do escopo e que o extra E1 implementa (artboard AprovacoesB). A coluna lateral mantém o Resumo e as duas notas do artboard; o cartão da cadeia entra com o E1. No lugar dele, e só quando a obra escolhida não tem faixa nenhuma, a tela mostra o aviso que a própria sprint pede — a tela não resolve faixa, que é decisão do servidor na submissão (ADR 0001).
- Lista de pedidos em tabela de nove colunas (artboard Aprovacoes): o artboard desenha cada pedido como uma faixa com as informações agrupadas em dois blocos. As informações são exatamente as mesmas — identificador, obra, fornecedor, data, itens, total, situação, alçada atual e ações —, e o enunciado do case pede nove colunas. A tabela é o que torna "nove colunas" verificável em vez de inferida; a linguagem visual do artboard (etiqueta de situação, pastilhas da cadeia, total tabular) é preservada dentro das células. Em tela estreita a tabela rola dentro do próprio cartão, sem dar barra lateral à página.
- Campo de busca e contadores nas abas (artboard Aprovacoes): o artboard desenha "Buscar pedido, obra ou fornecedor" e um número ao lado de cada aba. Busca por texto é declarada fora do escopo desta sprint, e o contador por aba exigiria uma consulta por situação a cada carga — cinco contagens para escrever cinco números que `GET /api/pedidos` não devolve. A aba ativa mostra o total que a rota devolveu, que é o número que existe.
- Painel de detalhe ao lado da lista (artboard Aprovacoes): o artboard mostra a lista e o detalhe do pedido selecionado lado a lado. Aqui o detalhe é a sua própria rota, `/pedidos/[id]`, porque é dele que a decisão parte e é ele que precisa de endereço próprio — um pedido para decidir é coisa que se manda por link. O cartão "Exemplo de rejeição registrada (#1035)" do mesmo artboard é anotação do mockup sobre um segundo pedido, não elemento da tela: a rejeição aparece no detalhe do pedido rejeitado, com o motivo em destaque.
- Modo sugestão e "Sugerir edição" (artboards PedidoDetalhe e AprovacoesC): sugerir alteração devolve o pedido a quem o criou e pausa a alçada — é um fluxo de produto inteiro, com estado novo no modelo, que nenhuma sprint do recorte descreve. O pedido submetido é imutável (ADR 0001) e a tela o declara como somente leitura.
- Anexos (artboards PedidoDetalhe e AprovacoesC): não existe entidade de arquivo em modelo nenhum, e upload não aparece em sprint nenhuma.
- Cartão "Contexto para decidir" (artboard AprovacoesC): orçamento do mês da obra, preço da última compra do mesmo material e histórico de entregas do fornecedor. Nenhum desses números existe no modelo, e inventá-los seria a tela fingir ter servidor — que é justamente o que as regras do agente proíbem.
- "Pular por agora", "A seguir na fila", os atalhos de teclado R e A, a folha "Depois de clicar em Aprovar" e os prazos ("parado há 3 h", "Prazo-alvo: 24/10") do artboard AprovacoesC: são conforto de fila e de prazo que o domínio não tem — não há ordem de fila persistida, nem prazo, nem confirmação em duas etapas para aprovar. A rejeição, essa, tem a sua confirmação, porque ela exige motivo e encerra o pedido.
- Passo "Registro e envio ao fornecedor" da trilha macro (artboard AprovacoesC): o ciclo do produto termina em aprovado ou rejeitado (GLOSSARY). Não há envio ao fornecedor em sprint nenhuma, e desenhá-lo como etapa prometeria um passo que não acontece.

## Agentes

| id | papel | modelo |
|---|---|---|
| `ag-fundacao` | Estrutura do projeto, tooling, schema e migrations. Não escreve regra de negócio nem tela. | claude-opus-5 |
| `ag-dominio` | Funções puras em src/domain e sua suíte Vitest. Não toca em banco, rota ou React. | claude-opus-5 |
| `ag-backend` | Route Handlers em app/api, sessão, permissão e acesso a dados. | claude-opus-5 |
| `ag-fullstack` | Rota e tela da mesma capacidade, entregues juntas e funcionando. | claude-opus-5 |
| `ag-integracao` | Seed completo, scripts de verificação, screenshots e README. | claude-opus-5 |

## Modelos de dados

### Usuario

Pessoa que pode figurar como aprovador numa cadeia. Não confundir com Aprovador, que é o papel exercido num pedido específico.

| campo | tipo | obrig. | notas |
|---|---|---|---|
| `id` | String · PK | sim |  |
| `nome` | String | sim | máx. 120 caracteres |
| `email` | String · único | sim |  |
| `papel` | String | sim | admin | aprovador | comprador | visualizador. SQLite não tem enum: validado no domínio |
| `criadoEm` | DateTime | sim |  |

**Relações:** `faixaAprovadores` 1:N → FaixaAprovador (restrict) · `etapas` 1:N → Etapa (restrict) · `pedidosCriados` 1:N → Pedido (restrict)

**Invariantes:**

- papel pertence ao conjunto fechado dos quatro valores
- um usuário que decidiu uma etapa nunca pode ser apagado (on_delete restrict) — apagá-lo destruiria a trilha

### Obra

Projeto de construção ao qual um pedido pertence. É o contexto que determina quais regras de alçada se aplicam, e o escopo máximo do sistema (ADR 0006).

| campo | tipo | obrig. | notas |
|---|---|---|---|
| `id` | String · PK | sim |  |
| `nome` | String | sim | máx. 120 caracteres |
| `cidade` | String | sim |  |
| `criadoEm` | DateTime | sim |  |

**Relações:** `faixas` 1:N → Faixa (cascade) · `pedidos` 1:N → Pedido (restrict)

**Invariantes:**

- não existe entidade Empresa acima de Obra (ADR 0006)

### Fornecedor

Organização a quem o pedido de compra é dirigido.

| campo | tipo | obrig. | notas |
|---|---|---|---|
| `id` | String · PK | sim |  |
| `nome` | String | sim | máx. 120 caracteres |
| `documento` | String | não | CNPJ, sem validação de dígito neste recorte |
| `criadoEm` | DateTime | sim |  |

**Relações:** `pedidos` 1:N → Pedido (restrict)

### Faixa

Intervalo de valor dentro da alçada de uma obra, definido pelo seu limite superior inclusivo e associado a uma sequência ordenada de aprovadores (ADR 0002).

| campo | tipo | obrig. | notas |
|---|---|---|---|
| `id` | String · PK | sim |  |
| `obraId` | String | sim |  |
| `limiteCentavos` | Int | não | INCLUSIVO. Nulo = faixa aberta, cobre todo valor acima da anterior. NÃO existe limite inferior: o intervalo é implícito pela ordenação |
| `criadoEm` | DateTime | sim |  |

**Relações:** `obra` N:1 → Obra (cascade) · `aprovadores` 1:N → FaixaAprovador (cascade) · `pedidos` 1:N → Pedido (set_null)

**Índices:** `(obraId, limiteCentavos)`

**Invariantes:**

- no máximo uma faixa com limiteCentavos nulo por obra
- buraco e sobreposição entre faixas são irrepresentáveis, porque não há limite inferior
- no máximo 20 faixas por obra
- apagar a faixa não apaga o pedido: faixaId vira nulo e o snapshot denormalizado sobrevive

### FaixaAprovador

Um usuário na sequência de aprovadores de uma faixa, com a posição que ocupará na cadeia.

| campo | tipo | obrig. | notas |
|---|---|---|---|
| `id` | String · PK | sim |  |
| `faixaId` | String | sim |  |
| `usuarioId` | String | sim |  |
| `ordem` | Int | sim | posição na sequência |

**Relações:** `faixa` N:1 → Faixa (cascade) · `usuario` N:1 → Usuario (restrict)

**Índices:** `unique(faixaId, ordem)` · `unique(faixaId, usuarioId)`

**Invariantes:**

- o mesmo usuário não aparece duas vezes na mesma faixa
- duas posições iguais na mesma faixa são impossíveis por construção
- no máximo 10 aprovadores por faixa

### Pedido

Solicitação de materiais ou serviços a um fornecedor no contexto de uma obra. Nasce rascunho; a submissão resolve a faixa e grava a cadeia (ADR 0001).

| campo | tipo | obrig. | notas |
|---|---|---|---|
| `id` | Int · PK | sim | identificador visível: o pedido é citado como #1002 |
| `obraId` | String | sim |  |
| `fornecedorId` | String | não | nulo enquanto rascunho; obrigatório na submissão |
| `dataPedido` | DateTime | não | Data de emissão declarada no formulário ("AAAA-MM-DD", gravada ao meio-dia UTC). Nula só no rascunho; obrigatória na submissão. Não se confunde com submetidoEm, que o servidor carimba |
| `observacoes` | String | não | máx. 2000 caracteres |
| `situacao` | String | sim | rascunho | pendente | aprovado | rejeitado. Não existe cancelado |
| `totalCentavos` | Int | sim | soma dos itens, calculada pelo servidor. Valor enviado pelo cliente é ignorado |
| `criadoPorId` | String | sim |  |
| `submetidoEm` | DateTime | não |  |
| `faixaId` | String | não | faixa aplicada na submissão; vira nulo se a faixa for apagada |
| `faixaLimiteCentavos` | Int | não | SNAPSHOT: sobrevive à exclusão da faixa |
| `faixaSemTeto` | Boolean | sim | SNAPSHOT: a faixa aplicada era a aberta |
| `criadoEm` | DateTime | sim |  |
| `atualizadoEm` | DateTime | sim |  |

**Relações:** `obra` N:1 → Obra (restrict) · `fornecedor` N:1 → Fornecedor (restrict) · `criadoPor` N:1 → Usuario (restrict) · `faixa` N:1 → Faixa (set_null) · `itens` 1:N → ItemPedido (cascade) · `etapas` 1:N → Etapa (cascade)

**Índices:** `(situacao, obraId)`

**Invariantes:**

- totalCentavos é sempre a soma dos totais dos itens — nunca vem do cliente
- depois da submissão, cabeçalho e itens são imutáveis
- um pedido pendente, aprovado ou rejeitado tem ao menos uma etapa
- um rascunho não tem etapa nenhuma
- o snapshot da faixa é gravado na submissão e nunca recalculado (ADR 0001)
- no máximo 100 itens por pedido
- rascunho é visível e editável apenas pelo usuário que o criou

### ItemPedido

Uma linha do pedido: o que se compra, quanto, em que unidade e por qual preço unitário.

| campo | tipo | obrig. | notas |
|---|---|---|---|
| `id` | String · PK | sim |  |
| `pedidoId` | Int | sim |  |
| `descricao` | String | sim | máx. 200 caracteres |
| `quantidadeMilesimos` | Int | sim | 2,5 kg = 2500. Deve ser > 0 |
| `unidade` | String | sim | un, kg, m, m2, m3, sc, L, h |
| `precoUnitarioCentavos` | Int | não | nulo enquanto rascunho; obrigatório e >= 0 na submissão (<= 1000000000, R$ 10.000.000,00). Nulo é preço não informado; zero é preço válido |
| `totalCentavos` | Int | sim | round(quantidadeMilesimos * precoUnitarioCentavos / 1000), calculado no domínio |
| `ordem` | Int | sim |  |

**Relações:** `pedido` N:1 → Pedido (cascade)

**Índices:** `unique(pedidoId, ordem)`

**Invariantes:**

- totalCentavos = round(quantidadeMilesimos * precoUnitarioCentavos / 1000), arredondado uma única vez no produto
- quantidade é estritamente maior que zero; preço unitário é não negativo (zero é aceito)
- nenhum ponto flutuante participa do cálculo

### Etapa

Uma posição da cadeia de aprovação, gravada na submissão. A decisão vive na própria etapa, e é ela o alvo do UPDATE condicional (ADR 0004).

| campo | tipo | obrig. | notas |
|---|---|---|---|
| `id` | String · PK | sim |  |
| `pedidoId` | Int | sim |  |
| `ordem` | Int | sim | posição na cadeia, começando em 0 |
| `usuarioId` | String | sim | copiado da faixa na submissão; não acompanha edição posterior da faixa |
| `situacao` | String | sim | pendente | aprovada | rejeitada |
| `decididoEm` | DateTime | não |  |
| `motivo` | String | não | obrigatório quando rejeitada. Máx. 500 caracteres |

**Relações:** `pedido` N:1 → Pedido (cascade) · `usuario` N:1 → Usuario (restrict)

**Índices:** `unique(pedidoId, ordem)` · `(usuarioId, situacao)`

**Invariantes:**

- só a primeira etapa pendente, em ordem crescente, pode ser decidida
- uma etapa decidida nunca volta a pendente
- situacao rejeitada exige motivo não vazio
- uma etapa rejeitada encerra o pedido: nenhuma etapa posterior se torna decidível
- a decisão é um UPDATE condicionado a situacao = pendente e todas as anteriores aprovadas; zero linhas afetadas vira 409

## Estrutura de arquivos

```
app/
  layout.tsx                             Shell com cabeçalho, sessão e tokens de tema
  page.tsx                               Entrada: redireciona conforme sessão
  entrar/page.tsx                        Tela de entrada do modo demo
  pedidos/page.tsx                       Tela 2 — lista de aprovação
  pedidos/[id]/page.tsx                  Tela 2 — detalhe do pedido
  pedidos/novo/page.tsx                  Tela 1 — cadastro de pedido
  alcadas/page.tsx                       Tela 3 — regras da alçada
  api/sessao/route.ts                    POST entrar, DELETE sair
  api/obras/route.ts                     GET lista de obras
  api/obras/[id]/faixas/route.ts         GET e POST faixas da obra
  api/faixas/[id]/route.ts               PUT e DELETE faixa
  api/pedidos/route.ts                   GET lista com filtros, POST rascunho
  api/pedidos/[id]/route.ts              GET detalhe, PUT rascunho, DELETE rascunho
  api/pedidos/[id]/submissao/route.ts    POST submissão
  api/pedidos/[id]/decisoes/route.ts     POST decisão
src/domain/
  tipos.ts                               Tipos marcados, papéis, situações, Resultado
  erros.ts                               Códigos fechados e mapa para situação HTTP
  dinheiro.ts                            Centavos: entrada, soma, total de item, formatação
  quantidade.ts                          Milésimos: entrada e formatação
  alcada.ts                              Faixa, Alcada, resolverFaixa, comporta
  cadeia.ts                              Etapa, montarCadeia, aprovadorDaVez, histórico
  decisao.ts                             Decisao, validar, podeDecidir, situacaoApos
  schemas.ts                             Um schema Zod por operação
  index.ts                               Fachada do domínio
src/server/
  sessao.ts                              lerSessao(req: Request), criar e destruir sessão
  permissao.ts                           Matriz dos quatro papéis
  http.ts                                Envelope de erro e wrapper de rota
src/db/
  prisma.ts                              Cliente singleton com driver adapter
src/ui/
  hooks/                                 Hooks de dados devolvendo { dados, carregando, erro, recarregar }
  componentes/                           Cadeia, tabela de itens, diálogo, estados vazios
prisma/
  schema.prisma                          Oito modelos
  seed.ts                                Seed completo com os oito pedidos
  migrations/                            Migration inicial
tests/api/                             Suíte no seam de Route Handler (extra E2)
scripts/verificar.sh                   curl demonstrando 403 e 409
docs/                                  PRD, SPEC, ADRs, planos
```

## Sprints

| # | sprint | arquivo | entregável | risco | pré-req | agente |
|---|---|---|---|---|---|---|
| 1 | **Fundação** | [`spec/01-fundacao.json`](spec/01-fundacao.json) · [sprint-01.md](sprints/sprint-01.md) | npm run dev mostra uma página listando as obras do seed, com a tipografia e a cor de marca do ObraFlow. | baixo | — | `ag-fundacao` |
| 2 | **Domínio e testes** | [`spec/02-dominio-e-testes.json`](spec/02-dominio-e-testes.json) · [sprint-02.md](sprints/sprint-02.md) | npm test verde cobrindo limite inclusivo, teto estourado, obra sem faixa, ordem da cadeia, decisão fora de ordem e rejeição encerrando o fluxo. | baixo | `s1` | `ag-dominio` |
| 3 | **Sessão e papéis** | [`spec/03-sessao-e-papeis.json`](spec/03-sessao-e-papeis.json) · [sprint-03.md](sprints/sprint-03.md) | Dá para entrar como cada usuário do seed, o menu muda conforme o papel, e uma rota protegida responde 403 para quem não deve. | medio | `s2` | `ag-backend` |
| 4 | **Tela 3 — Regras da alçada** | [`spec/04-tela-3-regras-da-alcada.json`](spec/04-tela-3-regras-da-alcada.json) · [sprint-04.md](sprints/sprint-04.md) | Marina cria, edita, reordena e remove faixas; Amanda tentando a mesma URL vê a explicação de acesso negado. | medio | `s3` | `ag-fullstack` |
| 5 | **Tela 1 — Cadastro de pedido** | [`spec/05-tela-1-cadastro-de-pedido.json`](spec/05-tela-1-cadastro-de-pedido.json) · [sprint-05.md](sprints/sprint-05.md) | Montar um pedido de três itens, salvar como rascunho, sair, voltar, completar e submeter — e a cadeia aparece gravada no banco. | alto | `s4` | `ag-fullstack` |
| 6 | **Tela 2 — Aprovação** | [`spec/06-tela-2-aprovacao.json`](spec/06-tela-2-aprovacao.json) · [sprint-06.md](sprints/sprint-06.md) | Entrando como Amanda e depois como João, a mesma lista mostra filas diferentes, e aprovar como Amanda libera a decisão do João. | alto | `s5` | `ag-fullstack` |
| 7 | **Estados, validações e responsividade** | [`spec/07-estados-validacoes-e-responsividade.json`](spec/07-estados-validacoes-e-responsividade.json) · [sprint-07.md](sprints/sprint-07.md) | Derrubar o servidor com a tela aberta produz estado de erro com botão de repetir, e nenhuma lista pisca conteúdo vazio antes de carregar. | baixo | `s6` | `ag-fullstack` |
| 8 | **Seed completo, prova e documentação** | [`spec/08-seed-completo-prova-e-documentacao.json`](spec/08-seed-completo-prova-e-documentacao.json) · [sprint-08.md](sprints/sprint-08.md) | Alguém que nunca viu o projeto clona, segue o README e chega na tela de aprovação sem perguntar nada. | medio | `s7` | `ag-integracao` |
| 9 | **Extra E1 — Simulador de alçada ao vivo** *(extra)* | [`spec/09-extra-simulador-de-alcada-ao-vivo.json`](spec/09-extra-simulador-de-alcada-ao-vivo.json) · [sprint-09.md](sprints/sprint-09.md) | Mudar um preço muda a cadeia prevista na tela, sem criar nada no banco. | baixo | `s8` | `ag-fullstack` |
| 10 | **Extra E2 — Suíte de integração da API** *(extra)* | [`spec/10-extra-suite-de-integracao-da-api.json`](spec/10-extra-suite-de-integracao-da-api.json) · [sprint-10.md](sprints/sprint-10.md) | npm test cobre os dois projetos, e o 409 de corrida tem caso automatizado. | medio | `s8` | `ag-backend` |
| 11 | **Extra E3 — Gráfico na administração** *(extra)* | [`spec/11-extra-grafico-na-administracao.json`](spec/11-extra-grafico-na-administracao.json) · [sprint-11.md](sprints/sprint-11.md) | Gráfico de pedidos por situação na tela de administração. | baixo | `e2` | `ag-fullstack` |
| 12 | **Extra E4 — Duplicar pedido rejeitado** *(extra)* | [`spec/12-extra-duplicar-pedido-rejeitado.json`](spec/12-extra-duplicar-pedido-rejeitado.json) · [sprint-12.md](sprints/sprint-12.md) | Duplicar um pedido rejeitado abre um rascunho novo com os mesmos itens. | baixo | `e3` | `ag-fullstack` |

---

## Sprint 1 · Fundação

**Estado:** concluida
**Descrição:** Projeto Next que sobe, lê do banco e mostra na tela, com todas as decisões estruturais já gravadas no schema.

**Entregável:** npm run dev mostra uma página listando as obras do seed, com a tipografia e a cor de marca do ObraFlow.

**Risco:** baixo · **Pré-requisito:** nenhum · **Agente:** `ag-fundacao` · **Stack:** `next`, `react`, `typescript`, `tailwind`, `prisma`, `sqlite`, `tsx`

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

**Definition of done:**

- [ ] npm run dev sobe sem erro
- [ ] npx tsc --noEmit limpo
- [ ] npm run lint limpo
- [ ] A página inicial lista as obras do seed com a identidade visual correta
- [ ] git diff em site/ é vazio

---

## Sprint 2 · Domínio e testes

**Estado:** em_andamento
**Descrição:** O domínio inteiro como módulos de funções puras, sem import de next/*, sem banco e sem HTTP.

**Entregável:** npm test verde cobrindo limite inclusivo, teto estourado, obra sem faixa, ordem da cadeia, decisão fora de ordem e rejeição encerrando o fluxo.

**Risco:** baixo · **Pré-requisito:** s1 · **Agente:** `ag-dominio` · **Stack:** `typescript`, `zod`, `vitest`

### s2f1 · Tipos e códigos de erro

**Categoria:** `build`

Tipos marcados para centavos e milésimos, papéis e situações como listas fechadas, e os sete códigos de erro com seu mapa HTTP.

> Como desenvolvedora da tela, quero decidir o que mostrar pelo código, para que melhorar a redação não quebre nada.

**Steps:**

1. Declarar Centavos, Milesimos e Ordem como tipos marcados
2. Declarar PAPEIS, SITUACOES_DO_PEDIDO e SITUACOES_DA_ETAPA como tuplas literais
3. Declarar Resultado com sucesso e falha
4. Declarar os sete códigos e a fábrica erro()
5. Declarar SITUACAO_HTTP como Record completo

**Acceptance criteria:**

- [ ] Passar Milesimos onde se espera Centavos é erro de compilação
- [ ] SITUACAO_HTTP é Record<Codigo, number> completo: omitir um código não compila
- [ ] NAO_E_SUA_VEZ e CADEIA_CONCLUIDA mapeiam para 409
- [ ] VALIDACAO e SEM_REGRA_APLICAVEL mapeiam para 422
- [ ] SEM_PERMISSAO mapeia para 403 e NAO_ENCONTRADO para 404

**Edge cases:**

- String vinda do banco fora do conjunto fechado: ehPapel e ehSituacao* devolvem false em vez de lançar

**Arquivos:** `src/domain/tipos.ts`, `src/domain/erros.ts`

**Fora de escopo:** O envelope HTTP e o wrapper de rota (Sprint 3)

### s2f2 · Dinheiro e quantidade

**Categoria:** `build`

Centavos e milésimos inteiros, com um único ponto de arredondamento no total do item.

> Como aprovador, quero que o total que eu aprovo seja a soma exata dos itens, para que não haja centavo sem origem.

**Steps:**

1. Implementar deEntrada de dinheiro com separador decimal e de milhar
2. Implementar deEntrada de quantidade recusando mais de três casas
3. Implementar porMilesimos com arredondamento único no produto
4. Implementar somar, ehPositivo e formatar em pt-BR

**Acceptance criteria:**

- [ ] deEntrada('1.234,56'), deEntrada('1234,56') e deEntrada('1234.56') devolvem 123456
- [ ] deEntrada('abc') e deEntrada('') devolvem null, sem lançar
- [ ] porMilesimos(333, 2500) devolve 833 — ou seja, 2,5 x R$ 3,33 = R$ 8,33
- [ ] Quantidade.deEntrada('0,125') devolve 125
- [ ] Quantidade.deEntrada('1,2345') devolve null: precisão excedente é recusada, não truncada
- [ ] formatar(123456) devolve 'R$ 1.234,56' com locale pt-BR fixo

**Edge cases:**

- Entrada com espaços nas pontas: aparada antes de interpretar
- Valor acima de 1000000000 centavos: recusado na validação de item
- Entrada negativa de quantidade: recusada por não casar o padrão

**Arquivos:** `src/domain/dinheiro.ts`, `src/domain/quantidade.ts` · **Depende de:** `s2f1`

**Fora de escopo:** Moeda diferente de BRL · Formatação por preferência do navegador

### s2f3 · resolverFaixa

**Categoria:** `build`

Dado o total e as faixas da obra, devolve a faixa aplicável ou uma recusa explicada.

> Como compradora, quero que R$ 10.000,00 exato caia na faixa 'até R$ 10.000,00', para que o limite anunciado seja o praticado.

**Steps:**

1. Declarar Aprovador, Faixa e Alcada sem limite inferior
2. Implementar comporta com o limite inclusivo
3. Implementar faixasOrdenadas com a faixa aberta por último
4. Implementar resolverFaixa com os três caminhos de recusa
5. Implementar temFaixaAbertaDuplicada

**Acceptance criteria:**

- [ ] Total de 1000000 centavos numa obra com faixa de limite 1000000 resolve para essa faixa — limite inclusivo
- [ ] Total de 1000001 resolve para a faixa seguinte
- [ ] Obra sem nenhuma faixa devolve falha com código SEM_REGRA_APLICAVEL
- [ ] Total acima do limite da faixa mais alta, sem faixa aberta, devolve SEM_REGRA_APLICAVEL e a mensagem cita o valor do teto
- [ ] Faixa que comporta o total mas não tem aprovador devolve SEM_REGRA_APLICAVEL
- [ ] Faixas passadas fora de ordem resolvem corretamente

**Edge cases:**

- Total zero: resolve para a faixa mais baixa — não é caso especial
- Duas faixas abertas na mesma obra: temFaixaAbertaDuplicada devolve true, para a rota recusar na escrita

**Modelos:** Faixa, FaixaAprovador · **Arquivos:** `src/domain/alcada.ts` · **Depende de:** `s2f2`

**Fora de escopo:** Persistir faixas (Sprint 4) · Montar a cadeia (s2f4)

### s2f4 · montarCadeia e leitura do snapshot

**Categoria:** `build`

Deriva a cadeia da faixa na submissão e responde perguntas sobre uma cadeia já gravada.

> Como auditor, quero que a cadeia gravada não mude quando a alçada da obra for editada, para que o histórico não seja reescrito.

**Steps:**

1. Declarar Etapa e Cadeia
2. Implementar montarCadeia reindexando a ordem a partir de zero
3. Implementar aprovadorDaVez devolvendo null em cadeia concluída
4. Implementar foiRejeitada, foiAprovada e estaConcluida
5. Implementar historico

**Acceptance criteria:**

- [ ] Nenhuma função de cadeia.ts recebe Alcada como parâmetro: grep por 'Alcada' em src/domain/cadeia.ts não retorna nada
- [ ] montarCadeia preserva a ordem dos aprovadores da faixa
- [ ] Ordens não contíguas na faixa (0, 5, 9) produzem cadeia com ordens 0, 1, 2
- [ ] aprovadorDaVez devolve a primeira etapa pendente em ordem crescente
- [ ] Cadeia com uma etapa rejeitada tem aprovadorDaVez igual a null
- [ ] historico devolve só as etapas com situação diferente de pendente

**Edge cases:**

- Faixa sem aprovador: montarCadeia devolve cadeia vazia, e a submissão já foi barrada antes por resolverFaixa
- Cadeia vazia: estaConcluida devolve false, porque foiAprovada exige ao menos uma etapa

**Modelos:** Etapa · **Arquivos:** `src/domain/cadeia.ts` · **Depende de:** `s2f3`

**Fora de escopo:** Gravar a cadeia (Sprint 5) · Desenhar a cadeia (Sprint 6)

### s2f5 · Política de decisão

**Categoria:** `build`

Valida a decisão contra o estado da cadeia e diz qual situação o pedido assume em seguida.

> Como aprovador, quero decidir apenas quando for a minha vez, para que a ordem da alçada seja real e não sugerida.

**Steps:**

1. Declarar Decisao como união de aprovar e rejeitar-com-motivo
2. Implementar rejeitar devolvendo erro ancorado em campos.motivo
3. Implementar podeDecidir
4. Implementar validar com os quatro caminhos de recusa
5. Implementar situacaoApos

**Acceptance criteria:**

- [ ] validar devolve a Etapa atingida, não um booleano — é ela que condiciona o UPDATE da Sprint 6
- [ ] Decisão do segundo aprovador com a primeira etapa pendente devolve código NAO_E_SUA_VEZ
- [ ] Decisão de quem não está na cadeia devolve NAO_E_SUA_VEZ com mensagem diferente da anterior
- [ ] Decisão em cadeia já aprovada por inteiro devolve CADEIA_CONCLUIDA
- [ ] Decisão em cadeia com etapa rejeitada devolve CADEIA_CONCLUIDA
- [ ] rejeitar('  ') devolve falha VALIDACAO com campos.motivo preenchido
- [ ] situacaoApos devolve 'rejeitado' para qualquer rejeição, em qualquer posição
- [ ] situacaoApos devolve 'aprovado' só quando não resta etapa pendente

**Edge cases:**

- Motivo com menos de 3 caracteres: recusado
- Motivo acima de 500 caracteres: recusado pelo schema da Sprint 6
- Cadeia vazia: validar devolve NAO_ENCONTRADO

**Modelos:** Etapa · **Arquivos:** `src/domain/decisao.ts` · **Depende de:** `s2f4`

**Fora de escopo:** A garantia contra corrida, que é o UPDATE condicional da Sprint 6 · Permissão por papel (Sprint 3)

### s2f6 · Schemas Zod por operação

**Categoria:** `build`

Rascunho permissivo e submissão estrita como schemas diferentes, compartilhados entre rota e formulário.

> Como compradora, quero que a tela recuse o que a rota recusaria, para que eu não descubra o problema no envio.

**Steps:**

1. Instalar zod em versão fixa
2. Escrever rascunhoSchema permissivo
3. Escrever submissaoSchema estrito com ao menos um item
4. Escrever o adaptador de ZodError para CamposComErro
5. Ligar a coerção aos parsers de dinheiro e quantidade

**Acceptance criteria:**

- [ ] rascunhoSchema aceita objeto com todos os campos ausentes
- [ ] submissaoSchema recusa pedido com zero itens
- [ ] submissaoSchema recusa item com quantidade igual a zero e com preço negativo, e aceita preço igual a zero ("valor monetário não negativo", no enunciado)
- [ ] submissaoSchema recusa mais de 100 itens
- [ ] submissaoSchema recusa descrição acima de 200 caracteres e observações acima de 2000
- [ ] O erro devolvido traz campos no formato CamposComErro, nunca o formato nativo do Zod
- [ ] submissaoSchema exige dataPedido em "AAAA-MM-DD", com erro em fields.dataPedido quando ausente, vazia ou fora do calendário; rascunhoSchema a aceita ausente ou vazia
- [ ] Item com preço ausente — nulo no rascunho gravado — é recusado na submissão com fields['itens.N.precoUnitario'], no mesmo formato dos outros erros de item; preço zero passa

**Edge cases:**

- Corpo que não é JSON: a rota devolve VALIDACAO 422 antes de chamar o schema
- Campo extra desconhecido: ignorado, não é erro
- Preço acima de 1000000000 centavos: recusado

**Modelos:** Pedido, ItemPedido · **Arquivos:** `src/domain/schemas.ts` · **Depende de:** `s2f2`

**Fora de escopo:** Schemas de faixa (Sprint 4) e de decisão (Sprint 6)

### s2f7 · Vitest em dois projetos e suíte do domínio

**Categoria:** `build`

Projeto de domínio paralelo e sem setup; projeto de API em série, declarado agora e exercitado no extra E2.

> Como desenvolvedora, quero npm test rodando o domínio em segundos, para que eu rode a suíte a cada salvamento.

**Steps:**

1. Instalar vitest em versão fixa
2. Escrever vitest.config.mts com os projetos dominio e api
3. Criar .env.test e adicionar prisma/test.db ao gitignore
4. Escrever os casos por módulo
5. Rodar npm test até verde

**Acceptance criteria:**

- [ ] npm test executa o projeto dominio e termina verde
- [ ] A suíte do domínio tem ao menos 12 casos
- [ ] O projeto api está declarado com fileParallelism false e executa zero casos sem erro de configuração
- [ ] Nenhum teste do domínio usa mock ou stub
- [ ] Nenhum teste afirma o texto de uma mensagem de erro: todos afirmam o código
- [ ] prisma/test.db está no .gitignore

**Edge cases:**

- Suíte rodada sem .env.test: o projeto dominio roda mesmo assim, porque não toca em banco

**Arquivos:** `vitest.config.mts`, `.env.test`, `src/domain/*.test.ts` · **Depende de:** `s2f1`, `s2f2`, `s2f3`, `s2f4`, `s2f5`, `s2f6`

**Fora de escopo:** Setup de reset e fábricas (extra E2) · Cobertura como métrica · Teste de componente

**Definition of done:**

- [ ] npm test verde
- [ ] npx tsc --noEmit limpo
- [ ] grep por "from 'next" em src/domain/ não retorna nada
- [ ] Todo caminho de recusa do domínio tem ao menos um caso de teste

---

## Sprint 3 · Sessão e papéis

**Descrição:** Entrada sem senha atrás de DEMO_MODE, sessão em cookie httpOnly lida do Request, e a matriz dos quatro papéis imposta no servidor.

**Entregável:** Dá para entrar como cada usuário do seed, o menu muda conforme o papel, e uma rota protegida responde 403 para quem não deve.

**Risco:** medio · **Pré-requisito:** s2 · **Agente:** `ag-backend` · **Stack:** `next`, `react`, `typescript`, `prisma`, `zod`

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

**Definition of done:**

- [ ] Entrar como cada usuário do seed funciona
- [ ] O menu muda conforme o papel
- [ ] Uma rota de alçada responde 403 para não-admin, verificado por curl
- [ ] Com DEMO_MODE desligada a rota de entrada responde 404
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

---

## Sprint 4 · Tela 3 — Regras da alçada

**Descrição:** Primeira tela de verdade, porque sem faixa não há pedido submetível. CRUD de faixas por obra, exclusivo do admin.

**Entregável:** Marina cria, edita, reordena e remove faixas; Amanda tentando a mesma URL vê a explicação de acesso negado.

**Risco:** medio · **Pré-requisito:** s3 · **Agente:** `ag-fullstack` · **Stack:** `next`, `react`, `typescript`, `tailwind`, `prisma`, `zod`

### s4f1 · Listar e criar faixas da obra

**Categoria:** `api_endpoint`

GET devolve as faixas ordenadas pelo limite; POST cria faixa nova.

> Como admin, quero definir as faixas de valor e seus aprovadores por obra, para que obras de portes diferentes tenham controles diferentes.

**Steps:**

1. Escrever GET /api/obras/[id]/faixas devolvendo as faixas ordenadas com aprovadores
2. Escrever POST criando faixa com limite e lista ordenada de aprovadores
3. Recusar a segunda faixa aberta da obra
4. Recusar limite duplicado na mesma obra

**Acceptance criteria:**

- [ ] GET devolve as faixas ordenadas por limiteCentavos crescente, com a faixa aberta por último
- [ ] GET inclui os aprovadores de cada faixa na ordem gravada
- [ ] POST com limiteCentavos nulo numa obra que já tem faixa aberta responde 422 com código VALIDACAO
- [ ] POST com limite igual ao de outra faixa da mesma obra responde 422
- [ ] POST com zero aprovadores responde 422 com campos.aprovadores
- [ ] POST com mais de 10 aprovadores responde 422
- [ ] POST com aprovador repetido responde 422
- [ ] POST por usuário não-admin responde 403 SEM_PERMISSAO
- [ ] POST com usuarioId inexistente responde 422

**Edge cases:**

- Obra inexistente: 404 NAO_ENCONTRADO
- Limite negativo: 422
- Mais de 20 faixas na obra: 422
- Corpo com total de aprovadores válido mas ordem duplicada: a ordem é reindexada pelo servidor a partir da posição no array, então ordem enviada é ignorada

**`GET /api/obras/{id}/faixas`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | [{ id, limiteCentavos, semTeto, aprovadores: [{ usuarioId, nome, ordem }] }] |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO — obra inexistente |

**`POST /api/obras/{id}/faixas`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB

*Body:* `limiteCentavos`: int > 0 ou null para faixa aberta · `aprovadores`: array de usuarioId, 1 a 10, sem repetição; a ordem é a posição no array

| status | resposta |
|---|---|
| 201 | { id, limiteCentavos, semTeto, aprovadores } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO — segunda faixa aberta, limite duplicado, zero ou mais de 10 aprovadores, aprovador repetido ou inexistente |

*Efeitos:* cria Faixa e FaixaAprovador numa transação

**Modelos:** Faixa, FaixaAprovador, Obra, Usuario · **Arquivos:** `app/api/obras/[id]/faixas/route.ts` · **Depende de:** `s3f4`

**Fora de escopo:** CRUD de obra (fora de escopo no PRD)

### s4f2 · Substituir e remover faixa

**Categoria:** `api_endpoint`

PUT substitui limite e lista ordenada de uma vez, eliminando rota de reordenação. DELETE remove, e o snapshot dos pedidos sobrevive.

> Como admin, quero inverter a ordem de dois aprovadores e salvar, para que a nova ordem persista após recarregar.

**Steps:**

1. Escrever PUT /api/faixas/[id] substituindo a faixa inteira numa transação
2. Escrever DELETE /api/faixas/[id]
3. Contar pedidos em andamento sob a faixa e devolver na resposta do GET e antes do DELETE

**Acceptance criteria:**

- [ ] PUT substitui limite e aprovadores numa única transação: não existe estado intermediário com a faixa sem aprovador
- [ ] Inverter a ordem de dois aprovadores e recarregar devolve a nova ordem
- [ ] DELETE de faixa usada por pedido submetido responde 200, e o pedido mantém faixaLimiteCentavos e faixaSemTeto
- [ ] Depois do DELETE, o pedido afetado tem faixaId nulo e a cadeia gravada intacta
- [ ] PUT e DELETE por não-admin respondem 403 SEM_PERMISSAO
- [ ] PUT que deixaria a obra com duas faixas abertas responde 422
- [ ] GET da faixa inclui pedidosEmAndamento com a contagem de pedidos pendentes sob ela

**Edge cases:**

- Faixa inexistente: 404
- PUT com array de aprovadores vazio: 422
- DELETE de faixa sem pedido nenhum: 200, sem aviso
- Dois PUT concorrentes na mesma faixa: o último escreve; não há controle de versão, e a decisão está registrada como aceita neste recorte

**`PUT /api/faixas/{id}`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB · idempotente

*Body:* `limiteCentavos`: int > 0 ou null · `aprovadores`: array de usuarioId, 1 a 10, ordem = posição

| status | resposta |
|---|---|
| 200 | { id, limiteCentavos, semTeto, aprovadores } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO |

*Efeitos:* apaga e recria FaixaAprovador da faixa numa transação

**`DELETE /api/faixas/{id}`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | { removida: true, pedidosAfetados: int } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |

*Efeitos:* apaga Faixa e seus FaixaAprovador em cascata · Pedido.faixaId vira nulo; o snapshot denormalizado permanece

**Modelos:** Faixa, FaixaAprovador, Pedido · **Arquivos:** `app/api/faixas/[id]/route.ts` · **Depende de:** `s4f1`

**Fora de escopo:** Controle de versão otimista na faixa

### s4f3 · Tela de regras da alçada

**Categoria:** `frontend`

Seleção de obra, tabela de faixas com aprovadores na ordem, criar, editar, reordenar e remover.

> Como admin, quero configurar a alçada pela interface, para não depender de ninguém mexendo no banco.

**Steps:**

1. Seletor de obra
2. Tabela com faixa, aprovadores na ordem e ações
3. Formulário de criar e editar com aprovadores adicionáveis, removíveis e reordenáveis
4. Diálogo de confirmação de exclusão com a contagem de pedidos em andamento

**Acceptance criteria:**

- [ ] A tabela mostra as faixas da obra selecionada, ordenadas, com os aprovadores na ordem gravada
- [ ] A faixa aberta é exibida como 'acima de R$ X', derivada do limite da faixa anterior
- [ ] Criar faixa e recarregar mantém a faixa
- [ ] Reordenar aprovadores e salvar persiste a nova ordem
- [ ] O diálogo de exclusão informa quantos pedidos em andamento usam a faixa e declara que eles seguem com a cadeia gravada na submissão
- [ ] Excluir sem confirmar no diálogo não chama a API
- [ ] A tabela tem estado de carregando, vazio e erro com repetição
- [ ] Erro de validação do servidor aparece ancorado no campo, via error.fields

**Edge cases:**

- Obra sem nenhuma faixa: empty state explicando que nenhum pedido dessa obra poderá ser submetido
- Nenhuma obra no banco: empty state apontando o seed
- Usuário não-admin acessando a URL direto: tela explica o acesso negado e diz a quem recorrer, em vez de tela branca
- API fora do ar: erro com botão de tentar de novo

**Modelos:** Faixa, FaixaAprovador, Obra · **Arquivos:** `app/alcadas/page.tsx`, `src/ui/componentes/`, `src/ui/hooks/` · **Depende de:** `s4f1`, `s4f2`

**Fora de escopo:** Gráfico de faixas (extra E3)

**Definition of done:**

- [ ] Admin cria, edita, reordena e remove faixas pela tela
- [ ] Não-admin recebe 403 da API e explicação na tela
- [ ] O diálogo de exclusão comunica o efeito sobre pedidos em andamento
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

---

## Sprint 5 · Tela 1 — Cadastro de pedido

**Descrição:** Rascunho salvável e incompleto, itens N com total calculado, e submissão separada da criação.

**Entregável:** Montar um pedido de três itens, salvar como rascunho, sair, voltar, completar e submeter — e a cadeia aparece gravada no banco.

**Risco:** alto · **Pré-requisito:** s4 · **Agente:** `ag-fullstack` · **Stack:** `next`, `react`, `typescript`, `tailwind`, `prisma`, `zod`

### s5f1 · Rascunho: criar, editar e apagar

**Categoria:** `api_endpoint`

Rascunho é privado do criador. Pedido submetido é imutável.

> Como comprador, quero salvar um rascunho incompleto e voltar depois, para que interrupção na obra não custe o trabalho feito.

**Steps:**

1. Escrever POST /api/pedidos criando rascunho do usuário da sessão
2. Escrever PUT /api/pedidos/[id] substituindo cabeçalho e itens do rascunho
3. Escrever DELETE /api/pedidos/[id]
4. Recusar qualquer escrita em pedido não-rascunho
5. Recusar acesso de quem não criou

**Acceptance criteria:**

- [ ] POST cria rascunho com situacao 'rascunho', totalCentavos 0 e criadoPorId igual ao usuário da sessão
- [ ] POST aceita corpo com todos os campos ausentes, porque rascunho é incompleto por natureza
- [ ] PUT recalcula totalCentavos como a soma dos totais dos itens; um totalCentavos enviado no corpo é ignorado
- [ ] PUT em pedido com situacao diferente de 'rascunho' responde 409 com código PEDIDO_IMUTAVEL
- [ ] GET, PUT e DELETE de rascunho de outro usuário respondem 404 NAO_ENCONTRADO, não 403 — rascunho alheio não existe para quem não o criou
- [ ] PUT com mais de 100 itens responde 422
- [ ] DELETE de rascunho responde 200 e apaga os itens em cascata
- [ ] DELETE de pedido submetido responde 409 PEDIDO_IMUTAVEL
- [ ] Usuário com papel aprovador ou visualizador recebe 403 ao tentar POST
- [ ] POST e PUT gravam a dataPedido enviada ("AAAA-MM-DD") e a devolvem; ausente ou vazia, fica nula
- [ ] Item sem preço informado é gravado com precoUnitarioCentavos nulo, nunca zero; preço zero informado é gravado como zero

**Edge cases:**

- dataPedido malformada ou fora do calendário no corpo: 422 com fields.dataPedido; vazia ou ausente é aceita no rascunho
- Item com ordem duplicada no array: a ordem é reindexada pela posição
- Pedido inexistente: 404
- Obra inexistente no corpo: 422

**`POST /api/pedidos`** — auth: sessao + papel comprador ou admin · timeout 5000ms · payload 1MB

*Body:* `obraId`: string cuid, opcional no rascunho · `dataPedido`: string "AAAA-MM-DD", opcional no rascunho

| status | resposta |
|---|---|
| 201 | { id, situacao: 'rascunho', totalCentavos: 0 } |
| 403 | SEM_PERMISSAO |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO |

*Efeitos:* cria Pedido com criadoPorId da sessão

**`PUT /api/pedidos/{id}`** — auth: sessao + ser o criador · timeout 5000ms · payload 1MB · idempotente

*Body:* `obraId`: string cuid, opcional · `fornecedorId`: string cuid, opcional · `dataPedido`: string "AAAA-MM-DD", opcional no rascunho · `observacoes`: string, máx 2000, opcional · `itens`: array 0..100 de { descricao máx 200, quantidade > 0, unidade, precoUnitario >= 0 e <= R$ 10.000.000,00 }

| status | resposta |
|---|---|
| 200 | { id, totalCentavos, itens } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO — inexistente ou de outro usuário |
| 409 | PEDIDO_IMUTAVEL — já submetido |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO com fields por item |

*Efeitos:* substitui os itens numa transação · recalcula totalCentavos no servidor

**`DELETE /api/pedidos/{id}`** — auth: sessao + ser o criador · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | { removido: true } |
| 404 | NAO_ENCONTRADO |
| 409 | PEDIDO_IMUTAVEL |

*Efeitos:* apaga Pedido e ItemPedido em cascata

**Modelos:** Pedido, ItemPedido · **Arquivos:** `app/api/pedidos/route.ts`, `app/api/pedidos/[id]/route.ts` · **Depende de:** `s3f4`, `s2f6`

**Fora de escopo:** Editar pedido submetido (fora de escopo no PRD) · Cancelar pedido submetido (decisão 5 da revisão) · Duplicar pedido rejeitado (extra E4)

### s5f2 · Submissão: resolve a faixa e grava a cadeia

**Categoria:** `api_endpoint`

Valida por inteiro, carimba submetidoEm, resolve a faixa, grava o snapshot e as etapas — tudo numa transação.

> Como comprador, quero que a cadeia seja definida na submissão, para que o pedido siga o caminho certo sem eu escolher ninguém.

**Steps:**

1. Escrever POST /api/pedidos/[id]/submissao
2. Validar com submissaoSchema
3. Carimbar submetidoEm no servidor, sem tocar a dataPedido do rascunho
4. Resolver a faixa pelo total e montar a cadeia
5. Gravar snapshot, etapas e situacao pendente numa transação

**Acceptance criteria:**

- [ ] Pedido de R$ 8.000 numa obra cuja faixa até R$ 10.000 tem [Amanda] grava cadeia com exatamente uma etapa, de Amanda, ordem 0
- [ ] Pedido de R$ 12.500 cuja faixa acima tem [Amanda, João] grava duas etapas nessa ordem, ambas pendentes
- [ ] Pedido de exatamente R$ 10.000,00 resolve para a faixa 'até R$ 10.000,00'
- [ ] Pedido com 5 itens de R$ 3.000 (total R$ 15.000) resolve pela faixa do TOTAL, não pelo valor de item isolado
- [ ] Total que não cai em nenhuma faixa responde 422 com código SEM_REGRA_APLICAVEL, e o pedido continua com situacao 'rascunho'
- [ ] Após a submissão, o pedido tem faixaLimiteCentavos e faixaSemTeto preenchidos a partir da faixa aplicada
- [ ] Rascunho sem dataPedido é recusado com 422 VALIDACAO e fields.dataPedido; com data, a dataPedido gravada é a do rascunho e submetidoEm é o horário do servidor no instante da submissão
- [ ] Submissão sem itens responde 422
- [ ] Submissão sem fornecedor ou sem obra responde 422 com fields
- [ ] Falha de validação não deixa etapa órfã: contagem de Etapa do pedido permanece zero
- [ ] Submeter pedido já submetido responde 409 PEDIDO_IMUTAVEL
- [ ] Submeter pedido de outro usuário responde 404

**Edge cases:**

- A faixa é apagada entre a leitura e a escrita: a transação relê e, se a faixa sumiu, responde 422 SEM_REGRA_APLICAVEL
- Obra sem faixa nenhuma: 422 SEM_REGRA_APLICAVEL com mensagem de obra sem faixas
- Faixa aplicável sem aprovador: 422 SEM_REGRA_APLICAVEL
- Dois POST de submissão concorrentes no mesmo pedido: a transação condiciona a situacao 'rascunho', e o segundo recebe 409

**`POST /api/pedidos/{id}/submissao`** — auth: sessao + ser o criador + papel comprador ou admin · timeout 8000ms · payload 1MB

| status | resposta |
|---|---|
| 200 | { id, situacao: 'pendente', cadeia: [{ ordem, usuarioId, nome, situacao }], faixa: { limiteCentavos, semTeto } } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |
| 409 | PEDIDO_IMUTAVEL — já submetido |
| 422 | VALIDACAO ou SEM_REGRA_APLICAVEL |

*Efeitos:* carimba submetidoEm (dataPedido é a do rascunho) · grava o snapshot da faixa no pedido · cria as Etapa da cadeia · muda situacao para pendente

**Modelos:** Pedido, Etapa, Faixa · **Arquivos:** `app/api/pedidos/[id]/submissao/route.ts` · **Depende de:** `s5f1`, `s2f3`, `s2f4`

**Fora de escopo:** Notificar o aprovador da vez (fora de escopo no PRD)

### s5f3 · Formulário de pedido com itens N

**Categoria:** `frontend`

Dados gerais, editor de itens com total calculado e não editável, e total do pedido somado ao vivo.

> Como comprador, quero ver o total somado enquanto digito, para saber de antemão qual alçada vou acionar.

**Steps:**

1. Formulário de obra, fornecedor e observações
2. Editor de itens começando com um item em branco, com adicionar, editar e remover
3. Total do item calculado e exibido como leitura
4. Total do pedido somado e visível
5. Habilitar o envio só com tudo válido, dizendo o que falta quando apagado

**Acceptance criteria:**

- [ ] Adicionar 3 itens válidos exibe, para cada um, total igual a quantidade x preço unitário
- [ ] Nenhum campo de total é editável: os inputs de total têm readonly
- [ ] O total do pedido é a soma dos totais dos itens e atualiza a cada alteração
- [ ] Item inválido fica fora da soma exibida
- [ ] O botão de cadastrar permanece desabilitado com o motivo visível enquanto houver campo inválido
- [ ] Quantidade negativa ou não numérica acende o erro NO ITEM correspondente, via error.fields
- [ ] Submeter sem nenhum item é recusado com mensagem clara
- [ ] Salvar rascunho, sair da tela e voltar restaura o que foi preenchido
- [ ] O formulário tem o campo obrigatório "Data do pedido" (input type=date), na posição do artboard; vazio, o erro acende no campo via fields.dataPedido e o botão de cadastrar fica desabilitado com o motivo visível

**Edge cases:**

- SEM_REGRA_APLICAVEL na submissão: mensagem específica, o rascunho permanece e a tela sugere criar a faixa na tela de regras
- Obra sem faixas escolhida: aviso antes mesmo de tentar submeter
- Nenhuma obra ou nenhum fornecedor no banco: empty state apontando o seed
- API fora do ar ao salvar: erro com repetição, sem perder o que está na tela
- Mais de 100 itens: o botão de adicionar desabilita com o motivo

**Modelos:** Pedido, ItemPedido, Obra, Fornecedor · **Arquivos:** `app/pedidos/novo/page.tsx`, `src/ui/componentes/`, `src/ui/hooks/` · **Depende de:** `s5f1`, `s5f2`

**Fora de escopo:** Simulador de cadeia ao vivo (extra E1) · Anexos (fora de escopo no PRD)

### s5f4 · Listagem de obras e fornecedores

**Categoria:** `api_endpoint`

As duas entidades que a Tela 1 seleciona, listadas por API. Só leitura: o cadastro delas continua fora de escopo, e o seed é quem as cria.

> Como cliente da API, quero listar obras e fornecedores, para montar um pedido sem depender da página que já os traz carregados.

**Steps:**

1. Escrever GET /api/obras devolvendo id, nome e cidade, por nome
2. Escrever GET /api/fornecedores devolvendo id, nome e documento, por nome
3. Exigir sessão nas duas, sem restrição de papel

**Acceptance criteria:**

- [ ] GET /api/obras com sessão de qualquer um dos quatro papéis responde 200 com um array de { id, nome, cidade } em ordem alfabética de nome
- [ ] GET /api/fornecedores com sessão de qualquer um dos quatro papéis responde 200 com um array de { id, nome, documento } em ordem alfabética de nome; documento é null quando não informado
- [ ] As duas rotas, sem sessão, respondem 403 com o envelope { error: { code: 'SEM_PERMISSAO', message } }
- [ ] A quantidade de itens devolvida é igual à contagem da tabela correspondente no banco (3 obras e 4 fornecedores com o seed)
- [ ] Nenhum campo além dos declarados atravessa a borda (criadoEm não aparece)
- [ ] A forma devolvida é a mesma que app/pedidos/novo/page.tsx entrega ao formulário

**Edge cases:**

- Tabela vazia: 200 com array vazio, não 404
- POST, PUT ou DELETE nas duas rotas: 405, porque só GET está exportado

**`GET /api/obras`** — auth: sessao, qualquer papel · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | [{ id, nome, cidade }] ordenado por nome; lista vazia quando não há obra |
| 403 | SEM_PERMISSAO — sem sessão |

**`GET /api/fornecedores`** — auth: sessao, qualquer papel · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | [{ id, nome, documento | null }] ordenado por nome; lista vazia quando não há fornecedor |
| 403 | SEM_PERMISSAO — sem sessão |

**Modelos:** Obra, Fornecedor · **Arquivos:** `app/api/obras/route.ts`, `app/api/fornecedores/route.ts` · **Depende de:** `s3f1`, `s3f4`

**Fora de escopo:** Cadastro, edição e remoção de obra e fornecedor (fora de escopo no PRD) · Paginação: as tabelas são pequenas e criadas pelo seed

**Definition of done:**

- [ ] Pedido de três itens montado, salvo como rascunho, retomado e submetido
- [ ] A cadeia aparece gravada no banco com as etapas na ordem da faixa
- [ ] SEM_REGRA_APLICAVEL bloqueia a submissão sem perder o rascunho
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

---

## Sprint 6 · Tela 2 — Aprovação

**Descrição:** Lista com filtros, detalhe com itens e histórico, decisão por UPDATE condicional e diálogo de rejeição com motivo obrigatório.

**Entregável:** Entrando como Amanda e depois como João, a mesma lista mostra filas diferentes, e aprovar como Amanda libera a decisão do João.

**Risco:** alto · **Pré-requisito:** s5 · **Agente:** `ag-fullstack` · **Stack:** `next`, `react`, `typescript`, `tailwind`, `prisma`, `zod`

### s6f1 · Listar pedidos com filtros e ações

**Categoria:** `api_endpoint`

Todos veem todos os pedidos submetidos; rascunho só do próprio criador. A resposta já diz o que a sessão pode fazer.

> Como aprovador, quero ver o que depende de mim, para não perder tempo com o que ainda não chegou na minha etapa.

**Steps:**

1. Escrever GET /api/pedidos com filtros de situação e obra
2. Incluir rascunhos apenas do usuário da sessão
3. Calcular, por pedido, as ações possíveis para a sessão
4. Devolver a alçada atual de cada pedido pendente

**Acceptance criteria:**

- [ ] Sem filtro, a lista traz todos os pedidos submetidos de todas as obras
- [ ] Rascunho de outro usuário NUNCA aparece na lista, para nenhum papel
- [ ] Rascunho próprio aparece apenas quando o filtro de situação inclui 'rascunho'
- [ ] Cada pedido traz identificador, obra, fornecedor, data, contagem de itens, total, situação e a etapa atual
- [ ] Cada pedido traz podeDecidir booleano, verdadeiro só para o aprovador da vez com papel aprovador
- [ ] Chamar como Amanda e como João devolve podeDecidir diferente para o mesmo pedido
- [ ] Filtro por situacao inválida responde 422
- [ ] Filtro por obra inexistente devolve lista vazia, não 404

**Edge cases:**

- Banco sem pedido nenhum: 200 com array vazio
- Pedido cuja faixa foi apagada: a alçada exibida vem do snapshot, não da faixa
- Mais de 200 pedidos: a resposta é paginada por padrão em 50, com query page e perPage

**`GET /api/pedidos`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

*Query:* `situacao`: rascunho|pendente|aprovado|rejeitado, opcional, repetível · `obraId`: string cuid, opcional · `page`: int >= 1, padrão 1 · `perPage`: int 1..100, padrão 50

| status | resposta |
|---|---|
| 200 | { itens: [{ id, obra, fornecedor, dataPedido, qtdItens, totalCentavos, situacao, etapaAtual, podeDecidir }], total, page, perPage } |
| 403 | SEM_PERMISSAO |
| 422 | VALIDACAO — filtro inválido |

**Modelos:** Pedido, Etapa, Obra, Fornecedor · **Arquivos:** `app/api/pedidos/route.ts` · **Depende de:** `s5f2`

**Fora de escopo:** Busca por texto · Ordenação configurável

### s6f2 · Detalhe do pedido com a cadeia gravada

**Categoria:** `api_endpoint`

Cabeçalho, itens, cadeia do snapshot e histórico de decisões.

> Como auditor, quero ver a cadeia sob a qual o pedido foi submetido, mesmo que a regra tenha mudado depois.

**Steps:**

1. Escrever GET /api/pedidos/[id]
2. Devolver os itens com total por linha
3. Devolver a cadeia lida das etapas gravadas
4. Devolver o histórico com quem decidiu, quando e o motivo

**Acceptance criteria:**

- [ ] A cadeia devolvida vem das Etapa gravadas, NUNCA recalculada a partir da alçada vigente
- [ ] Editar a faixa da obra e reabrir o pedido devolve a cadeia original
- [ ] Apagar a faixa e reabrir o pedido devolve a cadeia original e a alçada do snapshot
- [ ] O histórico traz, por etapa decidida, usuário, situação, decididoEm e motivo
- [ ] Rejeição aparece no histórico com o motivo preenchido
- [ ] Rascunho de outro usuário responde 404

**Edge cases:**

- Pedido inexistente: 404
- Rascunho próprio: devolvido com cadeia vazia e sem histórico
- Pedido cuja faixa foi apagada: faixaId nulo, e o detalhe mostra o limite do snapshot

**`GET /api/pedidos/{id}`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

| status | resposta |
|---|---|
| 200 | { id, obra, fornecedor, dataPedido, observacoes, situacao, totalCentavos, faixa: { limiteCentavos, semTeto }, itens: [...], cadeia: [{ ordem, usuario, situacao, decididoEm, motivo }], podeDecidir } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |

**Modelos:** Pedido, ItemPedido, Etapa · **Arquivos:** `app/api/pedidos/[id]/route.ts` · **Depende de:** `s6f1`

### s6f3 · Decisão por UPDATE condicional

**Categoria:** `api_endpoint`

Uma escrita condicionada ao estado que a autoriza. Zero linhas afetadas vira 409.

> Como aprovador, quero que decidir fora de ordem seja recusado pelo servidor, para que a ordem da alçada seja real.

**Steps:**

1. Escrever POST /api/pedidos/[id]/decisoes
2. Validar a decisão pelo domínio para obter a etapa alvo
3. Executar UPDATE condicionado a situacao pendente e todas as anteriores aprovadas
4. Traduzir zero linhas afetadas em 409
5. Atualizar a situação do pedido na mesma transação

**Acceptance criteria:**

- [ ] Como 2º aprovador, antes da decisão do 1º, POST responde 409 com código NAO_E_SUA_VEZ
- [ ] Dois POST concorrentes na mesma etapa, disparados com Promise.all, produzem exatamente um 200 e um 409
- [ ] Após a corrida, a etapa tem exatamente uma decisão registrada no banco
- [ ] Aprovar a última etapa muda a situacao do pedido para 'aprovado'
- [ ] Aprovar uma etapa intermediária mantém o pedido 'pendente' e libera a etapa seguinte
- [ ] Rejeitar qualquer etapa muda o pedido para 'rejeitado' e nenhuma etapa posterior se torna decidível
- [ ] Rejeitar sem motivo responde 422 com campos.motivo
- [ ] Motivo acima de 500 caracteres responde 422
- [ ] Decidir pedido já concluído responde 409 CADEIA_CONCLUIDA
- [ ] Decidir como quem não está na cadeia responde 409 NAO_E_SUA_VEZ
- [ ] Usuário com papel comprador ou visualizador responde 403 SEM_PERMISSAO
- [ ] O criador do pedido que também é o aprovador da vez PODE decidir: não há restrição de segregação de função

**Edge cases:**

- Duplo clique no mesmo botão: segundo pedido recebe 409, mesmo mecanismo da corrida
- Pedido em rascunho: 409 CADEIA_CONCLUIDA, porque não há cadeia
- Falha no meio da transação: rollback, sem etapa decidida e sem situacao alterada
- tipo de decisão fora de aprovar|rejeitar: 422

**`POST /api/pedidos/{id}/decisoes`** — auth: sessao + papel aprovador ou admin · timeout 8000ms · payload 1MB

*Body:* `tipo`: 'aprovar' | 'rejeitar' · `motivo`: string 3..500, obrigatório quando tipo = rejeitar

| status | resposta |
|---|---|
| 200 | { pedido: { id, situacao }, etapa: { ordem, situacao, decididoEm } } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |
| 409 | NAO_E_SUA_VEZ ou CADEIA_CONCLUIDA — inclui o caso de corrida perdida |
| 413 | payload acima de 1MB |
| 422 | VALIDACAO — motivo ausente ou longo demais |

*Efeitos:* UPDATE condicional na Etapa · atualiza Pedido.situacao na mesma transação

**Modelos:** Etapa, Pedido · **Arquivos:** `app/api/pedidos/[id]/decisoes/route.ts` · **Depende de:** `s6f2`, `s2f5`

**Fora de escopo:** Aprovação em paralelo ou por quórum (fora de escopo no PRD) · Delegação (fora de escopo no PRD)

### s6f4 · Lista de aprovação com filtro padrão

**Categoria:** `frontend`

Lista com todas as colunas do enunciado, abrindo filtrada em 'aguardando minha decisão' para o aprovador.

> Como aprovador, quero abrir a tela já vendo minha fila, para decidir sem procurar.

**Steps:**

1. Tabela com identificador, obra, fornecedor, data, itens, total, situação, alçada atual e ações
2. Filtros por situação e obra
3. Para papel aprovador, aplicar por padrão o filtro 'aguardando minha decisão', removível
4. Rascunhos próprios atrás de filtro explícito

**Acceptance criteria:**

- [ ] A lista traz as nove colunas do enunciado
- [ ] Entrando como aprovador, a lista abre filtrada em 'aguardando minha decisão'
- [ ] O filtro padrão é removível em um clique, e removê-lo mostra todos os pedidos submetidos
- [ ] Entrando como Amanda e depois como João, a mesma URL mostra filas diferentes
- [ ] Nenhum rascunho de outro usuário aparece em nenhum filtro
- [ ] A alçada atual exibida vem do back-end, não é recalculada na tela
- [ ] A lista tem estado de carregando, vazio e erro com repetição

**Edge cases:**

- Nenhum pedido aguardando a decisão do aprovador: empty state dizendo que a fila está vazia, com a ação de ver todos
- Banco vazio: empty state apontando o seed
- API fora do ar: erro com botão de tentar de novo

**Modelos:** Pedido · **Arquivos:** `app/pedidos/page.tsx`, `src/ui/hooks/` · **Depende de:** `s6f1`

### s6f5 · Detalhe, cadeia desenhada e diálogo de rejeição

**Categoria:** `frontend`

Itens, histórico, cadeia com a etapa corrente destacada, e decisão indisponível sempre explicada.

> Como aprovador, quero entender por que não posso decidir, para não ficar diante de um botão apagado em silêncio.

**Steps:**

1. Detalhe com itens e histórico de decisões
2. Componente de cadeia com concluídas, atual destacada e próximas
3. Ações de aprovar e rejeitar
4. Diálogo de rejeição com motivo obrigatório
5. Explicação própria para cada estado de decisão indisponível

**Acceptance criteria:**

- [ ] A cadeia mostra etapas concluídas, a atual destacada e as próximas
- [ ] A cadeia empilha no vertical e permanece legível em 390px de largura
- [ ] Rejeitar sem preencher o motivo não envia: a validação barra antes do submit
- [ ] O diálogo prende o foco, fecha com Esc e devolve o foco ao gatilho
- [ ] Nenhum botão de decisão fica desabilitado sem explicação ao lado
- [ ] Cadeia concluída, não é a sua vez e papel sem permissão têm, cada um, mensagem própria
- [ ] Rejeição aparece no histórico com o motivo
- [ ] Após aprovar, a tela reflete a nova etapa atual sem recarregar a página

**Edge cases:**

- 409 vindo do servidor enquanto a tela achava que podia decidir: a tela mostra a explicação e recarrega o estado
- Pedido rejeitado aberto: ações ausentes, com o motivo em destaque
- Tela estreita de 390px: tabela de itens vira cartões

**Modelos:** Pedido, Etapa, ItemPedido · **Arquivos:** `app/pedidos/[id]/page.tsx`, `src/ui/componentes/` · **Depende de:** `s6f2`, `s6f3`

**Definition of done:**

- [ ] Amanda e João veem filas diferentes na mesma lista
- [ ] Aprovar como Amanda libera a decisão do João
- [ ] Dois POST concorrentes produzem um 200 e um 409, verificado por script
- [ ] Rejeição exige motivo e encerra o pedido
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

---

## Sprint 7 · Estados, validações e responsividade

**Descrição:** Passada dedicada, não polvilhada pelo caminho: carregando, vazio, erro com repetição, validação por campo e layout de 390px para cima.

**Entregável:** Derrubar o servidor com a tela aberta produz estado de erro com botão de repetir, e nenhuma lista pisca conteúdo vazio antes de carregar.

**Risco:** baixo · **Pré-requisito:** s6 · **Agente:** `ag-fullstack` · **Stack:** `next`, `react`, `typescript`, `tailwind`, `zod`

### s7f1 · Carregando, vazio e erro em toda lista

**Categoria:** `frontend`

Os três estados como consequência da forma do hook de dados, não como trabalho de cada tela.

> Como qualquer usuário, quero entender o que está acontecendo quando algo falha, para não ficar diante de uma tela branca.

**Steps:**

1. Padronizar o hook de dados devolvendo dados, carregando, erro e recarregar
2. Esqueleto de carregamento em toda lista
3. Empty state próprio por lista
4. Caixa de erro com ação de tentar de novo

**Acceptance criteria:**

- [ ] Nenhuma lista renderiza conteúdo vazio antes de terminar de carregar: o esqueleto aparece primeiro
- [ ] Com a API derrubada, toda lista mostra erro com botão de tentar de novo
- [ ] Clicar em tentar de novo refaz a requisição sem recarregar a página
- [ ] Banco sem obras mostra empty state explicando que o seed precisa rodar
- [ ] Banco sem pedidos mostra empty state, não tabela com zero linhas
- [ ] Obra sem faixa mostra empty state explicando que nenhum pedido poderá ser submetido
- [ ] Todo hook de dados devolve a mesma quádrupla: dados, carregando, erro, recarregar

**Edge cases:**

- Erro 500 do servidor: mesma caixa de erro, com o código do envelope
- Resposta lenta acima de 300ms: o esqueleto permanece em vez de piscar
- Rede offline: mesma caixa de erro

**Arquivos:** `src/ui/hooks/`, `src/ui/componentes/` · **Depende de:** `s6f4`, `s6f5`

**Fora de escopo:** Cache entre navegações · Revalidação em foco

### s7f2 · Validação por campo com o schema do servidor

**Categoria:** `frontend`

O mesmo schema Zod nas duas pontas, com o erro ancorado no input certo via error.fields.

> Como compradora, quero o erro ancorado no campo, para não procurar o que corrigir.

**Steps:**

1. Importar os schemas do domínio no formulário
2. Mapear error.fields para os inputs
3. Ancorar erro de item no índice correto

**Acceptance criteria:**

- [ ] Quantidade negativa acende o erro no item correspondente, não no topo do formulário
- [ ] O formulário recusa o que a rota recusaria: o mesmo schema é importado de src/domain/schemas.ts
- [ ] Erro vindo do servidor em error.fields é exibido no input de mesmo nome
- [ ] Corrigir o campo limpa o erro sem novo envio

**Edge cases:**

- Erro sem fields: exibido como mensagem geral do formulário
- Campo do servidor sem input correspondente: cai na mensagem geral, nunca some

**Arquivos:** `src/ui/componentes/`, `app/pedidos/novo/page.tsx`, `app/alcadas/page.tsx` · **Depende de:** `s2f6`, `s5f3`

### s7f3 · Responsividade de 390px para cima

**Categoria:** `frontend`

Tabela de itens vira cartões abaixo de 768px; a cadeia empilha no vertical.

> Como usuário no canteiro, quero usar no celular, para não depender de voltar ao escritório.

**Steps:**

1. Tabela de itens virando cartões abaixo de 768px
2. Cadeia empilhando no vertical em tela estreita
3. Conferir as três telas em 390px

**Acceptance criteria:**

- [ ] Em 390px não há rolagem horizontal em nenhuma das três telas
- [ ] Abaixo de 768px a tabela de itens é renderizada como cartões
- [ ] A cadeia de aprovação permanece legível em 390px
- [ ] Alvos de toque têm ao menos 44px de altura

**Edge cases:**

- Descrição de item muito longa: quebra em vez de estourar o cartão
- Tabela de faixas com 10 aprovadores: lista empilha em vez de estourar

**Arquivos:** `src/ui/componentes/`, `app/globals.css` · **Depende de:** `s7f1`

**Fora de escopo:** Aplicativo nativo · Modo offline

**Definition of done:**

- [ ] Derrubar o servidor com a tela aberta produz erro com repetição em toda lista
- [ ] Nenhuma lista pisca conteúdo vazio
- [ ] Validação por campo ancorada via error.fields
- [ ] 390px sem rolagem horizontal nas três telas
- [ ] npx tsc --noEmit limpo, lint limpo, npm test verde

---

## Sprint 8 · Seed completo, prova e documentação

**Descrição:** Os oito pedidos posicionados em cada ponto do ciclo, o script de verificação por curl, as screenshots e o README.

**Entregável:** Alguém que nunca viu o projeto clona, segue o README e chega na tela de aprovação sem perguntar nada.

**Risco:** medio · **Pré-requisito:** s7 · **Agente:** `ag-integracao` · **Stack:** `prisma`, `tsx`, `bash`

### s8f1 · Seed completo com oito pedidos

**Categoria:** `database`

Cada ponto do ciclo representado, incluindo o pedido cuja faixa foi editada depois da submissão.

> Como avaliador, quero trocar de usuário e ver filas diferentes sem cadastrar nada, para avaliar em minutos.

**Steps:**

1. Semear usuários dos quatro papéis, obras, fornecedores e faixas
2. Semear rascunho completo e rascunho incompleto
3. Semear pendente na 1ª etapa e pendente na 2ª com a 1ª aprovada
4. Semear aprovado e rejeitado com motivo
5. Semear um pedido cuja faixa foi editada após a submissão
6. Semear um pedido cuja faixa foi apagada após a submissão

**Acceptance criteria:**

- [ ] O seed cria ao menos 2 obras, 4 usuários cobrindo os quatro papéis, e 8 pedidos
- [ ] Existe ao menos um pedido em cada situação: rascunho, pendente, aprovado, rejeitado
- [ ] Existe um pedido pendente na 2ª etapa com a 1ª já aprovada
- [ ] Existe um pedido cuja faixa foi editada após a submissão, e sua cadeia difere da faixa atual da obra
- [ ] Existe um pedido com faixaId nulo e faixaLimiteCentavos preenchido — faixa apagada, snapshot intacto
- [ ] Entrar como Amanda e como João mostra filas diferentes sem nenhuma edição manual
- [ ] npm run db:reset seguido de npm run seed reproduz exatamente o mesmo estado

**Edge cases:**

- Seed rodado sobre banco populado: falha por unicidade em vez de duplicar
- Datas do seed fixas, para as screenshots não mudarem a cada execução

**Modelos:** Usuario, Obra, Fornecedor, Faixa, FaixaAprovador, Pedido, ItemPedido, Etapa · **Arquivos:** `prisma/seed.ts` · **Depende de:** `s6f3`

### s8f2 · Script de verificação por curl

**Categoria:** `infra`

Demonstra 409 em decisão fora de ordem, 409 em decisão concorrente e 403 em rota de alçada.

> Como avaliador, quero rodar um script e ver os códigos, para conferir a regra sem ler o código.

**Steps:**

1. Escrever scripts/verificar.sh com curl comentado
2. Abrir sessão de cada usuário necessário
3. Demonstrar 409 fora de ordem
4. Demonstrar 409 em corrida com dois curl simultâneos
5. Demonstrar 403 na rota de alçada

**Acceptance criteria:**

- [ ] O script roda contra o servidor local e imprime o status HTTP de cada chamada
- [ ] Demonstra 409 NAO_E_SUA_VEZ para decisão fora de ordem
- [ ] Demonstra exatamente um 200 e um 409 em duas decisões disparadas em paralelo
- [ ] Demonstra 403 SEM_PERMISSAO em PUT /api/faixas/{id} como aprovador
- [ ] Demonstra 422 SEM_REGRA_APLICAVEL numa submissão acima do teto
- [ ] Cada bloco tem um comentário dizendo o que está sendo provado
- [ ] O script termina com código 0 quando todos os status esperados ocorreram

**Edge cases:**

- Servidor não está no ar: o script falha cedo com mensagem dizendo para rodar npm run dev
- Banco não semeado: o script avisa e sai

**Arquivos:** `scripts/verificar.sh` · **Depende de:** `s8f1`

### s8f3 · Screenshots e README

**Categoria:** `estrutura`

As três telas capturadas e a documentação completa, incluindo o que mudaria em produção.

> Como avaliador, quero entender a entrega sem executar nada, para formar opinião antes de rodar.

**Steps:**

1. Capturar as três telas do enunciado
2. Escrever instalação, execução e seed
3. Escrever tecnologias e motivos
4. Escrever a modelagem da alçada e a comunicação front-back
5. Escrever consistência e o que mudaria em produção
6. Escrever a tabela do que cada usuário vê

**Acceptance criteria:**

- [ ] O README tem instalação, execução, seed, tecnologias com motivo, modelagem da alçada, comunicação front-back, consistência e o que mudaria em produção
- [ ] As três telas do enunciado estão no README como imagem legível
- [ ] Existe uma tabela do que cada papel vê e pode fazer
- [ ] Todo número citado no README é reproduzível pelo seed
- [ ] Seguir o README do zero chega à tela de aprovação sem passo faltando
- [ ] O README declara as divergências deliberadas do mockup e seus motivos

**Edge cases:**

- Screenshot desatualizada após mudança de tela: recapturar faz parte do critério

**Arquivos:** `README.md`, `docs/screenshots/` · **Depende de:** `s8f1`, `s8f2`

### s8f4 · Pull Request

**Categoria:** `estrutura`

Aberto no dia 31, com e-mail e telefone na descrição, conforme o enunciado.

> Como candidata, quero o PR aberto com um dia de folga, para que imprevisto no GitHub não custe a entrega.

**Steps:**

1. Conferir tsc, lint e testes
2. Abrir o PR contra o repositório do case
3. Incluir e-mail e telefone na descrição

**Acceptance criteria:**

- [ ] O PR está aberto contra o repositório do case
- [ ] A descrição contém e-mail e telefone
- [ ] npx tsc --noEmit, npm run lint e npm test passam no commit do PR
- [ ] O PR foi aberto até 31/10, não em 01/11

**Edge cases:**

- Conflito com a base: resolver antes de abrir

**Depende de:** `s8f3`

**Definition of done:**

- [ ] Seed reproduz os oito pedidos em um comando
- [ ] scripts/verificar.sh demonstra 403, 409 e 422
- [ ] README completo com as três screenshots
- [ ] PR aberto com e-mail e telefone

---

## Sprint 9 · Extra E1 — Simulador de alçada ao vivo *(extra)*

**Descrição:** Na tela de cadastro, a cadeia prevista aparece conforme o total muda, inclusive o estado sem regra aplicável.

**Entregável:** Mudar um preço muda a cadeia prevista na tela, sem criar nada no banco.

**Risco:** baixo · **Pré-requisito:** s8 · **Agente:** `ag-fullstack` · **Stack:** `next`, `react`, `typescript`, `zod`

### e1f1 · Rota de simulação da cadeia

**Categoria:** `api_endpoint`

Recebe obra e total, devolve a cadeia prevista sem criar nada. Reaproveita resolverFaixa.

> Como compradora, quero ver quem vai aprovar antes de enviar, para saber em que alçada estou caindo.

**Steps:**

1. Escrever POST /api/alcadas/simulacao
2. Reusar resolverFaixa e montarCadeia
3. Devolver também o estado sem regra aplicável

**Acceptance criteria:**

- [ ] A rota não cria nem altera nenhuma linha: contagem de Pedido e Etapa é idêntica antes e depois
- [ ] Devolve a mesma cadeia que a submissão gravaria para o mesmo total e obra
- [ ] Total sem faixa aplicável devolve 200 com o estado sem regra aplicável, não 422 — simular não é submeter
- [ ] Obra inexistente responde 404

**Edge cases:**

- Total zero: devolve a faixa mais baixa
- Obra sem faixas: estado sem regra aplicável com a mensagem de obra sem faixas

**`POST /api/alcadas/simulacao`** — auth: sessao · timeout 5000ms · payload 1MB · idempotente

*Body:* `obraId`: string cuid · `totalCentavos`: int >= 0

| status | resposta |
|---|---|
| 200 | { aplicavel: boolean, faixa?: { limiteCentavos, semTeto }, cadeia?: [{ ordem, usuarioId, nome }], motivo?: string } |
| 404 | NAO_ENCONTRADO |
| 422 | VALIDACAO |

**Modelos:** Faixa, Obra · **Arquivos:** `app/api/alcadas/simulacao/route.ts` · **Depende de:** `s2f3`, `s2f4`

### e1f2 · Cadeia prevista no cadastro

**Categoria:** `frontend`

Componente que atualiza conforme o total muda, desenhado no artboard AprovacoesB.

> Como compradora, quero ver a cadeia mudar enquanto digito, para entender a regra sem ler documentação.

**Steps:**

1. Componente de cadeia prevista na tela de cadastro
2. Chamar a simulação com debounce ao mudar o total
3. Exibir o estado sem regra aplicável

**Acceptance criteria:**

- [ ] Mudar um preço e sair do campo atualiza a cadeia prevista
- [ ] A chamada é feita com debounce de ao menos 300ms
- [ ] O estado sem regra aplicável aparece com a mesma mensagem que a submissão daria
- [ ] O componente tem estado de carregando próprio e não bloqueia a digitação

**Edge cases:**

- Total inválido: o componente mantém a última cadeia válida e sinaliza que está desatualizada
- API fora do ar: o componente some em vez de mostrar erro; a simulação é conforto, não requisito

**Arquivos:** `src/ui/componentes/`, `app/pedidos/novo/page.tsx` · **Depende de:** `e1f1`, `s5f3`

**Definition of done:**

- [ ] Mudar um preço muda a cadeia na tela
- [ ] Nenhuma linha é criada pela simulação

---

## Sprint 10 · Extra E2 — Suíte de integração da API *(extra)*

**Descrição:** O segundo seam do projeto: Route Handler chamado com Request montado à mão, contra banco de teste.

**Entregável:** npm test cobre os dois projetos, e o 409 de corrida tem caso automatizado.

**Risco:** medio · **Pré-requisito:** s8 · **Agente:** `ag-backend` · **Stack:** `vitest`, `prisma`, `typescript`

### e2f1 · Banco de teste e limpeza entre casos

**Categoria:** `build`

Banco separado, reset de schema antes da suíte e limpeza na ordem das dependências.

> Como desenvolvedora, quero rodar testes sem apagar meu seed, para não escolher entre testar e demonstrar.

**Steps:**

1. Apontar o projeto api para .env.test
2. Rodar migrate reset --force --skip-seed antes da suíte
3. Limpar em beforeEach na ordem inversa da criação
4. Escrever as fábricas em tests/fabricas.ts

**Acceptance criteria:**

- [ ] A suíte de API usa prisma/test.db, nunca o banco de desenvolvimento
- [ ] Rodar a suíte não altera o banco de desenvolvimento
- [ ] Cada caso monta só os dados de que precisa, por fábrica
- [ ] A limpeza apaga na ordem decisões, etapas, itens, pedidos, faixas, obras, usuários, fornecedores
- [ ] A suíte roda em série: fileParallelism é false
- [ ] Nenhum caso usa prisma.$transaction com rollback para isolar

**Edge cases:**

- .env.test ausente: a suíte de API falha cedo com mensagem nomeando o arquivo
- test.db corrompido: migrate reset recria

**Arquivos:** `tests/fabricas.ts`, `tests/setup.ts`, `.env.test` · **Depende de:** `s2f7`

**Fora de escopo:** Nível 2b: subir o app e fazer fetch contra localhost

### e2f2 · Sete casos no nível do handler

**Categoria:** `build`

Fora de ordem, duplicada, corrida, permissão, escopo de leitura, sem regra aplicável e snapshot.

> Como desenvolvedora, quero o 409 de corrida provado por teste, para que a decisão mais sutil do projeto não dependa de inspeção.

**Steps:**

1. Importar o handler da rota e chamá-lo com Request montado
2. Montar o header cookie da sessão desejada
3. Escrever os sete casos
4. Rodar os dois projetos

**Acceptance criteria:**

- [ ] Caso 1: decisão fora de ordem responde 409 NAO_E_SUA_VEZ
- [ ] Caso 2: segunda decisão na mesma etapa responde 409
- [ ] Caso 3: duas decisões com Promise.all produzem exatamente um 200 e um 409, e uma linha decidida no banco
- [ ] Caso 4: PUT de faixa como aprovador responde 403 SEM_PERMISSAO
- [ ] Caso 5: GET de pedidos não devolve rascunho de outro usuário
- [ ] Caso 6: submissão acima do teto responde 422 SEM_REGRA_APLICAVEL e o pedido continua rascunho
- [ ] Caso 7: editar a faixa após a submissão não altera a cadeia devolvida pelo detalhe
- [ ] npm test executa os projetos dominio e api, ambos verdes

**Edge cases:**

- Handler que dependa de cookies() de next/headers: o caso falha, e isso é o teste da regra do ADR 0003

**Arquivos:** `tests/api/` · **Depende de:** `e2f1`, `s6f3`

**Definition of done:**

- [ ] npm test cobre os dois projetos
- [ ] O 409 de corrida tem caso automatizado
- [ ] A suíte de API não toca no banco de desenvolvimento

---

## Sprint 11 · Extra E3 — Gráfico na administração *(extra)*

**Descrição:** Menor prioridade do backlog: não melhora nenhum critério do enunciado diretamente.

**Entregável:** Gráfico de pedidos por situação na tela de administração.

**Risco:** baixo · **Pré-requisito:** e2 · **Agente:** `ag-fullstack` · **Stack:** `next`, `react`, `typescript`

### e3f1 · Gráfico de pedidos por situação

**Categoria:** `frontend`

Contagem por situação, exibida na tela de administração.

> Como admin, quero ver a distribuição dos pedidos, para saber onde está o acúmulo.

**Steps:**

1. Rota de contagem agrupada por situação
2. Gráfico de barras na tela de administração

**Acceptance criteria:**

- [ ] A contagem exibida bate com a contagem do banco por situação
- [ ] Rascunho de outro usuário não entra na contagem de ninguém
- [ ] O gráfico tem estado de carregando, vazio e erro
- [ ] Banco vazio mostra empty state em vez de gráfico com eixos zerados

**Edge cases:**

- Uma única situação presente: o gráfico continua legível

**`GET /api/pedidos/resumo`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB · idempotente

*Query:* `obraId`: string cuid, opcional

| status | resposta |
|---|---|
| 200 | { porSituacao: { rascunho, pendente, aprovado, rejeitado } } |
| 403 | SEM_PERMISSAO |

**Modelos:** Pedido · **Arquivos:** `app/api/pedidos/resumo/route.ts` · **Depende de:** `s6f1`

**Fora de escopo:** Série temporal · Exportação

### e3f2 · Painel da administração em uma leitura

**Categoria:** `api_endpoint`

KPIs do período, série semanal de valor aprovado, cortes por faixa e por aprovador e fila de atenção, todos derivados do mesmo conjunto de pedidos lido num instante só. Entrou depois da E3, a pedido da autora (PROGRESS, § Painel da administração completo), sem feature na SPEC; registrada aqui para que a rota tenha dono, descrevendo o comportamento que ela já tem.

> Como admin, quero ver numa tela só volume, valor aprovado, tempo de decisão, rejeição e o que está parado, para saber onde a cadeia de aprovação trava.

**Steps:**

1. Rota que lê os pedidos visíveis à sessão, com etapas, e calcula tudo a partir de um único 'agora'
2. Derivações puras em src/domain/painel.ts, com caso de teste
3. Tela /admin consumindo a rota, com período de 7, 30 ou 90 dias e filtro de obra

**Acceptance criteria:**

- [ ] Sem sessão, ou com papel diferente de admin, GET /api/pedidos/painel responde 403 SEM_PERMISSAO antes de consultar pedidos
- [ ] Sem o parâmetro dias, o período é de 30 dias; dias aceita só 7, 30 ou 90, e qualquer outro valor responde 422 VALIDACAO com fields.dias
- [ ] obraId com formato inválido responde 422 VALIDACAO com fields.obraId, pelo mesmo schema de GET /api/pedidos
- [ ] O escopo de leitura é o mesmo de GET /api/pedidos: rascunho de outro usuário não entra em número nenhum
- [ ] kpis.pedidos, valorAprovadoCentavos, tempoMedioEmMs e rejeicao contam só pedidos submetidos dentro da janela, e trazem o valor da janela anterior de mesmo tamanho; variacao é null quando o anterior é zero
- [ ] kpis.parados conta os pendentes com a vez parada há 24 h ou mais no momento da chamada, independente da janela; criticos são os de 72 h ou mais
- [ ] serie tem 6 pontos S1..S6, blocos de 7 dias contados para trás a partir de agora, com o valor aprovado por obra posto na semana em que a cadeia foi concluída
- [ ] porFaixa agrupa os submetidos pelo snapshot de faixa gravado no pedido (ADR 0001), não pela alçada vigente
- [ ] porAprovador mede, por usuário, o tempo entre receber a vez e decidir, considerando só etapas decididas
- [ ] fila lista os pendentes parados há 24 h ou mais, do mais antigo para o mais novo, com quem tem a vez e o nível
- [ ] obras traz todas as obras cadastradas, por nome, para o seletor não perder opções ao filtrar
- [ ] submetidos é a contagem de pedidos não rascunho no recorte; a tela mostra empty state quando é zero
- [ ] A contagem por situação não está neste payload: o gráfico de e3f1 a lê de GET /api/pedidos/resumo

**Edge cases:**

- Nenhum pedido concluído no período: tempoMedioEmMs.valor é null, não zero
- Período sem pedido submetido: rejeicao.taxa é null

**`GET /api/pedidos/painel`** — auth: sessao + papel admin · timeout 5000ms · payload 1MB · idempotente

*Query:* `dias`: 7 | 30 | 90, opcional, padrão 30 · `obraId`: string cuid, opcional

| status | resposta |
|---|---|
| 200 | { agora, dias, obraId | null, obras: [{ id, nome }], kpis: { pedidos, valorAprovadoCentavos, tempoMedioEmMs, rejeicao, parados }, serie: { obras, pontos }, porFaixa, porAprovador, fila, comUmaAssinatura, submetidos } |
| 403 | SEM_PERMISSAO |
| 422 | VALIDACAO — dias fora de 7/30/90 ou obraId malformado |

**Modelos:** Pedido, Etapa, Obra, Fornecedor · **Arquivos:** `app/api/pedidos/painel/route.ts`, `src/domain/painel.ts`, `src/ui/painel.ts`, `src/ui/componentes/PainelDoAdmin.tsx`, `app/admin/page.tsx` · **Depende de:** `e3f1`

**Fora de escopo:** Exportação · Contagem por situação (é de e3f1)

**Definition of done:**

- [ ] O gráfico existe e não atrapalha nenhuma tela

---

## Sprint 12 · Extra E4 — Duplicar pedido rejeitado *(extra)*

**Descrição:** Cria um rascunho novo a partir de um pedido rejeitado, sem tocar no original.

**Entregável:** Duplicar um pedido rejeitado abre um rascunho novo com os mesmos itens.

**Risco:** baixo · **Pré-requisito:** e3 · **Agente:** `ag-fullstack` · **Stack:** `next`, `react`, `typescript`, `prisma`

### e4f1 · Duplicar pedido

**Categoria:** `api_endpoint`

Copia cabeçalho e itens para um rascunho novo. O pedido original permanece intacto.

> Como comprador, quero corrigir o que foi rejeitado sem redigitar tudo, para responder rápido ao motivo.

**Steps:**

1. Escrever POST /api/pedidos/[id]/duplicacao
2. Copiar obra, fornecedor, observações e itens
3. Criar como rascunho do usuário da sessão, sem cadeia e sem histórico

**Acceptance criteria:**

- [ ] O novo pedido tem situacao 'rascunho', nenhuma etapa e nenhum snapshot de faixa
- [ ] O pedido original permanece com a situação, a cadeia e o motivo intactos
- [ ] Os itens copiados mantêm descrição, quantidade, unidade e preço
- [ ] dataPedido do novo pedido é nula
- [ ] Duplicar pedido de outro usuário responde 404
- [ ] O criador do novo rascunho é o usuário da sessão, não o do original

**Edge cases:**

- Duplicar pedido com mais de 100 itens: impossível, porque o original já respeitava o limite
- Fornecedor do original apagado: o campo vem nulo e o rascunho continua válido

**`POST /api/pedidos/{id}/duplicacao`** — auth: sessao + papel comprador ou admin · timeout 5000ms · payload 1MB

| status | resposta |
|---|---|
| 201 | { id, situacao: 'rascunho' } |
| 403 | SEM_PERMISSAO |
| 404 | NAO_ENCONTRADO |

*Efeitos:* cria Pedido e ItemPedido novos

**Modelos:** Pedido, ItemPedido · **Arquivos:** `app/api/pedidos/[id]/duplicacao/route.ts` · **Depende de:** `s5f1`

**Fora de escopo:** Reabrir o próprio pedido rejeitado — destruiria a trilha, contradiz o ADR 0001

**Definition of done:**

- [ ] Duplicar abre rascunho novo
- [ ] O pedido rejeitado permanece intacto
