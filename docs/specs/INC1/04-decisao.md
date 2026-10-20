# INC1.4 · decisao.ts — aprovador da vez e validação

Prioridade: Highest · Código: `src/domain/decisao.ts` (119 linhas)

## Problem Statement

Decisão fora de ordem, duplo clique no mesmo botão e dois aprovadores decidindo ao mesmo tempo
parecem três problemas. Tratados como três validações separadas, cada um ganha um caminho próprio
e um deles fica de fora.

## Solution

Um módulo que valida a decisão contra o estado da cadeia e diz qual situação o pedido assume
depois. Os três casos viram o mesmo: a etapa que este usuário poderia decidir não é a primeira
pendente.

## User Stories

1. Como aprovador, quero decidir apenas quando for a minha vez, para que a ordem da alçada seja real.
2. Como segundo aprovador, quero ser recusado enquanto o primeiro não decidir, para que eu não assine por cima de quem vem antes.
3. Como pessoa fora da cadeia, quero uma recusa que diga que não faço parte dela, para que eu não confunda com falta de permissão.
4. Como aprovador, quero que decidir um pedido concluído tenha explicação própria, para que eu distinga "acabou" de "não é sua vez".
5. Como aprovador, quero ser obrigado a dar motivo ao rejeitar, para que quem recebe o pedido saiba o que corrigir.
6. Como compradora, quero que a rejeição encerre o pedido inteiro, para que ele não siga para quem não tem mais o que decidir.
7. Como aprovador final, quero que minha aprovação aprove o pedido, para que o fluxo termine onde a cadeia termina.

## Implementation Decisions

- **Este módulo valida, não escreve.** A garantia contra corrida não está aqui e não pode estar: entre validar e escrever, outra requisição pode decidir a mesma etapa. A imposição é o UPDATE condicional do ADR 0004; esta validação produz mensagem boa no caso comum.
- `validar` devolve a **etapa atingida**, não um booleano. Quem chama usa a `ordem` para condicionar a escrita, em vez de reler o pedido — é o que torna a escrita condicional possível sem round-trip extra.
- Mensagens distintas para `NAO_E_SUA_VEZ` conforme o usuário esteja ou não na cadeia. Mesma recusa, diagnósticos diferentes.
- `rejeitar(motivo)` devolve `Resultado`: motivo vazio é erro de campo, e o módulo o produz já ancorado em `campos.motivo`.
- `situacaoApos` separa o efeito da validação: aprovar a última etapa aprova o pedido; rejeitar encerra em qualquer posição.

## Testing Decisions

Seam de função pura. Os casos: decisão fora de ordem; decisão por quem não está na cadeia;
decisão após aprovação completa; decisão após rejeição; rejeição sem motivo; rejeição com motivo;
a vez avançando após aprovação; aprovação da última etapa resultando em `aprovado`.

**O que este seam não cobre, e por quê:** duas decisões simultâneas na mesma etapa. A corrida só
existe quando há escrita concorrente, e portanto só é testável no seam de Route Handler, com
`Promise.all` contra o banco — INC5, caso do 409. É o motivo de aquele seam não poder ser cortado.

## Subtasks

1. Declarar `Decisao` como união de aprovar e rejeitar-com-motivo.
2. Implementar `rejeitar` devolvendo erro de campo ancorado em `motivo`.
3. Implementar `podeDecidir` sobre o aprovador da vez.
4. Implementar `validar` com os quatro caminhos de recusa e as mensagens distintas.
5. Implementar `situacaoApos` cobrindo rejeição, avanço e aprovação final.

## Out of Scope

Permissão por papel (INC2): `podeDecidir` responde sobre a cadeia, não sobre o papel. A escrita
condicional (INC5). O diálogo de rejeição (INC5).
