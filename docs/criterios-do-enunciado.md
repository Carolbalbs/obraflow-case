# Critérios do enunciado — onde cada um está

Cada exigência do enunciado do case (o `README.md` original do fork, no commit `2b90b3e`) cruzada
com o lugar do projeto que a implementa. Levantado em 31/10/2026 lendo o código e exercitando a
API contra o servidor local; atualizado em 01/11/2026 depois dos fixes finais (ver
[PROGRESS.md, § Fixes finais](PROGRESS.md)) e conferido de novo na mesma data, antes de
fechar o PR: referências de linha revistas e cada validação reexecutada por `curl`.

**Legenda:** ✅ atendido · ◐ atendido com divergência deliberada · ⚠️ parcial ou risco · ❌ pendente

---

## Resumo por peso de avaliação

| Critério | Peso | Situação | Onde pesa |
|---|---:|:---:|---|
| Funcionamento completo: front, back e persistência | 25% | ✅ | Todas as rotas e telas exercitadas por `curl` e navegador |
| Modelagem e implementação das regras de alçada | 20% | ✅ | `src/domain/`, snapshot, UPDATE condicional, corrida provada |
| Qualidade de código, organização e decisões técnicas | 15% | ✅ | Domínio puro, 7 ADRs, mapa de erros central; toda rota tem feature na SPEC |
| Desenho de UI: hierarquia, clareza, consistência | 20% | ✅ | 9 screenshots; depende do julgamento de quem avalia |
| Estados, responsividade e validações | 10% | ✅ | Completo; data do pedido obrigatória e preço zero aceito, como o enunciado pede |
| Documentação (`## Decisões técnicas`) | 10% | ✅ | Seção com exatamente esse título em [README.md:266](../README.md#L266) |

---

## Backend e persistência

| # | Exigência | | Onde |
|---|---|:---:|---|
| B1 | Cadastrar e listar obras, usuários, fornecedores, pedidos e regras de alçada | ◐ | Pedidos e regras: completo. Listagem por API das outras três: [`GET /api/obras`](../app/api/obras/route.ts) e [`GET /api/fornecedores`](../app/api/fornecedores/route.ts) (sessão, qualquer papel; feature `s5f4`) e [`GET /api/usuarios`](../app/api/usuarios/route.ts) (atrás de `DEMO_MODE`). **Cadastro** dessas três fica com o seed — fora de escopo declarado no PRD § 3 e no README |
| B2 | Pedido com cabeçalho e N itens; calcular e persistir totais | ✅ | Total do item em [dinheiro.ts:77](../src/domain/dinheiro.ts#L77) (`porMilesimos`, arredondamento único), soma em [dinheiro.ts:66](../src/domain/dinheiro.ts#L66). Itens substituídos e total recalculado numa transação em [api/pedidos/[id]/route.ts:54](../app/api/pedidos/[id]/route.ts#L54). Total enviado pelo cliente é ignorado |
| B3 | Cadeia de aprovadores conforme obra e valor **total** | ✅ | [alcada.ts:76](../src/domain/alcada.ts#L76) `resolverFaixa`, limite inclusivo em [alcada.ts:61](../src/domain/alcada.ts#L61) `comporta`, cadeia em [cadeia.ts:34](../src/domain/cadeia.ts#L34) `montarCadeia` |
| B4 | Registrar aprovações e rejeições, com motivo obrigatório | ✅ | Rota [api/pedidos/[id]/decisoes](../app/api/pedidos/[id]/decisoes/route.ts); motivo validado em [decisao.ts:45](../src/domain/decisao.ts#L45) `rejeitar` |
| B5 | Impedir decisão fora de ordem e preservar o histórico | ✅ | UPDATE condicional em [server/decisao.ts:88](../src/server/decisao.ts#L88); zero linhas afetadas vira 409 em [server/decisao.ts:100](../src/server/decisao.ts#L100). O histórico é a própria `Etapa` (`decididoEm`, `motivo`) — nada é apagado. Verificado: **409 NAO_E_SUA_VEZ** |
| B6 | Criar, editar, remover e consultar níveis e aprovadores por obra | ✅ | [api/obras/[id]/faixas](../app/api/obras/[id]/faixas/route.ts) (GET, POST) e [api/faixas/[id]](../app/api/faixas/[id]/route.ts) (PUT substitui a faixa inteira, DELETE) |
| B7 | Garantir consistência de leituras e escritas | ✅ | Sete `prisma.$transaction`, incluindo submissão ([submissao/route.ts:58](../app/api/pedidos/[id]/submissao/route.ts#L58)) e decisão ([server/decisao.ts:63](../src/server/decisao.ts#L63)). Verificado: dois POST simultâneos dão **200 e 409**, com **uma** etapa decidida no banco |
| B8 | Dados de demonstração: ≥2 obras, usuários, regras, pedidos em estados diferentes | ✅ | [prisma/seed.ts](../prisma/seed.ts): 3 obras, 6 usuários nos 4 papéis, 4 fornecedores, 3 faixas em 2 obras, 8 pedidos — inclusive faixa editada e faixa apagada depois da submissão |
| B9 | README: iniciar, popular, consumir a API, endpoints e payloads | ✅ | [Como rodar](../README.md#L113), [O que o seed cria](../README.md#L174), tabela de endpoints (todas as rotas de `app/api/`, inclusive `obras`, `fornecedores`, `pedidos/resumo` e `pedidos/painel`) e exemplo `curl` completo a partir de [README.md:358](../README.md#L358). `/admin` descrito em [README.md:87](../README.md#L87) e na tabela de telas de "Onde está cada coisa" |

## Tecnologias

| Exigência | | Onde |
|---|:---:|---|
| Executar localmente, sem serviço pago nem credencial externa | ✅ | SQLite em arquivo; motivos em [README.md:268](../README.md#L268) |
| Testes (desejáveis) | ✅ | 56 casos Vitest — 47 no domínio (18 deles do painel), 8 de UI, 1 de configuração —, config em [vitest.config.mts](../vitest.config.mts). Os testes de rota (extra E2) não foram feitos |

## Tela 1 — Cadastro de pedido

| Exigência | | Onde |
|---|:---:|---|
| Obra, obrigatória, listando as disponíveis | ✅ | Obras carregadas em [pedidos/novo/page.tsx:41](../app/pedidos/novo/page.tsx#L41), na mesma forma de `GET /api/obras`; obrigatória em [schemas.ts:214](../src/domain/schemas.ts#L214) |
| Fornecedor, obrigatório | ✅ | `submissaoSchema`, [schemas.ts:214](../src/domain/schemas.ts#L214) |
| **Data do pedido, obrigatória** | ✅ | Campo `type="date"` em [FormularioDePedido.tsx:298](../src/ui/componentes/FormularioDePedido.tsx#L298); obrigatória na submissão ([schemas.ts:151](../src/domain/schemas.ts#L151), `fields.dataPedido` = "Informe a data do pedido."), opcional no rascunho. A submissão não a sobrescreve: carimba só `submetidoEm` ([submissao/route.ts:73](../app/api/pedidos/[id]/submissao/route.ts#L73)). Distinção documentada em [README.md:403](../README.md#L403). Verificado por `curl`: sem data, 422; com data, a gravada é a enviada |
| Observações internas, opcional | ✅ | `observacoes`, até 2.000 caracteres |
| Começa com um item em branco; adicionar, editar, remover N itens | ✅ | [FormularioDePedido.tsx:137](../src/ui/componentes/FormularioDePedido.tsx#L137) `itemEmBranco`; adicionar em [ItensDoPedido.tsx:134](../src/ui/componentes/ItensDoPedido.tsx#L134), remover em [:247](../src/ui/componentes/ItensDoPedido.tsx#L247) |
| Quantidade positiva, aceitando decimais | ✅ | [schemas.ts:67](../src/domain/schemas.ts#L67) — até três casas, precisão excedente recusada, nunca truncada |
| **Preço unitário: valor monetário não negativo** | ✅ | Zero aceito, negativo recusado ("O preço unitário não pode ser negativo.", [schemas.ts:57](../src/domain/schemas.ts#L57)). No rascunho, preço não informado é `null` — migration `20261101110631_preco_unitario_opcional_no_rascunho` —, para que ausência não passe pela submissão como R$ 0,00 |
| Total do item calculado, não editável | ✅ | `<input readOnly>` em [ItensDoPedido.tsx:233](../src/ui/componentes/ItensDoPedido.tsx#L233) |
| Total do pedido pela soma dos itens | ✅ | Cartão [ResumoDoPedido.tsx](../src/ui/componentes/ResumoDoPedido.tsx), também `readOnly`; o servidor recalcula |
| "Cadastrar pedido" só disponível com tudo válido | ✅ | [FormularioDePedido.tsx:222](../src/ui/componentes/FormularioDePedido.tsx#L222): `disabled` enquanto houver `motivo`, que é exibido |
| Back persiste cabeçalho, itens, total e cadeia inicial | ✅ | Uma transação em [submissao/route.ts:58](../app/api/pedidos/[id]/submissao/route.ts#L58): `submetidoEm` ([:73](../app/api/pedidos/[id]/submissao/route.ts#L73)), snapshot da faixa ([:75](../app/api/pedidos/[id]/submissao/route.ts#L75)) e etapas ([:85](../app/api/pedidos/[id]/submissao/route.ts#L85)). A `dataPedido` já vem gravada do rascunho |

## Tela 2 — Aprovação

| Exigência | | Onde |
|---|:---:|---|
| Identificador, obra, fornecedor, data, itens, total, situação, alçada atual, ações | ✅ | [ListaDePedidos.tsx](../src/ui/componentes/ListaDePedidos.tsx) sobre `GET /api/pedidos` |
| Detalhe com itens (descrição, quantidade, unidade, preço, total) e histórico | ✅ | [DetalheDoPedido.tsx](../src/ui/componentes/DetalheDoPedido.tsx), cadeia em [CadeiaDoPedido.tsx:26](../src/ui/componentes/CadeiaDoPedido.tsx#L26) |
| Pendentes refletem o nível atual, calculado e persistido pelo back | ✅ | `etapaAtual` e `podeDecidir` vêm da API ([server/pedido.ts:94](../src/server/pedido.ts#L94)); a lista do aprovador abre em "aguardando minha decisão" ([ListaDePedidos.tsx:52](../src/ui/componentes/ListaDePedidos.tsx#L52)) |
| Rejeição exige motivo, interrompe o fluxo, fica no histórico | ✅ | [DialogoDeRejeicao.tsx](../src/ui/componentes/DialogoDeRejeicao.tsx) (foco preso, Esc); efeito em [decisao.ts:122](../src/domain/decisao.ts#L122) `situacaoApos` |
| Cadeia concluída: decisão desabilitada com explicação | ✅ | [DetalheDoPedido.tsx:358](../src/ui/componentes/DetalheDoPedido.tsx#L358) — explicação própria para cada motivo |

## Tela 3 — Regras da alçada

| Exigência | | Onde |
|---|:---:|---|
| Selecionar uma obra | ✅ | [RegrasDaAlcada.tsx:175](../src/ui/componentes/RegrasDaAlcada.tsx#L175) |
| Listar usuários disponíveis | ✅ | [EditorDeFaixa.tsx](../src/ui/componentes/EditorDeFaixa.tsx) |
| Criar, editar e remover faixas | ✅ | `RegrasDaAlcada`, `EditorDeFaixa`, `DialogoDeRemocao` (que conta os pedidos em andamento afetados) |
| Definir o limite de valor de cada faixa | ✅ | `limiteCentavos`, inclusivo; a faixa aberta é a sem limite |
| Adicionar, remover e reordenar aprovadores | ✅ | [EditorDeFaixa.tsx:112](../src/ui/componentes/EditorDeFaixa.tsx#L112); verificado: reordenar e salvar persiste |
| Listar as regras salvas da obra | ✅ | `GET /api/obras/{id}/faixas` |
| Comportamento sem regra aplicável definido e documentado | ✅ | Três caminhos em [alcada.ts:76](../src/domain/alcada.ts#L76); 422 `SEM_REGRA_APLICAVEL` mantendo o rascunho; documentado em [README.md:191](../README.md#L191) e [:318](../README.md#L318) |

## Validações e erros (exigidos)

| Situação | | Onde |
|---|:---:|---|
| Quantidade ou preço inválido, negativo ou não numérico | ✅ | [schemas.ts:45](../src/domain/schemas.ts#L45) e [:67](../src/domain/schemas.ts#L67); erro no item via `aria-invalid` em [ItensDoPedido.tsx:400](../src/ui/componentes/ItensDoPedido.tsx#L400). Preço zero é aceito, como o enunciado pede |
| Pedido sem itens | ✅ | `submissaoSchema`: "O pedido precisa de ao menos um item." |
| Campos obrigatórios vazios (obra, fornecedor, **data**, descrição) | ✅ | Os quatro com erro no campo, e o botão de envio diz o que falta |
| Nenhuma obra cadastrada | ✅ | Empty state em [RegrasDaAlcada.tsx:223](../src/ui/componentes/RegrasDaAlcada.tsx#L223) e [FormularioDePedido.tsx:263](../src/ui/componentes/FormularioDePedido.tsx#L263) |
| API fora do ar / 500 | ✅ | `CaixaDeErro` com "Tentar novamente" em [estados.tsx:73](../src/ui/componentes/estados.tsx#L73) |
| Rejeitar sem motivo | ✅ | Barrado no diálogo antes do envio; o servidor responde 422 com `fields.motivo` (verificado) |
| Cadeia já concluída | ✅ | [DetalheDoPedido.tsx:358](../src/ui/componentes/DetalheDoPedido.tsx#L358) |
| Loading em toda lista | ✅ | `Recurso` em [estados.tsx:122](../src/ui/componentes/estados.tsx#L122) escolhe esqueleto, vazio ou erro pela forma do hook |

## Entrega

| Exigência | | Onde |
|---|:---:|---|
| Instruções para instalar, configurar e iniciar | ✅ | [README.md:113](../README.md#L113) |
| Código-fonte de front e back | ✅ | `app/`, `src/` |
| Dados de demonstração e instruções | ✅ | `npm run seed`; [README.md:174](../README.md#L174) |
| README: screenshots | ✅ | 9 imagens em `docs/screenshots/`, todas existentes |
| README: tecnologias e motivos | ✅ | [README.md:268](../README.md#L268) |
| README: como a alçada é modelada, calculada e persistida | ✅ | [README.md:285](../README.md#L285) |
| README: como o front conversa com o back | ✅ | [README.md:337](../README.md#L337) |
| README: consistência e integridade | ✅ | [README.md:411](../README.md#L411) |
| README: o que mudaria em produção | ✅ | [README.md:532](../README.md#L532) |
| Fork e Pull Request até 01/11/2026 23h59 | ⚠️ | Commitado no branch `resolucao-obraflow` do fork e PR aberto **dentro do fork** ([Carolbalbs/obraflow-case#1](https://github.com/Carolbalbs/obraflow-case/pull/1)). O destino previsto em [pull-request.md](pull-request.md) é `ObraFlow/obraflow-case` |
| E-mail e telefone na descrição do PR | ❌ | Ainda não preenchidos — os marcadores continuam em [pull-request.md](pull-request.md) |

---

## Riscos antes do PR, do mais grave ao menos

1. **❌ Contato no PR.** E-mail e telefone ainda não estão na descrição do PR.
2. **⚠️ Destino do PR.** O PR está aberto dentro do fork; o enunciado pede o PR para o
   repositório original. É decisão da autora.

### Resolvidos em 01/11/2026

- ~~Commit~~ — feito no branch `resolucao-obraflow`, com a composição proposta em PROGRESS.md.
- ~~Erros de tipo na UI~~ — três referências quebradas (`BOTAO`, `DESABILITADO_NEUTRO` e o ref
  `campo` sombreando o helper de estilos) corrigidas; `tsc` limpo.

- ~~Preço zero~~ — aceito, como o enunciado pede; negativo recusado. Preço não informado no
  rascunho passou a ser `null` (migration nova), para não virar R$ 0,00 na submissão.
- ~~Data do pedido~~ — voltou a ser campo obrigatório do formulário, validado nas duas pontas;
  a submissão carimba só `submetidoEm`.
- ~~Listagem por API de obras e fornecedores~~ — `GET /api/obras` e `GET /api/fornecedores`
  (feature `s5f4`), 200 com sessão e 403 sem.
- ~~README atrás da Sprint E3~~ — `/admin`, `/api/pedidos/resumo` e `/api/pedidos/painel` no
  README; o painel ganhou a feature `e3f2` na SPEC.
- ~~Banco fora do seed~~ — `npm run seed` rodado depois do `verificar.sh`: 8 pedidos.
