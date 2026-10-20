# PRD — Dokimos, o serviço de aprovações do ObraFlow

Construído a partir de [`PRD-TEMPLATE.md`](PRD-TEMPLATE.md).
Vocabulário em [`GLOSSARY.md`](../GLOSSARY.md). Decisões em [`docs/adr/`](adr/).

---

## 1. Problema — o que está errado

**Contexto.** Uma construtora toca várias obras ao mesmo tempo. Cada obra consome material e
serviço continuamente, e cada compra é pedida por quem está no canteiro — engenheiro,
comprador, mestre de obras. Hoje essa autorização acontece fora de qualquer sistema: WhatsApp,
e-mail, conversa de corredor, planilha compartilhada.

**Dor.** Três coisas quebram ao mesmo tempo:

- **Não existe trilha.** Quando um gasto é questionado semanas depois, ninguém consegue provar
  quem autorizou o quê. A mensagem foi apagada, o e-mail está na caixa de outra pessoa, a
  planilha foi sobrescrita.
- **A alçada não é imposta, é lembrada.** A regra "acima de R$ 10.000 precisa da diretoria"
  existe na cabeça das pessoas. Quem esquece, aprova além da própria responsabilidade — e o
  erro só aparece no fechamento do mês.
- **A ordem não é respeitada.** Quando duas pessoas precisam aprovar, nada impede que a segunda
  decida antes da primeira, ou que as duas decidam ao mesmo tempo sobre o mesmo pedido.

**Custo de não fazer.** Gasto indevido que ninguém consegue atribuir; aprovação fora de alçada
descoberta tarde demais para ser revertida; e, no caso de auditoria, a construtora não tem o que
apresentar. Toda obra nova agrava o problema, porque a regra informal não escala para quem
acabou de entrar na equipe.

---

## 2. Goals — metas mensuráveis e verificáveis

| # | Goal | Como se verifica |
|---|---|---|
| **G1** | Um pedido de compra tem cabeçalho e **N itens**, e seu total é a soma dos itens — calculado pelo servidor, nunca enviado pelo cliente | Criar pedido de 3 itens; o total exibido é a soma; nenhum campo de total é editável; `curl` enviando um total divergente é ignorado |
| **G2** | A alçada aplicável é determinada pelo **total do pedido** na obra, não pelo valor de qualquer item isolado | Pedido com 5 itens de R$ 3.000 (total R$ 15.000) cai na faixa acima de R$ 10.000, não na faixa até R$ 10.000 |
| **G3** | O limite superior de uma faixa é **inclusivo** | Pedido de exatamente R$ 10.000,00 resolve para a faixa "até R$ 10.000,00" |
| **G4** | A cadeia de aprovação é gravada **na submissão** e nunca recalculada | Submeter um pedido, editar a faixa da obra, reabrir o pedido: a cadeia exibida é a original ([ADR 0001](adr/0001-cadeia-de-aprovacao-e-snapshot.md)) |
| **G5** | Só o **aprovador da vez** decide; decisão fora de ordem é recusada pelo servidor | Como 2º aprovador, antes da decisão do 1º, `POST` de aprovação responde 409 — não apenas botão desabilitado ([ADR 0004](adr/0004-decisao-por-update-condicional.md)) |
| **G6** | Rejeição exige motivo, encerra o pedido inteiro e fica no histórico | Rejeitar sem motivo é barrado antes do submit; rejeitado, o pedido não aceita mais nenhuma decisão e o motivo aparece no histórico |
| **G7** | Duas decisões simultâneas sobre a mesma etapa produzem **uma** decisão registrada | Dois `POST` concorrentes na mesma etapa: um 200, outro 409; o banco tem uma linha decidida |
| **G8** | "Sem regra aplicável" é um estado tratado, não um erro genérico | Pedido cujo total excede a faixa mais alta da obra tem submissão bloqueada com mensagem específica, e o rascunho continua existindo |
| **G9** | Um admin configura as faixas de uma obra pela interface: criar, editar, remover, reordenar aprovadores | Criar faixa, trocar a ordem de dois aprovadores, salvar, recarregar: a ordem persiste |
| **G10** | Papel é imposto no servidor | Usuário `aprovador` acessando a URL de regras recebe 403 da API, não só um item escondido no menu |
| **G11** | Toda lista tem estado de carregamento, vazio e erro | Com a API derrubada, a lista mostra erro com opção de tentar de novo; sem obras cadastradas, mostra empty state, não tela branca |
| **G12** | Dinheiro não passa por ponto flutuante em nenhum ponto do cálculo | Valores em centavos (`Int`) e quantidades em milésimos no schema e no domínio; suíte do domínio cobre arredondamento |

---

## 3. Fora de escopo — o que **não** será feito

