# INC0.2 · Tema Tailwind com os tokens do ObraFlow

Prioridade: Highest · Épico: INC0 · Esqueleto · Label: dia-29

## Problem Statement

O ObraFlow tem identidade visual definida em `site/assets/css/obraflow.css`. Sem trazê-la para o
Tailwind antes das telas, cada componente escolhe a própria cor, e a correção depois custa uma
varredura por sete telas.

## Solution

Um bloco de tema em `app/globals.css` declarando rampa de marca, rampa neutra, superfícies e
fontes com os mesmos valores do CSS original. Daí em diante nenhum componente escreve
hexadecimal.

## User Stories

1. Como avaliador, quero reconhecer o ObraFlow na primeira tela, para que a entrega não pareça um template genérico.
2. Como desenvolvedora, quero a rampa de marca como token nomeado, para que "a cor primária" tenha um nome e não um valor copiado.
3. Como desenvolvedora, quero a rampa neutra separada da de marca, para que texto, borda e superfície não disputem a mesma escala.
4. Como desenvolvedora, quero tokens de superfície, para que fundo de página, de cartão e de tabela sejam decisões tomadas uma vez.
5. Como desenvolvedora, quero Inter e Lora carregadas pelo Next, para que não haja salto de fonte no primeiro render.
6. Como avaliador, quero o eyebrow em Lora itálico igual ao desenho, para que o detalhe tipográfico prove que o desenho foi seguido e não aproximado.

## Implementation Decisions

- Tailwind v4 configura tema em CSS, não em arquivo JS: `@theme` dentro de `app/globals.css`.
- Os valores saem de `site/assets/css/obraflow.css` por cópia literal. Divergência de valor entre os dois arquivos é defeito, não ajuste.
- Fontes carregadas por `next/font` e expostas como variável CSS consumida pelo `@theme`, para evitar FOUT.
- Nenhum componente usa cor arbitrária (`text-[#...]`). A regra vale também para estado de erro e de sucesso, que ganham token próprio.

## Testing Decisions

Verificação visual contra o original: a página renderiza com a cor de marca correta e o eyebrow em
Lora itálico. Não há asserção automatizada — teste de valor de token afirmaria duas vezes a mesma
constante, e quebraria a cada ajuste legítimo de design.

O que protege este trabalho é a ausência de cor arbitrária no código, visível em revisão e
verificável por busca.

## Subtasks

1. Extrair de `site/assets/css/obraflow.css` a rampa de marca, a rampa neutra e as superfícies.
2. Declarar o bloco `@theme` em `app/globals.css` com esses valores.
3. Carregar Inter e Lora por `next/font` e ligá-las aos tokens de fonte.
4. Aplicar tokens de superfície e texto no `app/layout.tsx`.
5. Renderizar um eyebrow em Lora itálico e comparar lado a lado com o original.

## Out of Scope

Modo escuro. Componentes de interface (cada incremento traz os seus). Responsividade (INC6).
