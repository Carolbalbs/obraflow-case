# Descrição do Pull Request

> **Arquivo de preparação — o PR ainda NÃO foi aberto.**
>
> Antes de abrir, substitua os dois marcadores `⟨…⟩` abaixo pelo e-mail e pelo telefone de
> contato: o enunciado exige os dois **na descrição do PR**, e eles são o único conteúdo deste
> texto que não pode ser preenchido por quem o escreveu.
>
> Destino: `Carolbalbs/obraflow-case` → `ObraFlow/obraflow-case`, base `main`.
> Prazo do enunciado: **01/11/2026 às 23:59**.

---

## Título sugerido

```
ObraFlow — aprovações por alçada: três telas, API e dados de demonstração
```

---

## Corpo

### Contato

- **E-mail:** ⟨preencher⟩
- **WhatsApp:** ⟨preencher⟩

---

Entrega do desafio full-stack do ObraFlow: o **serviço de aprovações** de pedidos de
compra por alçada. Pedidos com N itens, cadeia de aprovadores definida pelo total do pedido na
obra, decisão em ordem, rejeição com motivo e configuração das faixas por obra.

**Como rodar** (detalhes no [`README.md`](README.md)):

```bash
npm install && cp .env.example .env
npx prisma migrate dev && npm run seed && npm run dev
```

### O que está pronto

- **Tela 1 — cadastro de pedido.** Obra, fornecedor e data do pedido obrigatórios; N itens, total
  do item calculado e não editável, total do pedido somado no servidor, rascunho que sobrevive a
  sair e voltar.
- **Tela 2 — aprovação.** Lista com as nove informações do enunciado e a alçada atual por pedido;
  detalhe com itens, cadeia e histórico auditável; aprovar e rejeitar com motivo obrigatório.
- **Tela 3 — regras da alçada.** Faixas por obra: criar, editar, remover e reordenar aprovadores.
- **API inteira por Route Handler**, inspecionável por `curl`, com envelope de erro único.
- **Seed completo:** 3 obras, 6 usuários cobrindo os 4 papéis, 4 fornecedores, 3 faixas e
  **8 pedidos**, um em cada ponto do ciclo — inclusive um cuja faixa foi *editada* depois da
  submissão e outro cuja faixa foi *apagada*. Um comando, nenhum cadastro manual.
- **`./scripts/verificar.sh`** prova por `curl` as recusas `403`, `409` (fora de ordem e em
  corrida) e `422`, e sai com código 0.
- **56 casos** de teste, `tsc` e `lint` limpos.

### As decisões que valem a leitura

| | |
|---|---|
| **A cadeia é snapshot** | Resolvida e gravada na submissão, nunca recalculada. Editar ou apagar a faixa depois **não** reescreve pedido em andamento — os pedidos `#1007` e `#1008` do seed existem só para mostrar isso ([ADR 0001](docs/adr/0001-cadeia-de-aprovacao-e-snapshot.md)) |
| **A faixa guarda só o limite superior**, inclusivo | Não há coluna de mínimo: ele é derivado da faixa anterior. Buraco e sobreposição deixam de ser *representáveis*, em vez de serem validados ([ADR 0002](docs/adr/0002-faixa-por-limite-superior.md)) |
| **A decisão é um `UPDATE` condicional** | Decisão fora de ordem, duplo clique e corrida viram o mesmo mecanismo: zero linhas afetadas é `409`. Dois `POST` paralelos dão um `200` e um `409`, com uma única etapa decidida ([ADR 0004](docs/adr/0004-decisao-por-update-condicional.md)) |
| **Dinheiro em centavos, quantidade em milésimos** | Nenhum `Float` ou `Decimal` em nenhum ponto. Um pedido de R$ 10.000,00 que vira R$ 9.999,99 cai em outra faixa e é assinado por outra pessoa |
| **Domínio puro, em português** | `src/domain/` não importa `next/*` e não toca em banco — é o que o torna testável sem subir servidor ([ADR 0007](docs/adr/0007-dominio-em-portugues.md)) |

### Uma escolha fora do enunciado, de propósito

- **A entrada é sem senha**, atrás da flag `DEMO_MODE`, para que avaliar a cadeia inteira custe
  um clique por papel. Desligada a flag, as rotas de sessão respondem 404
  ([ADR 0005](docs/adr/0005-sessao-de-demonstracao-sem-senha.md)).

### Para avaliar em 5 minutos

Entre como **Amanda Prado** — `/pedidos` abre com `#1003` na fila dela. Troque para **João
Ferreira** no seletor do cabeçalho: a mesma URL passa a mostrar `#1004` e `#1007`. Abra o
`#1007` e compare a regra aplicada ("até R$ 6.000,00, congelada no envio") com a faixa de mesmo
id na tela 3, hoje "até R$ 10.000,00 → Amanda". O roteiro completo está no
[README](README.md#roteiro-de-avaliação-em-5-minutos).

---

<sub>Stack: Next.js 16 · React 19 · TypeScript · Prisma 7 · SQLite · Tailwind v4 · Vitest. Sem
serviço pago, sem credencial externa, sem container.</sub>