| Item | Por que fica de fora |
|---|---|
| Autenticação com senha ou SSO | Não é pedido pelo enunciado e não pontua. A entrada é sem senha, atrás da flag `DEMO_MODE` — ausência deliberada, não descuido ([ADR 0005](adr/0005-sessao-de-demonstracao-sem-senha.md)) |
| Entidade `Empresa` / multi-tenant | `Obra` é o escopo máximo. Um seletor de empresa que não troca nada custa mais caro que a funcionalidade ausente ([ADR 0006](adr/0006-sem-empresa-no-modelo.md)) |
| Telas de CRUD de obra, fornecedor e usuário | O enunciado dispensa; esses dados chegam pelo seed. A tela de pedido só precisa **selecionar** |
| Notificação por e-mail ou push ao aprovador da vez | Depende de serviço externo com credencial, e o enunciado exige execução local sem serviço pago |
| Anexos (nota fiscal, cotação, foto) | Exige storage de arquivo e não participa da regra de alçada, que é o núcleo avaliado |
| Edição de pedido após a submissão | Cabeçalho e itens são imutáveis depois da submissão — editar o total mudaria a alçada sob uma cadeia já gravada |
| Aprovação em paralelo ou por quórum | A alçada do enunciado é estritamente sequencial. Paralelismo é outro modelo de dados, não uma variação |
| Delegação, férias, substituto automático | Produto real, fora do recorte. O aprovador da vez é sempre a pessoa gravada na etapa |
| Server Actions para mutação | Toda escrita passa por Route Handler, para que o contrato seja inspecionável por `curl` ([ADR 0003](adr/0003-route-handlers-sem-server-actions.md)) |
| Deploy, Docker, CI de produção | O enunciado pede execução local; `docker compose` é aceito, não exigido |

---

## 4. User stories — cenários do usuário final

### US-1 — Comprador monta um pedido com vários itens

**Como** comprador, **quero** montar um pedido com N itens e ver o total somado,
**para** saber de antemão qual alçada ele vai acionar.

**Aceite:**
- Dado um rascunho vazio, quando adiciono 3 itens com quantidade e preço válidos, então o total
  de cada item é `quantidade × preço unitário`, não editável, e o total do pedido é a soma.
- Dado um item com quantidade negativa ou não numérica, quando tento submeter, então o erro
  aparece **no item correspondente** e nada é enviado.
- Dado um pedido sem nenhum item, quando tento submeter, então a submissão é recusada com
  mensagem clara.
- Dado um rascunho incompleto, quando saio da tela e volto, então ele continua lá com o que eu
  já havia preenchido.

### US-2 — Submissão resolve a faixa e grava a cadeia

**Como** comprador, **quero** que a cadeia de aprovadores seja definida na submissão,
**para** que o pedido siga o caminho certo sem eu precisar escolher ninguém.

**Aceite:**
- Dado um pedido de R$ 8.000 numa obra cuja faixa até R$ 10.000 tem [Amanda], quando submeto,
  então a cadeia gravada tem uma etapa, de Amanda.
- Dado um pedido de R$ 12.500 na mesma obra, cuja faixa acima tem [Amanda → João], quando
  submeto, então a cadeia tem duas etapas nessa ordem e só a primeira está disponível.
- Dado um pedido de exatamente R$ 10.000,00, quando submeto, então ele cai na faixa "até
  R$ 10.000,00" — o limite é inclusivo.
- Dado um total que não cai em nenhuma faixa da obra, quando tento submeter, então a submissão é
  bloqueada com a mensagem de **sem regra aplicável**, e o rascunho permanece.

### US-3 — Aprovador decide na sua vez

**Como** aprovador, **quero** ver só o que depende de mim e decidir,
**para** não perder tempo com pedidos que ainda não chegaram na minha etapa.

**Aceite:**
- Dado que sou a etapa 1 de uma cadeia pendente, quando abro a lista, então o pedido aparece com
  ação de decidir disponível.
- Dado que sou a etapa 2 e a etapa 1 ainda não decidiu, quando tento aprovar — pela tela ou por
  `curl` — então o servidor recusa com 409 e explica o motivo.
- Dado que aprovo a última etapa, quando a decisão é gravada, então o pedido fica **aprovado** e
  nenhuma ação de decisão continua disponível.
- Dado um pedido com a cadeia já concluída, quando abro o detalhe, então os botões estão
  desabilitados **com explicação**, não em silêncio.

### US-4 — Rejeição encerra o fluxo e deixa rastro

**Como** aprovador, **quero** rejeitar com motivo obrigatório,
**para** que quem pediu entenda por quê e o gasto não siga adiante.

**Aceite:**
- Dado o diálogo de rejeição, quando confirmo sem preencher o motivo, então a validação barra
  antes do envio.
- Dado que rejeito a etapa 1 de uma cadeia de duas, quando a decisão é gravada, então o pedido
  fica **rejeitado**, a etapa 2 nunca se torna disponível, e o motivo aparece no histórico.

