# Backlog — ObraFlow · Dokimos

Gerado para importação no Jira (`docs/jira/tasks.csv`). Épicos = incrementos; o label marca o dia.

## INC0 · Esqueleto  
`dia-29` · 5 tasks  · **concluído**

- **Gerar projeto Next 16 com TypeScript, Tailwind v4 e App Router** _(Highest)_
  App na raiz do fork, sem src-dir, convivendo com site/ intocado.
  Pronto quando: npm run dev sobe sem erro de console.

- **Tema Tailwind com os tokens do ObraFlow** _(Highest)_
  Rampa de marca, rampa neutra, superficies e fontes Inter/Lora iguais a site/assets/css/obraflow.css.
  Pronto quando: a pagina renderiza com a cor de marca e o eyebrow em Lora italico.

- **Schema Prisma completo e primeira migration** _(Highest)_
  Oito modelos. Dinheiro em centavos, quantidade em milesimos, snapshot da faixa no pedido (faixaLimiteCentavos, faixaSemTeto).
  Pronto quando: prisma migrate dev aplica sem erro.

- **Cliente Prisma com driver adapter e singleton** _(Highest)_
  Prisma 7 exige prisma.config.ts e adapter. Singleton para o HMR do Next nao abrir conexao por recarga.
  Pronto quando: uma pagina server-side le do banco.

- **Seed minimo e scripts npm** _(High)_
  Tres obras. Scripts seed e db:reset.
  Pronto quando: npm run seed imprime a contagem.

## INC1 · Dominio e testes  
`dia-29` · 8 tasks

- **dinheiro.ts: centavos e milesimos** _(Highest)_
  Conversao entre entrada do formulario e inteiro, formatacao pt-BR, e totalItem = round(quantidadeMilesimos * precoUnitarioCentavos / 1000). Nenhum float no caminho.
  Pronto quando: testado nos limites de arredondamento.

- **alcada.ts: resolverFaixa** _(Highest)_
  Recebe total em centavos e as faixas da obra. Limite superior inclusivo. Faixa sem teto cobre o resto. Devolve a faixa ou o estado sem regra aplicavel.
  Pronto quando: cobre valor exato no limite, teto estourado e obra sem faixa.

- **alcada.ts: montarCadeia** _(Highest)_
  A partir da faixa, devolve as etapas na ordem dos aprovadores.
  Pronto quando: ordem preservada e cadeia vazia recusada.

- **decisao.ts: aprovador da vez e validacao** _(Highest)_
  Quem pode decidir, o que aprovacao avanca, o que rejeicao encerra, motivo obrigatorio na rejeicao.
  Pronto quando: decisao fora de ordem e segunda decisao na mesma etapa sao recusadas.

- **schemas.ts: um Zod por operacao** _(High)_
  Rascunho permissivo e pedido submetido estrito sao schemas diferentes. Mesmo arquivo serve rota e formulario.
  Pronto quando: o schema estrito recusa pedido sem itens.

- **erros.ts: codigos fechados** _(High)_
  VALIDACAO, SEM_REGRA_APLICAVEL, NAO_E_SUA_VEZ, CADEIA_CONCLUIDA, NAO_ENCONTRADO, SEM_PERMISSAO.
  Pronto quando: o tipo e exaustivo e a interface decide por codigo, nunca por mensagem.

- **Configurar Vitest em dois projetos** _(High)_
  Projeto dominio paralelo e sem setup; projeto api em serie com banco de teste (usado so no E2).
  Pronto quando: npm test roda o dominio em segundos.

- **Suite do dominio: 12 a 18 casos** _(Highest)_
  Os casos listados nas tasks acima, sem banco e sem servidor.
  Pronto quando: npm test verde.

## INC2 · Sessao e papeis  
`dia-29` · 7 tasks

- **lerSessao recebendo Request** _(Highest)_
  CRITICO: nao usar cookies() de next/headers. O handler recebe o Request e repassa, senao a etapa 2 de testes fica inviavel.
  Pronto quando: a funcao e chamavel fora do contexto do Next.

- **Criacao e destruicao de sessao em cookie httpOnly** _(Highest)_
  POST para entrar, DELETE para sair. Identidade decidida no servidor.
  Pronto quando: o cookie nao e legivel por JavaScript.

- **Gate DEMO_MODE na rota de entrada** _(High)_
  Com a flag desligada a rota nao responde.
  Pronto quando: DEMO_MODE=false devolve 404 na entrada.

