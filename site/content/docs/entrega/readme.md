---
title: Checklist do README
weight: 1
prev: /docs/entrega/
next: /docs/entrega/avaliacao
---

Conteúdo exigido no `README.md` da entrega, item a item, com onde cada um está.

## Produto e telas

- [x] **screenshots** das telas — [Screenshots](/tutoriais/screenshots).

## Decisões

- [x] **tecnologias escolhidas e os motivos** da escolha — [Tecnologias](/docs/guia/tecnologias);
- [x] seção **`## Decisões técnicas`** — critério de avaliação explícito; está no README com esse título exato.

## Alçada

- [x] como a **regra de alçada é modelada, calculada e persistida** — [Modelagem da alçada](/docs/guia/alcada);
- [x] comportamento definido para **valores sem regra de alçada aplicável** — [Valor sem regra aplicável](/docs/guia/alcada#valor-sem-regra-aplicável).

## Arquitetura e dados

- [x] como o **front-end se comunica com o back-end** — [Front-end ↔ back-end](/docs/guia/comunicacao);
- [x] como a **consistência e a integridade dos dados** são garantidas — [Consistência](/docs/guia/consistencia);
- [x] **o que mudaria em produção** — [Produção](/docs/guia/producao).

## Execução

- [x] como **iniciar a aplicação** e **popular os dados** — [Primeiros passos](/docs/getting-started) e [Dados de demonstração](/tutoriais/dados-demo);
- [x] como **consumir a API** — [tabela de endpoints e exemplo `curl`](/docs/guia/comunicacao).

{{< callout type="warning" >}}
A seção `## Decisões técnicas` não é opcional: ela aparece nos
[critérios de avaliação](/docs/) com peso próprio.
{{< /callout >}}

## Cruzamento com o enunciado

O levantamento completo, critério a critério, está em [`docs/criterios-do-enunciado.md`](https://github.com/Carolbalbs/obraflow-case/blob/main/docs/criterios-do-enunciado.md). O resumo:

| Critério | Peso | Situação | Onde pesa |
|---|---:|:---:|---|
| Funcionamento completo: front, back e persistência | 25% | ✅ | Todas as rotas e telas exercitadas por `curl` e navegador |
| Modelagem e implementação das regras de alçada | 20% | ✅ | `src/domain/`, snapshot, UPDATE condicional, corrida provada |
| Qualidade de código, organização e decisões técnicas | 15% | ✅ | Domínio puro, 7 ADRs, mapa de erros central; toda rota tem feature na SPEC |
| Desenho de UI: hierarquia, clareza, consistência | 20% | ✅ | 9 screenshots; depende do julgamento de quem avalia |
| Estados, responsividade e validações | 10% | ✅ | Completo; data do pedido obrigatória e preço zero aceito, como o enunciado pede |
| Documentação (`## Decisões técnicas`) | 10% | ✅ | Seção com exatamente esse título em README.md:266 |

### Entrega

| Exigência | | Onde |
|---|:---:|---|
| Instruções para instalar, configurar e iniciar | ✅ | README.md:113 |
| Código-fonte de front e back | ✅ | `app/`, `src/` |
| Dados de demonstração e instruções | ✅ | `npm run seed`; README.md:174 |
| README: screenshots | ✅ | 9 imagens em `docs/screenshots/`, todas existentes |
| README: tecnologias e motivos | ✅ | README.md:268 |
| README: como a alçada é modelada, calculada e persistida | ✅ | README.md:285 |
| README: como o front conversa com o back | ✅ | README.md:337 |
| README: consistência e integridade | ✅ | README.md:411 |
| README: o que mudaria em produção | ✅ | README.md:532 |
| Fork e Pull Request até 01/11/2026 23h59 | ⚠️ | Commitado no branch `resolucao-obraflow` do fork e PR aberto dentro do fork ([Carolbalbs/obraflow-case#1](https://github.com/Carolbalbs/obraflow-case/pull/1)); o destino previsto é `ObraFlow/obraflow-case` |
| E-mail e telefone na descrição do PR | ❌ | Ainda não preenchidos — os marcadores continuam em pull-request.md |
