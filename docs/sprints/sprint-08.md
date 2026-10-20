# Sprint 8 · Seed completo, prova e documentação

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/08-seed-completo-prova-e-documentacao.json`](../spec/08-seed-completo-prova-e-documentacao.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-integracao`

**Entregável:** Alguém que nunca viu o projeto clona, segue o README e chega na tela de aprovação sem perguntar nada.

**Risco:** medio · **Pré-requisito:** s7 · **Stack permitida:** `prisma`, `tsx`, `bash`

## Escopo

Os oito pedidos posicionados em cada ponto do ciclo, o script de verificação por curl, as screenshots e o README.

- **s8f1** — Seed completo com oito pedidos: Cada ponto do ciclo representado, incluindo o pedido cuja faixa foi editada depois da submissão.
- **s8f2** — Script de verificação por curl: Demonstra 409 em decisão fora de ordem, 409 em decisão concorrente e 403 em rota de alçada.
- **s8f3** — Screenshots e README: As três telas capturadas e a documentação completa, incluindo o que mudaria em produção.
- **s8f4** — Pull Request: Aberto no dia 31, com e-mail e telefone na descrição, conforme o enunciado.

## Regras do agente

- O seed precisa produzir os estados sem edição manual depois.
- Todo número citado no README tem que ser reproduzível pelo seed.
- Script de verificação demonstra as recusas por curl, com saída legível.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

**Modelos tocados:** Etapa, Faixa, FaixaAprovador, Fornecedor, ItemPedido, Obra, Pedido, Usuario

## Features

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

## Critérios de aceite da sprint

1. [`s8f1`] O seed cria ao menos 2 obras, 4 usuários cobrindo os quatro papéis, e 8 pedidos
2. [`s8f1`] Existe ao menos um pedido em cada situação: rascunho, pendente, aprovado, rejeitado
3. [`s8f1`] Existe um pedido pendente na 2ª etapa com a 1ª já aprovada
4. [`s8f1`] Existe um pedido cuja faixa foi editada após a submissão, e sua cadeia difere da faixa atual da obra
5. [`s8f1`] Existe um pedido com faixaId nulo e faixaLimiteCentavos preenchido — faixa apagada, snapshot intacto
6. [`s8f1`] Entrar como Amanda e como João mostra filas diferentes sem nenhuma edição manual
7. [`s8f1`] npm run db:reset seguido de npm run seed reproduz exatamente o mesmo estado
8. [`s8f2`] O script roda contra o servidor local e imprime o status HTTP de cada chamada
9. [`s8f2`] Demonstra 409 NAO_E_SUA_VEZ para decisão fora de ordem
10. [`s8f2`] Demonstra exatamente um 200 e um 409 em duas decisões disparadas em paralelo
11. [`s8f2`] Demonstra 403 SEM_PERMISSAO em PUT /api/faixas/{id} como aprovador
12. [`s8f2`] Demonstra 422 SEM_REGRA_APLICAVEL numa submissão acima do teto
13. [`s8f2`] Cada bloco tem um comentário dizendo o que está sendo provado
14. [`s8f2`] O script termina com código 0 quando todos os status esperados ocorreram
15. [`s8f3`] O README tem instalação, execução, seed, tecnologias com motivo, modelagem da alçada, comunicação front-back, consistência e o que mudaria em produção
16. [`s8f3`] As três telas do enunciado estão no README como imagem legível
17. [`s8f3`] Existe uma tabela do que cada papel vê e pode fazer
18. [`s8f3`] Todo número citado no README é reproduzível pelo seed
19. [`s8f3`] Seguir o README do zero chega à tela de aprovação sem passo faltando
20. [`s8f3`] O README declara as divergências deliberadas do mockup e seus motivos
21. [`s8f4`] O PR está aberto contra o repositório do case
22. [`s8f4`] A descrição contém e-mail e telefone
23. [`s8f4`] npx tsc --noEmit, npm run lint e npm test passam no commit do PR
24. [`s8f4`] O PR foi aberto até 31/10, não em 01/11

## Definition of done

- [ ] Seed reproduz os oito pedidos em um comando
- [ ] scripts/verificar.sh demonstra 403, 409 e 422
- [ ] README completo com as três screenshots
- [ ] PR aberto com e-mail e telefone

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.