- **permissao.ts: matriz de quatro papeis** _(Highest)_
  admin, aprovador, comprador, visualizador. Uma funcao so, consultada por toda rota.
  Pronto quando: a matriz do artboard Perfis e verdade no codigo.

- **http.ts: envelope de erro e helper de rota** _(High)_
  { error: { code, message, fields? } } e um wrapper que converte ErroDominio em resposta.
  Pronto quando: toda rota responde no mesmo formato.

- **Tela de entrada** _(High)_
  Lista os usuarios do seed, sem senha. Mostra o papel de cada um.
  Pronto quando: da para entrar como cada usuario.

- **Cabecalho com usuario, papel e trocar de usuario** _(High)_
  Nome da construtora fixo. Sem seletor de empresa (ADR 0006).
  Pronto quando: o menu muda conforme o papel.

## INC3 · Tela 3 — Regras da alcada  
`dia-29` · 5 tasks

- **GET e POST /api/obras/:id/faixas** _(Highest)_
  Lista as faixas ordenadas e cria faixa nova.
  Pronto quando: faixa sem teto so pode existir uma por obra.

- **PUT e DELETE /api/faixas/:id** _(Highest)_
  PUT substitui limite e lista ordenada de aprovadores de uma vez, eliminando rota de reordenacao.
  Pronto quando: reordenar e salvar nao gera estado intermediario invalido.

- **Tela: selecao de obra e listagem de faixas** _(High)_
  Tabela com faixa, aprovadores na ordem e acoes.
  Pronto quando: a tabela do enunciado aparece preenchida.

- **Tela: criar e editar faixa** _(High)_
  Limite de valor e aprovadores adicionaveis, removiveis e reordenaveis.
  Pronto quando: a ordem salva e a ordem exibida.

- **403 para quem nao e admin** _(Highest)_
  Recusa na API, nao item escondido no menu. Tela explica e diz a quem recorrer.
  Pronto quando: Amanda digitando a URL ve a explicacao, nao uma tela branca.

## INC4 · Tela 1 — Cadastro de pedido  
`dia-30` · 6 tasks

- **POST, PUT e DELETE /api/pedidos** _(Highest)_
  Cria rascunho, edita rascunho, apaga rascunho. Pedido submetido e imutavel.
  Pronto quando: PUT em pedido submetido devolve erro.

- **POST /api/pedidos/:id/submissao** _(Highest)_
  Valida por inteiro, resolve a faixa, grava a cadeia, tudo numa transacao.
  Pronto quando: falha na validacao nao deixa etapa orfa.

- **Formulario de dados gerais** _(High)_
  Obra, fornecedor, data e observacoes internas.
  Pronto quando: rascunho salva com campos vazios.

- **Editor de itens N** _(Highest)_
  Comeca com um item em branco. Adicionar, editar, remover. Total do item calculado e nao editavel.
  Pronto quando: tres itens somam o total do pedido corretamente.

- **Totalizacao e habilitacao do envio** _(High)_
  Total visivel. Botao de cadastrar so quando dados gerais e todos os itens forem validos.
  Pronto quando: item invalido mantem o botao desabilitado com o motivo visivel.

- **Tratamento de SEM_REGRA_APLICAVEL** _(High)_
  Bloqueia a submissao sem perder o rascunho, e diz o que fazer.
  Pronto quando: da para salvar, criar a faixa na tela 3 e voltar para enviar.

## INC5 · Tela 2 — Aprovacao  
`dia-30` · 8 tasks

- **GET /api/pedidos com filtros** _(Highest)_
  Filtra por situacao e obra. Devolve acoes possiveis para a sessao atual.
  Pronto quando: curl com sessoes diferentes devolve acoes diferentes.

- **GET /api/pedidos/:id** _(Highest)_
  Cabecalho, itens, cadeia gravada e historico de decisoes.
  Pronto quando: a cadeia vem do snapshot, nunca recalculada.

- **POST /api/pedidos/:id/decisoes com UPDATE condicional** _(Highest)_
  Uma escrita condicionada ao estado que a autoriza. Zero linhas afetadas vira 409.
  Pronto quando: duas decisoes simultaneas produzem exatamente um 200 e um 409.

- **Lista de pedidos** _(High)_
  Identificador, obra, fornecedor, data, itens, total, situacao, alcada atual e acoes.
  Pronto quando: a lista de pendentes reflete o nivel atual, vindo do back-end.

- **Detalhe do pedido** _(High)_
  Itens com descricao, quantidade, unidade, preco e total, mais o historico de decisoes.
  Pronto quando: rejeicao aparece no historico com o motivo.

