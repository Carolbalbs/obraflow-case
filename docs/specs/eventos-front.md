# Eventos do front — spec

> Levantado controle a controle dos onze artboards do mockup
> (`claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo`). Inventário visual no quadro
> `Eventos do front` do canvas de diagramas (`claude.ai/artifact/4TRvKgswzUGqqzsH7P4YL9`).
> Camadas de baixo: [`diagrama-classes.md`](diagrama-classes.md), vista 3.

Cobre o INC2 ao INC6. Não é uma spec de incremento: é a camada que atravessa todos eles, e por
isso vive fora das pastas `INC*`.

## Problem Statement

As três telas do enunciado somam cerca de quarenta e cinco controles. Sem um inventário fechado,
cada tela inventa o próprio jeito de falar com a API: uma faz `fetch` no corpo do componente,
outra num efeito, a terceira num utilitário — e os quatro estados que o enunciado exige
explicitamente (carregando, vazio, erro com repetição, validação por campo) acabam escritos três
vezes, cada vez um pouco diferente.

Há um problema anterior, e pior. Seis controles estão desenhados no mockup sem nenhuma rota
atrás, e um sétimo contradiz um ADR. Descobrir isso ao construir a tela, no dia 30, custa o dia
que não existe: a pessoa para no meio do componente para decidir produto.

## Solution

Um inventário fechado de handlers, um por controle, cada um nomeado pelo ato de domínio que
executa e carregando a rota que dispara — ou a marca explícita de que não sai do cliente.

Abaixo deles, uma camada única de hooks de dados que devolve sempre a mesma quádrupla. Os quatro
estados exigidos deixam de ser trabalho de cada tela e passam a ser consequência da forma do
retorno: quem tem `carregando` desenha o esqueleto, quem tem `erro` desenha a caixa com
"tentar novamente", quem tem `dados` vazio desenha o empty state.

E as sete lacunas resolvidas antes de a primeira tela ser escrita, não durante.

## User Stories

1. Como compradora, quero montar um pedido com vários itens e sair da tela sem perder nada, para que interrupção na obra não custe o trabalho já feito.
2. Como compradora, quero ver o total do pedido se atualizar a cada item que eu digito, para que eu saiba em qual faixa de alçada vou cair antes de enviar.
3. Como compradora, quero que o item com erro fique de fora do total, para que o número que eu leio seja o número que vale.
4. Como compradora, quero que o botão de cadastrar só acenda quando tudo estiver válido, e que ele me diga o que falta quando estiver apagado, para que eu não descubra o problema só depois de clicar.
5. Como compradora, quero ver a cadeia prevista enquanto monto o pedido, para que eu saiba quem vai precisar assinar antes de enviar.
6. Como compradora, quero que "sem regra aplicável" me dê o caminho para configurar a alçada, para que o bloqueio seja uma instrução e não um beco.
7. Como aprovadora, quero abrir a fila já filtrada no que é meu, para que eu não precise procurar o que me cabe.
8. Como aprovadora, quero alternar entre as abas de situação sem perder o filtro de obra, para que explorar a lista não desfaça o que eu já tinha escolhido.
9. Como aprovadora, quero aprovar direto da lista, para que o caso comum não exija abrir o detalhe.
10. Como aprovadora, quero que rejeitar me obrigue a escrever o motivo, para que a pessoa do outro lado saiba o que corrigir.
11. Como aprovadora, quero que o diálogo de rejeição devolva o foco ao botão que o abriu quando eu cancelar, para que navegar por teclado não me perca na página.
12. Como aprovadora, quero que todo botão desabilitado explique por que, para que eu saiba se o problema é a minha vez, o meu papel ou a cadeia já encerrada.
13. Como aprovadora, quero que uma decisão recusada pelo servidor me diga o que mudou, para que eu entenda que outra pessoa decidiu antes de mim e não que o sistema falhou.
14. Como administradora, quero escolher a obra e ver as faixas dela em ordem, para que eu edite a regra certa.
15. Como administradora, quero montar a faixa inteira — limite e aprovadores na ordem — e salvar de uma vez, para que a tela nunca grave um estado intermediário inválido.
16. Como administradora, quero reordenar aprovadores sem que cada clique vire uma requisição, para que experimentar a ordem seja barato.
17. Como administradora, quero não digitar o valor mínimo da faixa, para que buraco e sobreposição entre faixas sejam impossíveis e não apenas proibidos.
18. Como administradora, quero cancelar a edição e ver a faixa voltar ao que era, para que experimentar não tenha custo.
19. Como qualquer usuário, quero que o menu mostre só o que meu papel alcança, para que eu não bata em portas fechadas.
20. Como qualquer usuário, quero que digitar a URL de uma tela que não me cabe me explique a recusa e diga a quem recorrer, para que eu não veja uma tela branca.
21. Como avaliador, quero trocar de pessoa sem refazer login, para que percorrer a cadeia inteira leve segundos.
22. Como avaliador, quero desfazer a troca, para que eu volte a quem eu era sem procurar na lista.
23. Como desenvolvedora, quero um lugar só que traduza código de erro em mensagem, para que a mesma recusa não apareça com dois textos diferentes em duas telas.
24. Como desenvolvedora, quero que o erro de validação do servidor acenda no campo certo, para que a tela aproveite o `fields` do envelope em vez de inventar o próprio mapeamento.
25. Como desenvolvedora, quero que nenhuma lista pisque conteúdo vazio antes de carregar, para que o estado de carregamento não seja confundido com ausência de dados.