### US-5 — Admin configura a alçada da obra

**Como** admin, **quero** definir as faixas de valor e seus aprovadores por obra,
**para** que obras de portes diferentes tenham controles diferentes.

**Aceite:**
- Dada uma obra selecionada, quando crio uma faixa com limite R$ 10.000 e aprovadores
  [Amanda], então ela aparece na lista daquela obra.
- Dada uma faixa com dois aprovadores, quando inverto a ordem e salvo, então a nova ordem
  persiste após recarregar.
- Dado que removo uma faixa usada por um pedido já submetido, quando abro esse pedido, então a
  cadeia dele continua a original ([ADR 0001](adr/0001-cadeia-de-aprovacao-e-snapshot.md)).
- Dado que estou logado como `aprovador`, quando acesso a URL de regras, então recebo 403 da API
  com a explicação de acesso negado.

### US-6 — Avaliador troca de usuário para percorrer a cadeia

**Como** avaliador do case, **quero** trocar de usuário sem senha,
**para** conferir a cadeia inteira em poucos cliques.

**Aceite:**
- Dado o modo demo ligado, quando escolho outro usuário, então o servidor abre uma **sessão
  nova** e o que eu posso fazer muda de verdade — não só o nome na tela.
- Dado `DEMO_MODE` desligado, quando chamo a rota de troca, então ela não responde.

### US-7 — A interface sobrevive a falha e a vazio

**Como** qualquer usuário, **quero** entender o que está acontecendo quando algo falha,
**para** não ficar diante de uma tela branca.

**Aceite:**
- Dada a API fora do ar, quando abro uma lista, então vejo estado de erro com opção de tentar de
  novo.
- Dado um banco sem obras, quando abro a tela de pedido, então vejo um empty state que explica o
  que falta.
- Dada qualquer lista, enquanto os dados carregam, então há estado de carregamento visível.

---

## 5. Contexto técnico — stack, padrões, decisões

**Stack**

| Camada | Escolha | Motivo |
|---|---|---|
| Front + back | Next.js 16 (App Router), React 19, TypeScript | Um único projeto executável com `npm run dev`, sem orquestração |
| Estilo | Tailwind v4, tokens em `site/assets/css/obraflow.css` | Tema de marca consistente sem CSS solto |
| Persistência | SQLite + Prisma 7.10.1 (pinado) | Roda local sem serviço externo; `latest` do Prisma é release candidate |
| Testes | Vitest sobre `src/domain/` | Domínio puro, testável sem subir servidor |

**Padrões**

- **Domínio em português** e isolado: `src/domain/` não importa `next/*` em hipótese alguma
  ([ADR 0007](adr/0007-dominio-em-portugues.md)).
- **Dinheiro em centavos** (`Int`), **quantidade em milésimos** (`Int`). Nenhum ponto flutuante
  participa de cálculo monetário.
- **Toda escrita por Route Handler** em `app/api/*`, com envelope de erro
  `{ error: { code, message, fields? } }` ([ADR 0003](adr/0003-route-handlers-sem-server-actions.md)).
- **Identidade vem da sessão** em cookie httpOnly, lida com `lerSessao(req: Request)` — nunca de
  cabeçalho declarado pelo cliente.
- **Faixa guarda só o limite superior**, inclusivo; buracos e sobreposições são impossíveis por
  construção ([ADR 0002](adr/0002-faixa-por-limite-superior.md)).
- **Decisão é UPDATE condicional**: fora de ordem, duplo clique e corrida viram o mesmo
  mecanismo ([ADR 0004](adr/0004-decisao-por-update-condicional.md)).

**Restrições**

- Entrega até **01/11/2026, 23h59**, por Pull Request no repositório do case.
- Execução **local**, sem serviço pago e sem credencial externa.
- Dados de demonstração com ao menos 2 obras, usuários, regras e pedidos em estados diferentes.

**Decisões registradas**

| ADR | Assunto |
|---|---|
| [0001](adr/0001-cadeia-de-aprovacao-e-snapshot.md) | A cadeia é snapshot, não derivação |
| [0002](adr/0002-faixa-por-limite-superior.md) | A faixa guarda apenas o limite superior |
| [0003](adr/0003-route-handlers-sem-server-actions.md) | Route Handlers, sem Server Actions |
| [0004](adr/0004-decisao-por-update-condicional.md) | Decisão por UPDATE condicional |
| [0005](adr/0005-sessao-de-demonstracao-sem-senha.md) | Sessão de demonstração sem senha |
| [0006](adr/0006-sem-empresa-no-modelo.md) | Empresa fora do modelo |
| [0007](adr/0007-dominio-em-portugues.md) | Domínio em português |

**Sequência de construção:** [`plano-incremental.md`](plano-incremental.md) — a ordem é a das
dependências (regra → pedido → aprovação), não a das telas do enunciado.
