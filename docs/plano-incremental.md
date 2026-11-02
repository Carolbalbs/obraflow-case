# Plano incremental

Prazo: 1º de novembro de 2026, 23h59. Quatro dias de calendário, com o último reservado como
folga — trabalho planejado para o último dia é trabalho que não acontece.

Cada incremento termina com a aplicação **rodando** e demonstrando algo a mais que o anterior.
Nenhum incremento deixa a aplicação quebrada. Se o tempo acabar no meio da lista, o que está
pronto é entregável.

A ordem não é a ordem das telas do enunciado. É a ordem das dependências: regra antes de pedido,
pedido antes de aprovação. Construir a tela 1 primeiro obrigaria a inventar faixas na mão para
testar qualquer coisa.

---

## Inc 0 · Esqueleto

`create-next-app` com TypeScript e App Router. Tailwind v4 com o tema apontando para os tokens de
`site/assets/css/obraflow.css` — rampa de marca, rampa `levels`, superfícies. Prisma 7.10.1
pinado (o dist-tag `latest` é release candidate), SQLite, `schema.prisma` completo com todas as
tabelas, primeira migration, seed mínimo de duas obras.

**Pronto quando:** `npm run dev` mostra uma página listando as duas obras vindas do banco, com a
tipografia e a cor de marca corretas.

## Inc 1 · Domínio e testes

`src/domain/`: `dinheiro.ts` (centavos), `alcada.ts` (`resolverFaixa`, `montarCadeia`),
`decisao.ts` (quem pode decidir, o que rejeição faz), `schemas.ts` (Zod, um por operação),
`erros.ts` (enum de códigos). Suíte do domínio no Vitest, 12–18 casos.

Nenhuma tela. Nenhum import de `next/*` aqui dentro, nunca.

**Pronto quando:** `npm test` verde, cobrindo limite inclusivo, teto estourado, obra sem faixa,
cadeia na ordem, decisão fora de ordem e rejeição encerrando a cadeia.

## Inc 2 · Sessão e papéis

Tela de entrada listando os usuários do seed, sem senha, atrás de `DEMO_MODE`. Sessão em cookie
httpOnly. `src/server/sessao.ts` expondo `lerSessao(req: Request)` — **recebendo o Request**, não
usando `cookies()` de `next/headers`, senão a etapa 2 de testes fica inviável.
`src/server/permissao.ts` com os quatro papéis. `src/server/http.ts` com o envelope
`{ error: { code, message, fields? } }`.

Cabeçalho mostrando quem está dentro, com "trocar de usuário" e o nome da construtora fixo.

**Pronto quando:** dá para entrar como cada usuário do seed, o menu muda conforme o papel, e uma
rota protegida responde 403 para quem não deve.

## Inc 3 · Tela 3 — Regras da alçada

Primeira tela de verdade, porque sem faixa não há pedido submetível. Seleção de obra, listagem
das faixas, criar, editar, remover. Limite superior por faixa, aprovadores ordenados, reordenação.
`PUT /api/faixas/:id` substituindo a faixa inteira. Exclusiva do `admin`; os outros levam 403 na
API, não só item escondido no menu.

**Pronto quando:** Marina cria, edita, reordena e remove faixas; Amanda tentando a mesma URL vê a
explicação de acesso negado.

## Inc 4 · Tela 1 — Cadastro de pedido

Rascunho salvável e incompleto. Itens N, adicionar, editar, remover, total por item calculado e
não editável, total do pedido somado. Submissão separada da criação: valida tudo, resolve a faixa,
grava a cadeia. "Sem regra aplicável" bloqueando a submissão sem perder o rascunho.

**Pronto quando:** dá para montar um pedido de três itens, salvar como rascunho, sair, voltar,
completar e submeter — e a cadeia aparece gravada no banco.

## Inc 5 · Tela 2 — Aprovação

Lista com identificador, obra, fornecedor, data, contagem de itens, total, situação e alçada
atual. Filtros por situação e obra. Detalhe com itens e histórico de decisões. Aprovar e rejeitar,
rejeição exigindo motivo em diálogo. Cadeia desenhada com a etapa corrente destacada. Decisão
indisponível explicada, nunca só desabilitada em silêncio.

**Pronto quando:** entrando como Amanda e depois como João, a mesma lista mostra filas diferentes,
e aprovar como Amanda libera a decisão do João.

## Inc 6 · Estados, validações e responsividade

Passada dedicada, não polvilhada pelo caminho: loading em toda lista, empty state amigável, erro
com opção de tentar de novo, validação por campo usando o mesmo schema Zod do servidor, layout
funcionando de 390px para cima com a tabela de itens virando cartões abaixo de 768px.

**Pronto quando:** derrubar o servidor com a tela aberta produz estado de erro com botão de
repetir, e nenhuma lista pisca conteúdo vazio antes de carregar.

## Inc 7 · Seed completo, prova e documentação

Seed dos oito pedidos posicionados em cada ponto do ciclo, incluindo o de faixa editada depois da
submissão. `scripts/verificar.sh` demonstrando 409 e 403 por `curl`. Screenshots das três telas —
exigidas pelo enunciado e mais demoradas do que parecem. `README.md` com instalação, execução,
tecnologias e motivos, modelagem da alçada, comunicação front-back, consistência, e "o que
mudaria em produção" apoiado no canvas de mockups.

**Pronto quando:** alguém que nunca viu o projeto clona, segue o README e chega na tela de
aprovação sem perguntar nada.

---

## Extras, nesta ordem

Só começam com o Inc 7 fechado. Cada um é autocontido e pode não existir.

**E1 · Simulador de alçada ao vivo** — na tela de cadastro, a cadeia prevista aparece conforme o
total muda, inclusive o estado sem regra aplicável. Já desenhado em `AprovacoesB`; reaproveita
`resolverFaixa` por uma rota a mais. É o extra de maior retorno: torna visível a regra que vale
20% da nota.

**E2 · Suíte de integração da API** — a etapa 2a descrita em `plano-testes-etapa2.md`.

**E3 · Gráfico na tela de administração** — o de menor prioridade, e o único que não melhora
nenhum critério diretamente.

---

## Distribuição pelos dias

| Dia | Incrementos |
|---|---|
| 29/10 | Inc 0, 1, 2, 3 |
| 30/10 | Inc 4, 5 |
| 31/10 | Inc 6, 7, e o que couber dos extras |
| 01/11 | **folga**: revisão, PR, imprevisto |

O PR precisa sair com e-mail e telefone na descrição, conforme o enunciado. Abrir o PR no dia 31,
não no dia 1º — se algo der errado no GitHub, você quer um dia inteiro para resolver.

## Regras de corte

Se o dia 30 terminar sem o Inc 5 pronto, corte na seguinte ordem: extras inteiros, depois
reordenação de aprovadores na tela 3, depois filtros na tela 2. Nunca corte estados de erro
(10% explícitos) nem o README (10% explícitos) — são os itens com melhor retorno por hora de
toda a entrega.