## Implementation Decisions

### Nome do handler

O handler é o ato de domínio, em português, sem prefixo `handle` ou `on`: `aprovar`, `submeter`,
`moverAprovador`. É o ADR 0007 levado até o fim — `handleSubmeter` seria metade inglês e metade
português no mesmo identificador, e `onApprove` romperia o glossário na borda em que ele mais
importa, a que o usuário enxerga.

O inglês fica onde o ADR manda: props genéricas de React (`onChange`, `onClick`), nomes de hooks
(`usePedidos`) e o envelope HTTP.

### A quádrupla dos hooks

Todo hook de dados devolve `{ dados, carregando, erro, recarregar }`. Não é conveniência: é o que
torna os quatro estados do INC6 estruturais. Uma lista que recebe essa quádrupla não tem como
esquecer o estado de carregamento, porque ele chega junto com os dados.

`recarregar` existe para o botão "tentar novamente" do mockup de `Estados` — sem ele, a tela de
erro teria que recarregar a página inteira.

### Handlers por tela

**Entrada e sessão — INC2, artboards `Login` e `TrocarConta`**

| Handler | Dispara |
|---|---|
| `entrarComo(usuarioId)` | `POST /api/sessao` |
| `sair()` | `DELETE /api/sessao` |
| `trocarUsuario(usuarioId)` | `POST /api/sessao` — sessão nova, não renomeada (ADR 0005) |
| `abrirTroca()` · `fecharTroca()` | diálogo, só no cliente |
| `filtrarPessoas(texto)` | só no cliente |
| `desfazerTroca()` | `POST /api/sessao` com o usuário anterior |
| `itensDoMenu(papel)` | derivado — o item some, não desabilita |

**Tela 3 · Alçadas — INC3, artboard `Alcadas`**

| Handler | Dispara |
|---|---|
| `selecionarObra(obraId)` | `GET /api/obras/:id/faixas` |
| `novaFaixa()` · `editarFaixa(faixaId)` | abre o formulário, só no cliente |
| `alterarLimite(texto)` | `Dinheiro.deEntrada`, só no cliente |
| `adicionarAprovador(usuarioId)` | só no cliente |
| `removerAprovador(usuarioId)` | só no cliente |
| `moverAprovador(usuarioId, direcao)` | só no cliente |
| `salvarFaixa()` | `POST` ou `PUT /api/faixas/:id` — substitui a faixa inteira |
| `cancelarEdicao()` | descarta o estado local |
| `removerFaixa(faixaId)` | `DELETE /api/faixas/:id` |

Os quatro handlers de aprovador não tocam a rede. O `PUT` substitui limite e lista ordenada de uma
vez, então reordenar é estado local até `salvarFaixa()` — e é isso que impede a tela de gravar uma
faixa com dois aprovadores na mesma posição enquanto a pessoa arrasta.

**Tela 1 · Cadastro — INC4, artboard `Main`**

