# INC1.1 · dinheiro.ts — centavos e milésimos

Prioridade: Highest · Código: `src/domain/dinheiro.ts` (85 linhas) e `src/domain/quantidade.ts` (47)

## Problem Statement

`0.1 + 0.2` não é `0.3`. Num carrinho de compras isso é um centavo perdido; no Dokimos é um pedido
de R$ 10.000,00 que vira R$ 9.999,99, cai em outra faixa e passa a ser assinado por outra pessoa.
A aritmética errada não produz um número errado — produz uma assinatura errada.

## Solution

Dinheiro em centavos inteiros, quantidade em milésimos inteiros, e um único ponto de arredondamento
no cálculo do total de item. Ponto flutuante aparece só na leitura da entrada do usuário, e só até
virar inteiro.

## User Stories

1. Como compradora, quero digitar "1.234,56" ou "1234.56" e obter o mesmo valor, para que o formato do meu teclado não altere o pedido.
2. Como compradora, quero que texto inválido seja recusado como erro de campo, para que o formulário me aponte onde corrigir em vez de quebrar.
3. Como compradora, quero lançar 2,5 kg, para que quantidade fracionária seja possível.
4. Como compradora, quero que 1,2345 seja recusado e não truncado, para que o sistema não aceite um número e cobre outro.
5. Como aprovador, quero que o total seja a soma exata dos itens, para que não haja centavo sem origem.
6. Como usuária, quero valores exibidos em pt-BR com R$, para que eu leia sem converter.

## Implementation Decisions

- `Centavos` e `Milesimos` são tipos marcados: incompatíveis em compilação, `number` em execução.
- `deEntrada` devolve `null` em vez de lançar — entrada inválida é caso de formulário, não acidente. O separador decimal é o último ponto ou vírgula; o que vier antes é milhar.
- `porMilesimos` multiplica inteiros e arredonda meio-para-cima **uma vez, no produto**. Arredondar antes faz a soma dos itens divergir do total.
- Três casas de precisão em quantidade: é o que obra pede (fração de m³, de tonelada) e mantém o produto inteiro contra centavos.
- Formatação por `Intl.NumberFormat` com locale fixo `pt-BR` — não o do navegador, que mudaria o separador conforme a máquina.

## Testing Decisions

Seam de função pura. Os casos: três formatos de entrada válidos; entrada inválida; `2,5 × R$ 3,33
= R$ 8,33`, que é o caso em que arredondar na hora errada dá resultado diferente; `0,125`;
precisão excedente recusada. Nenhum teste de formatação com locale implícito.

## Subtasks

1. Definir `Centavos` e `Milesimos` como tipos marcados em `tipos.ts`.
2. Implementar `deEntrada` de dinheiro, com detecção de separador decimal e milhar.
3. Implementar `deEntrada` de quantidade, recusando precisão acima de três casas.
4. Implementar `porMilesimos` com arredondamento único no produto.
5. Implementar `somar` e `formatar` em pt-BR.

## Out of Scope

Moeda diferente de BRL. Conversão de câmbio. Exibição por preferência do navegador.
