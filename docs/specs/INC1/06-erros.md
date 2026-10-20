# INC1.6 · erros.ts — códigos fechados

Prioridade: High · Código: `src/domain/erros.ts` (57 linhas)

## Problem Statement

Se a interface decidir o que mostrar comparando texto de mensagem, qualquer melhoria de redação
quebra a tela. E se cada rota escolher a própria situação HTTP, a mesma recusa responde 422 numa e
409 em outra — e o `curl` do avaliador encontra incoerência.

## Solution

Uma lista fechada de códigos, um tipo que os carrega até a borda, e um mapa único de código para
situação HTTP. Mensagem é texto para humano e muda; código é contrato e não muda.

## User Stories

1. Como desenvolvedora da tela, quero decidir o que mostrar pelo código, para que melhorar a redação não quebre nada.
2. Como desenvolvedora, quero a lista de códigos exaustiva em tipo, para que um código novo force o tratamento onde falta.
3. Como avaliador, quero a mesma recusa com a mesma situação HTTP em toda rota, para que o contrato seja coerente sob `curl`.
4. Como usuária, quero erro ancorado no campo, para que o formulário aponte onde corrigir.
5. Como aprovador, quero que "não é sua vez" responda 409 e não 400, para que o motivo seja conflito de estado e não entrada inválida.

## Implementation Decisions

- Sete códigos: `VALIDACAO`, `SEM_REGRA_APLICAVEL`, `NAO_E_SUA_VEZ`, `CADEIA_CONCLUIDA`, `NAO_ENCONTRADO`, `SEM_PERMISSAO`, `PEDIDO_IMUTAVEL`.
- `SITUACAO_HTTP` é um `Record<Codigo, number>` completo: acrescentar código sem mapear é erro de compilação.
- O mapa mora no domínio e não nas rotas. Espalhado, ele diverge.
- `NAO_E_SUA_VEZ` e `CADEIA_CONCLUIDA` são 409 — conflito de estado, não entrada inválida. `VALIDACAO` e `SEM_REGRA_APLICAVEL` são 422: a entrada está bem formada e mesmo assim não pode ser processada.
- `campos` é opcional e só acompanha o que dá para ancorar.

## Testing Decisions

Testado indiretamente, pelo uso: cada caso dos demais módulos afirma o **código** da recusa, nunca
a mensagem. Um teste que afirmasse o texto transformaria redação em contrato.

A exaustividade do mapa é garantida pelo compilador, não por teste — `Record<Codigo, number>`
recusa a omissão antes de rodar.

## Subtasks

1. Declarar `CODIGOS` como tupla literal e derivar `Codigo` dela.
2. Declarar `ErroDominio` e `CamposComErro`.
3. Escrever a fábrica `erro(codigo, mensagem, campos?)`.
4. Declarar `SITUACAO_HTTP` como `Record` completo.

## Out of Scope

O envelope HTTP `{ error: { code, message, fields? } }` e o wrapper de rota (INC2). Mensagens
localizadas em outro idioma.