| Handler | Dispara |
|---|---|
| `alterarDadoGeral(campo, valor)` | só no cliente |
| `adicionarItem()` · `removerItem(ordem)` | só no cliente |
| `alterarItem(ordem, campo, valor)` | recalcula o total do item, só no cliente |
| `salvarRascunho()` | `POST` ou `PUT /api/pedidos` |
| `cadastrarPedido()` | `POST /api/pedidos/:id/submissao` |
| `cancelar()` | volta sem gravar |
| `totalDoPedido()` | derivado — soma só os itens válidos |
| `simularCadeia(obraId, total)` | `POST /api/alcada/simulacao` — EXTRA1 |

`totalDoPedido()` ignorar o item inválido não é detalhe de interface: o mockup mostra o item com
erro fora do total e o rodapé dizendo isso. Somar um item que o servidor vai recusar daria à
pessoa uma faixa de alçada que não é a dela.

**Tela 2 · Aprovação — INC5, artboards `Aprovacoes`, `AprovacoesC`, `PedidoDetalhe`**

| Handler | Dispara |
|---|---|
| `trocarAba(aba)` | para mim · pendentes · aprovados · rejeitados · todos |
| `filtrarPorSituacao(situacao)` | `GET /api/pedidos` |
| `filtrarPorObra(obraId)` | `GET /api/pedidos` |
| `abrirDetalhe(pedidoId)` | `GET /api/pedidos/:id` |
| `aprovar(pedidoId)` | `POST /api/pedidos/:id/decisoes` |
| `abrirDialogoRejeicao(pedidoId)` | diálogo, só no cliente |
| `alterarMotivo(texto)` | valida mínimo de 10 caracteres, só no cliente |
| `confirmarRejeicao()` | `POST /api/pedidos/:id/decisoes` |
| `cancelarRejeicao()` | fecha e devolve o foco ao gatilho |
| `motivoIndisponivel(pedido, sessao)` | derivado — a explicação do botão apagado |

**Nenhuma decisão é otimista.** `aprovar` e `confirmarRejeicao` esperam a resposta antes de mudar
a tela. O ADR 0004 existe porque duas pessoas podem decidir ao mesmo tempo; pintar a aprovação
antes do 200 é apostar contra exatamente o caso que o ADR protege. Um 409 depois de um otimismo
obrigaria a tela a desfazer na frente do usuário — pior do que esperar.

`motivoIndisponivel` é handler de verdade, não enfeite: o mockup tem quatro textos distintos para
botão desabilitado — *aguarda João Prado*, *cadeia concluída*, *fluxo interrompido*, *você já
aprovou*. Escolher entre eles é regra, e regra tem lugar: a função recebe pedido e sessão e
devolve a frase.

**Estados e erro — INC6, artboard `Estados`**

| Handler | Papel |
|---|---|
| `recarregar()` | botão "tentar novamente" |
| `verDetalhesTecnicos()` | expande o erro bruto |
| `tratarErro(erro)` | `error.code` → mensagem, um lugar só |
| `erroPorCampo(erro)` | `error.fields` → o input certo |
| `estadoDaLista(dados, carregando, erro)` | decide esqueleto · vazio · erro · lista |

`tratarErro` decide por `error.code`, nunca por `error.message`. O envelope do INC2 existe para
isso, e a mensagem do servidor é texto para humano, não contrato.

### Hooks de dados

`useSessao()` · `useObras()` · `useFornecedores()` · `useFaixas(obraId)` · `usePedidos(filtros)` ·
`usePedido(id)`.

Nenhum deles conhece componente, e nenhum componente faz `fetch` fora deles.

### O valor mínimo da faixa — decidido

O campo *Valor mínimo* de `Alcadas` é **derivado e somente leitura**: mostra o limite da faixa
anterior mais um centavo. O ADR 0002 permanece intacto — sem coluna de mínimo, buraco e
sobreposição continuam impossíveis por construção, e não viram validação a cada escrita.

A consequência no inventário é que existe um `alterarLimite(texto)`, não dois. O mockup ainda
desenha os dois campos editáveis; ao construir a tela 3, vale o que está aqui.

## Testing Decisions

Um bom teste observa comportamento externo. Aqui isso tem uma implicação incômoda e vale dizê-la
em voz alta: **a maior parte destes handlers não merece teste.** `aprovar(pedidoId)` faz um
`fetch` e troca um estado; testá-lo exigiria montar DOM e simular rede para verificar que uma
função chamou outra — exatamente o teste que congela implementação sem proteger comportamento.

