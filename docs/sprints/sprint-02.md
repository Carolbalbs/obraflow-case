# Sprint 2 · Domínio e testes

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/02-dominio-e-testes.json`](../spec/02-dominio-e-testes.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-dominio`

**Estado:** em_andamento

**Entregável:** npm test verde cobrindo limite inclusivo, teto estourado, obra sem faixa, ordem da cadeia, decisão fora de ordem e rejeição encerrando o fluxo.

**Risco:** baixo · **Pré-requisito:** s1 · **Stack permitida:** `typescript`, `zod`, `vitest`

## Escopo

O domínio inteiro como módulos de funções puras, sem import de next/*, sem banco e sem HTTP.

- **s2f1** — Tipos e códigos de erro: Tipos marcados para centavos e milésimos, papéis e situações como listas fechadas, e os sete códigos de erro com seu mapa HTTP.
- **s2f2** — Dinheiro e quantidade: Centavos e milésimos inteiros, com um único ponto de arredondamento no total do item.
- **s2f3** — resolverFaixa: Dado o total e as faixas da obra, devolve a faixa aplicável ou uma recusa explicada.
- **s2f4** — montarCadeia e leitura do snapshot: Deriva a cadeia da faixa na submissão e responde perguntas sobre uma cadeia já gravada.
- **s2f5** — Política de decisão: Valida a decisão contra o estado da cadeia e diz qual situação o pedido assume em seguida.
- **s2f6** — Schemas Zod por operação: Rascunho permissivo e submissão estrita como schemas diferentes, compartilhados entre rota e formulário.
- **s2f7** — Vitest em dois projetos e suíte do domínio: Projeto de domínio paralelo e sem setup; projeto de API em série, declarado agora e exercitado no extra E2.

## Fora do escopo

- O envelope HTTP e o wrapper de rota (Sprint 3)
- Moeda diferente de BRL
- Formatação por preferência do navegador
- Persistir faixas (Sprint 4)
- Montar a cadeia (s2f4)
- Gravar a cadeia (Sprint 5)
- Desenhar a cadeia (Sprint 6)
- A garantia contra corrida, que é o UPDATE condicional da Sprint 6
- Permissão por papel (Sprint 3)
- Schemas de faixa (Sprint 4) e de decisão (Sprint 6)
- Setup de reset e fábricas (extra E2)
- Cobertura como métrica
- Teste de componente

## Regras do agente

- Nenhum import de next/*, @prisma/* ou react em src/domain. É erro de aceite, não estilo.
- Falha prevista é Resultado, não exceção.
- Todo teste afirma o código do erro, nunca o texto da mensagem.
- Cada caso de teste monta os próprios dados; sem fixture compartilhada.

**Modelos tocados:** Etapa, Faixa, FaixaAprovador, ItemPedido, Pedido

## Features

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

## Critérios de aceite da sprint

1. [`s2f1`] Passar Milesimos onde se espera Centavos é erro de compilação
2. [`s2f1`] SITUACAO_HTTP é Record<Codigo, number> completo: omitir um código não compila
3. [`s2f1`] NAO_E_SUA_VEZ e CADEIA_CONCLUIDA mapeiam para 409
4. [`s2f1`] VALIDACAO e SEM_REGRA_APLICAVEL mapeiam para 422
5. [`s2f1`] SEM_PERMISSAO mapeia para 403 e NAO_ENCONTRADO para 404
6. [`s2f2`] deEntrada('1.234,56'), deEntrada('1234,56') e deEntrada('1234.56') devolvem 123456
7. [`s2f2`] deEntrada('abc') e deEntrada('') devolvem null, sem lançar
8. [`s2f2`] porMilesimos(333, 2500) devolve 833 — ou seja, 2,5 x R$ 3,33 = R$ 8,33
9. [`s2f2`] Quantidade.deEntrada('0,125') devolve 125
10. [`s2f2`] Quantidade.deEntrada('1,2345') devolve null: precisão excedente é recusada, não truncada
11. [`s2f2`] formatar(123456) devolve 'R$ 1.234,56' com locale pt-BR fixo
12. [`s2f3`] Total de 1000000 centavos numa obra com faixa de limite 1000000 resolve para essa faixa — limite inclusivo
13. [`s2f3`] Total de 1000001 resolve para a faixa seguinte
14. [`s2f3`] Obra sem nenhuma faixa devolve falha com código SEM_REGRA_APLICAVEL
15. [`s2f3`] Total acima do limite da faixa mais alta, sem faixa aberta, devolve SEM_REGRA_APLICAVEL e a mensagem cita o valor do teto
16. [`s2f3`] Faixa que comporta o total mas não tem aprovador devolve SEM_REGRA_APLICAVEL
17. [`s2f3`] Faixas passadas fora de ordem resolvem corretamente
18. [`s2f4`] Nenhuma função de cadeia.ts recebe Alcada como parâmetro: grep por 'Alcada' em src/domain/cadeia.ts não retorna nada
19. [`s2f4`] montarCadeia preserva a ordem dos aprovadores da faixa
20. [`s2f4`] Ordens não contíguas na faixa (0, 5, 9) produzem cadeia com ordens 0, 1, 2
21. [`s2f4`] aprovadorDaVez devolve a primeira etapa pendente em ordem crescente
22. [`s2f4`] Cadeia com uma etapa rejeitada tem aprovadorDaVez igual a null
23. [`s2f4`] historico devolve só as etapas com situação diferente de pendente
24. [`s2f5`] validar devolve a Etapa atingida, não um booleano — é ela que condiciona o UPDATE da Sprint 6
25. [`s2f5`] Decisão do segundo aprovador com a primeira etapa pendente devolve código NAO_E_SUA_VEZ
26. [`s2f5`] Decisão de quem não está na cadeia devolve NAO_E_SUA_VEZ com mensagem diferente da anterior
27. [`s2f5`] Decisão em cadeia já aprovada por inteiro devolve CADEIA_CONCLUIDA
28. [`s2f5`] Decisão em cadeia com etapa rejeitada devolve CADEIA_CONCLUIDA
29. [`s2f5`] rejeitar('  ') devolve falha VALIDACAO com campos.motivo preenchido
30. [`s2f5`] situacaoApos devolve 'rejeitado' para qualquer rejeição, em qualquer posição
31. [`s2f5`] situacaoApos devolve 'aprovado' só quando não resta etapa pendente
32. [`s2f6`] rascunhoSchema aceita objeto com todos os campos ausentes
33. [`s2f6`] submissaoSchema recusa pedido com zero itens
34. [`s2f6`] submissaoSchema recusa item com quantidade igual a zero e com preço negativo, e aceita preço igual a zero ("valor monetário não negativo", no enunciado)
35. [`s2f6`] submissaoSchema recusa mais de 100 itens
36. [`s2f6`] submissaoSchema recusa descrição acima de 200 caracteres e observações acima de 2000
37. [`s2f6`] O erro devolvido traz campos no formato CamposComErro, nunca o formato nativo do Zod
38. [`s2f6`] submissaoSchema exige dataPedido em "AAAA-MM-DD", com erro em fields.dataPedido quando ausente, vazia ou fora do calendário; rascunhoSchema a aceita ausente ou vazia
39. [`s2f6`] Item com preço ausente — nulo no rascunho gravado — é recusado na submissão com fields['itens.N.precoUnitario'], no mesmo formato dos outros erros de item; preço zero passa
40. [`s2f7`] npm test executa o projeto dominio e termina verde
41. [`s2f7`] A suíte do domínio tem ao menos 12 casos
42. [`s2f7`] O projeto api está declarado com fileParallelism false e executa zero casos sem erro de configuração
43. [`s2f7`] Nenhum teste do domínio usa mock ou stub
44. [`s2f7`] Nenhum teste afirma o texto de uma mensagem de erro: todos afirmam o código
45. [`s2f7`] prisma/test.db está no .gitignore

## Definition of done

- [ ] npm test verde
- [ ] npx tsc --noEmit limpo
- [ ] grep por "from 'next" em src/domain/ não retorna nada
- [ ] Todo caminho de recusa do domínio tem ao menos um caso de teste

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.