- **Componente de cadeia de aprovacao** _(High)_
  Etapas concluidas, etapa atual destacada e proximas. Empilha no vertical em tela estreita.
  Pronto quando: e legivel em 390px.

- **Dialogo de rejeicao com motivo obrigatorio** _(Highest)_
  Validado antes do submit. Foco preso, Esc fecha, foco volta ao gatilho.
  Pronto quando: rejeitar sem motivo nao envia.

- **Estados de decisao indisponivel** _(High)_
  Cadeia concluida, nao e a sua vez, papel sem permissao: cada um com explicacao propria.
  Pronto quando: nenhum botao fica desabilitado sem dizer por que.

## INC6 · Estados, validacoes e responsividade  
`dia-31` · 5 tasks

- **Loading em toda lista** _(Highest)_
  Obrigatorio pelo enunciado.
  Pronto quando: nenhuma lista pisca conteudo vazio antes de carregar.

- **Empty states** _(High)_
  Nenhuma obra cadastrada, nenhum pedido, obra sem faixa. Amigavel, nunca tela branca.
  Pronto quando: banco vazio produz orientacao, nao vazio.

- **Erro com opcao de tentar de novo** _(Highest)_
  API fora do ar e 500.
  Pronto quando: derrubar o servidor com a tela aberta mostra erro com botao de repetir.

- **Validacao por campo** _(High)_
  Mesmo schema Zod do servidor, erro ancorado no input certo via error.fields.
  Pronto quando: quantidade negativa acende o erro no item correspondente.

- **Responsividade de 390px para cima** _(High)_
  Tabela de itens vira cartoes abaixo de 768px.
  Pronto quando: nao ha rolagem horizontal em 390px.

## INC7 · Seed, prova e documentacao  
`dia-31` · 5 tasks

- **Seed completo com oito pedidos** _(Highest)_
  Rascunho completo e incompleto, pendente na 1a etapa, pendente na 2a com a 1a aprovada, aprovado, rejeitado com motivo, e um com a faixa editada depois da submissao.
  Pronto quando: trocar de usuario mostra filas diferentes sem editar dado.

- **scripts/verificar.sh** _(Highest)_
  curl comentado demonstrando 409 em decisao fora de ordem, 409 em decisao duplicada e 403 em rota de alcada.
  Pronto quando: o avaliador roda e ve os codigos.

- **Screenshots das tres telas** _(High)_
  Exigidos pelo enunciado. Demoram mais do que parece.
  Pronto quando: estao no README e legiveis.

- **README completo** _(Highest)_
  Instalacao, execucao, seed, tecnologias e motivos, modelagem da alcada, comunicacao front-back, consistencia, o que mudaria em producao, e a tabela de o que cada usuario ve.
  Pronto quando: alguem que nunca viu o projeto clona e chega na tela de aprovacao sem perguntar.

- **Abrir o Pull Request** _(Highest)_
  Com e-mail e telefone na descricao, conforme o enunciado. Abrir dia 31, nao dia 1.
  Pronto quando: o PR esta aberto contra ObraFlow/obraflow-case.

## EXTRA1 · Simulador de alcada ao vivo  
`extra` · 2 tasks

- **Rota de simulacao da cadeia** _(Medium)_
  Recebe obra e total, devolve a cadeia prevista sem criar nada. Reaproveita resolverFaixa.
  Pronto quando: responde tambem o estado sem regra aplicavel.

- **Componente de cadeia prevista no cadastro** _(Medium)_
  Atualiza conforme o total muda. Desenhado em AprovacoesB.
  Pronto quando: mudar um preco muda a cadeia na tela.

## EXTRA2 · Suite de integracao da API  
`extra` · 2 tasks

- **Banco de teste e limpeza entre casos** _(Low)_
  env de teste, reset de schema, fabricas em tests/fabricas.ts.
  Pronto quando: os casos rodam isolados em serie.

- **Sete casos de API no nivel do handler** _(Low)_
  Fora de ordem, duplicada, corrida com Promise.all, permissao, escopo de leitura, sem regra aplicavel e snapshot.
  Pronto quando: npm test cobre os dois projetos.

## EXTRA3 · Grafico na tela de administracao  
`extra` · 1 tasks

- **Grafico de pedidos por situacao** _(Lowest)_
  Menor prioridade do backlog: nao melhora nenhum criterio diretamente.
  Pronto quando: existe e nao atrapalha.