**O front não acrescenta um terceiro seam.** Os dois do projeto continuam sendo o domínio (INC1) e
o Route Handler (INC5). A decisão é de custo e de retorno: um seam de componente exigiria
Testing Library, jsdom e um dia de arcabouço para cobrir a camada mais fina e mais volátil do
sistema, no incremento em que não há dia sobrando.

**O que é testado são as funções derivadas, e elas são puras de propósito.** Cinco handlers da
lista acima não tocam rede nem estado de React, e por isso são escritos como funções puras,
fora do componente, no projeto de domínio do Vitest que já existe:

- `totalDoPedido(itens)` — soma só os válidos; o caso do item com erro fora do total.
- `motivoIndisponivel(pedido, sessao)` — os quatro textos, um caso cada.
- `estadoDaLista(dados, carregando, erro)` — as quatro saídas, incluindo lista vazia sem erro.
- `erroPorCampo(erro)` — `fields` presente, ausente e com campo que a tela não tem.
- `itensDoMenu(papel)` — os quatro papéis contra a matriz do artboard `Perfis`.

Dezoito a vinte casos, nenhum deles precisando de navegador. É o mesmo arranjo da suíte do INC1:
caso explícito no corpo do teste, sem fixture compartilhada, sem mock.

**Prior art:** a suíte do domínio do INC1, 23 casos passando. Esta segue a forma dela.

**O que fica verificado à mão, e declarado como tal:** foco preso no diálogo de rejeição, foco
devolvido ao gatilho no cancelamento, ausência de rolagem horizontal em 390px e a tabela de itens
virando cartões abaixo de 768px. São comportamentos de navegador cuja verificação automatizada
custa mais do que vale aqui — o `scripts/verificar.sh` do INC7 cobre o que é verificável por
`curl`, e estes quatro entram na lista de conferência do README.

## Out of Scope

Teste de renderização de componente, Testing Library e jsdom. Teste fim a fim. Gerenciamento de
estado global — os hooks bastam, e um store seria peça a mais. Cache entre telas e revalidação em
segundo plano. Otimismo em qualquer escrita. Internacionalização. Tema escuro.

Os controles cortados, listados abaixo.

## Further Notes

### As lacunas, e o que fazer com cada uma

Sete controles desenhados no mockup não tinham rota atrás. O acompanhamento vive em
[`../checklist.md`](../checklist.md), seção Mockups; aqui fica o efeito de cada um sobre o
inventário.

| Controle | Artboard | Situação |
|---|---|---|
| Valor mínimo da faixa | `Alcadas` | **decidido** — derivado e somente leitura; um `alterarLimite` só |
| Buscar pedido, obra ou fornecedor | `Aprovacoes`, `AprovacoesB`, `TrocarConta` | em aberto — `GET /api/pedidos` só filtra por situação e obra |
| Enviar sugestão a Carla | `PedidoDetalhe` | candidato a corte — sem rota e sem modelo |
| Pular por agora | `AprovacoesC` | candidato a corte — nada no schema guarda "pulei este" |
| Cadastrar obra | `Estados` | em aberto — só `GET /api/obras` está previsto |
| Desfazer a troca de usuário | `TrocarConta` | exige guardar a sessão anterior |
| Senha e SSO | `Login` | fora de escopo por decisão (ADR 0005) |

Os dois candidatos a corte não têm handler no inventário acima. Se forem mantidos, entram — e
cada um traz rota, modelo e caso de uso junto.

### Por que o handler não chama a rota, conceitualmente

A rota não contém regra: ela lê sessão, valida entrada, chama um caso de uso e traduz o resultado
(`diagrama-classes.md`, vista 3). O handler do front é o espelho disso do outro lado do fio —
junta o que o usuário fez, chama a rota e traduz a resposta em estado de tela. Nenhum dos dois
decide nada.

É por isso que `aprovar(pedidoId)` não recebe a cadeia nem a etapa: quem sabe de quem é a vez é
`PoliticaDeDecisao`, atrás de `RegistrarDecisao`, e o front só descobre pelo 200 ou pelo 409.
