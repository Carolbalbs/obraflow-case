# Sprint 12 · Extra E4 — Duplicar pedido rejeitado *(extra)*

> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/12-extra-duplicar-pedido-rejeitado.json`](../spec/12-extra-duplicar-pedido-rejeitado.json).**
>
> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.
> Contexto: [`SPEC.md`](../SPEC.md) · [`PROGRESS.md`](../PROGRESS.md) · agente `ag-fullstack`

**Entregável:** Duplicar um pedido rejeitado abre um rascunho novo com os mesmos itens.

**Risco:** baixo · **Pré-requisito:** e3 · **Stack permitida:** `next`, `react`, `typescript`, `prisma`

## Escopo

Cria um rascunho novo a partir de um pedido rejeitado, sem tocar no original.

- **e4f1** — Duplicar pedido: Copia cabeçalho e itens para um rascunho novo. O pedido original permanece intacto.

## Fora do escopo

- Reabrir o próprio pedido rejeitado — destruiria a trilha, contradiz o ADR 0001

## Regras do agente

- A sprint só fecha com a tela usando a rota de verdade, nunca com dado simulado.
- Toda lista nasce com carregando, vazio e erro com repetição — não é passada posterior.
- Validação da tela usa o mesmo schema Zod do servidor, ancorada por error.fields.
- Regra de negócio fica no domínio; componente não decide alçada.
- Fidelidade total ao artboard da sua sprint (meta.mockups): estrutura, textos, estados, cores, tipografia e espaçamento saem do mockup, não de estimativa. Divergir só pelo que já está na lista de divergências deliberadas.

**Modelos tocados:** ItemPedido, Pedido

## Features

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

## Critérios de aceite da sprint

1. [`e4f1`] O novo pedido tem situacao 'rascunho', nenhuma etapa e nenhum snapshot de faixa
2. [`e4f1`] O pedido original permanece com a situação, a cadeia e o motivo intactos
3. [`e4f1`] Os itens copiados mantêm descrição, quantidade, unidade e preço
4. [`e4f1`] dataPedido do novo pedido é nula
5. [`e4f1`] Duplicar pedido de outro usuário responde 404
6. [`e4f1`] O criador do novo rascunho é o usuário da sessão, não o do original

## Definition of done

- [ ] Duplicar abre rascunho novo
- [ ] O pedido rejeitado permanece intacto

## Verificações

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.