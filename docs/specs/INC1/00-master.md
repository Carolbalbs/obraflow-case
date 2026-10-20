# INC1 · Domínio e testes — spec master

> Código deste bloco: `src/domain/` — 585 linhas, sete módulos.
> Diagrama: [`docs/specs/diagrama-classes.md`](../diagrama-classes.md), vistas 1 e 2.

## Problem Statement

A regra de alçada do Dokimos é o que o produto vende e o que a avaliação pesa. Ela também é a
parte mais fácil de errar de um jeito invisível: um limite tratado como exclusivo em vez de
inclusivo muda quem assina um pedido de exatamente R$ 10.000,00, e ninguém percebe até alguém
assinar o que não devia. Um centavo nascido de ponto flutuante faz o mesmo.

Se essa regra nascer dentro de uma rota HTTP, ela só é exercitável subindo servidor e montando
requisição — e os quinze casos de limite que ela merece passam a custar caro demais para existir.

## Solution

O domínio inteiro como módulos de funções puras em `src/domain/`, sem nenhum import de `next/*`,
sem banco e sem HTTP. Entra dado, sai decisão. Os casos de limite rodam em milissegundos, e é por
isso que são escritos.

Nenhuma tela neste incremento. Ao final, `npm test` verde cobrindo limite inclusivo, teto
estourado, obra sem faixa, ordem da cadeia, decisão fora de ordem e rejeição encerrando o fluxo.

## User Stories

1. Como compradora, quero que um pedido de exatamente R$ 10.000,00 caia na faixa "até R$ 10.000,00", para que o limite anunciado seja o limite praticado.
2. Como compradora, quero que R$ 10.000,01 suba para a faixa seguinte, para que o centavo a mais mude o aprovador como a regra promete.
3. Como administradora, quero que uma faixa sem teto cubra todo valor acima da anterior, para que não exista pedido alto demais para ser aprovado.
4. Como compradora, quero saber que meu total não cai em nenhuma faixa, para que eu entenda por que não consigo submeter.
5. Como compradora, quero que "sem regra aplicável" não apague meu rascunho, para que eu possa pedir a faixa e voltar para enviar.
6. Como aprovador, quero que o total que eu aprovo seja a soma exata dos itens, para que não haja centavo sem origem.
7. Como compradora, quero digitar "1.234,56" e "1234.56" e obter o mesmo valor, para que o formato do meu teclado não altere o pedido.
8. Como compradora, quero lançar 2,5 kg, para que quantidade fracionária seja possível sem truque.
9. Como compradora, quero que precisão além de três casas seja recusada e não truncada, para que o sistema não aceite um número e cobre outro.
10. Como aprovador, quero decidir apenas quando for a minha vez, para que a ordem da alçada seja real e não sugerida.
11. Como aprovador, quero que a cadeia preserve a ordem definida na faixa, para que a hierarquia desenhada seja a hierarquia exercida.
12. Como segundo aprovador, quero ser recusado enquanto o primeiro não decidir, para que eu não assine por cima de quem vem antes.
13. Como pessoa fora da cadeia, quero uma recusa que diga que não faço parte dela, para que eu não confunda ausência de vez com falta de permissão.
14. Como aprovador, quero que rejeitar encerre o pedido inteiro, para que o fluxo não siga para quem não tem mais o que decidir.
15. Como aprovador, quero ser obrigado a informar o motivo ao rejeitar, para que quem recebe o pedido de volta saiba o que corrigir.
16. Como aprovador, quero que decidir um pedido já concluído seja recusado com explicação própria, para que eu distinga "acabou" de "não é sua vez".
17. Como desenvolvedora, quero a regra testável sem subir servidor, para que quinze casos de limite custem segundos.
18. Como desenvolvedora, quero erros identificados por código fechado, para que a interface decida o que mostrar sem comparar texto.
19. Como desenvolvedora, quero o mesmo schema de validação no servidor e no formulário, para que as duas pontas não divirjam sobre o que é válido.
20. Como desenvolvedora, quero que "sem regra aplicável" seja um resultado e não uma exceção, para que quem chama seja obrigado a tratá-lo como caso.

## Implementation Decisions

**Módulos de funções puras, não classes.** Cada caixa do diagrama vira um módulo com uma
responsabilidade. A separação é a do diagrama; o idioma é o do TypeScript. Uma classe sem estado
seria um namespace com cerimônia a mais.

**Tipos marcados para centavos e milésimos.** `Centavos` e `Milesimos` são `number` em execução e
incompatíveis em compilação. Passar milésimos onde se espera centavos deixa de ser um erro que
aparece num total e passa a ser um erro que aparece ao escrever.

**`Resultado<T, E>` em vez de exceção para falha prevista.** `SEM_REGRA_APLICAVEL` é estado
legítimo do sistema — impede a submissão e não impede o rascunho. Exceção obrigaria o chamador a
tratá-lo como acidente.

**Sete módulos, cada um com um motivo de mudança.** `tipos` (vocabulário), `erros` (lista fechada
de recusas e seu mapa HTTP), `dinheiro`, `quantidade`, `alcada` (qual faixa se aplica), `cadeia`
(derivar e ler o snapshot), `decisao` (quem pode decidir e o que isso provoca). `index.ts` é
fachada: o que não aparece nele não é domínio.

**`cadeia` não recebe `Alcada`.** É o ADR 0001 virando impossibilidade estrutural: sem acesso à
regra vigente, não há como recalcular a cadeia numa leitura.

**`decisao` valida mas não escreve.** A garantia contra corrida não está aqui e não pode estar:
entre validar e escrever, outra requisição pode decidir a mesma etapa. A imposição é o UPDATE
condicional do ADR 0004; esta validação existe para produzir mensagem boa no caso comum.

**Arredondamento uma vez, no fim.** `porMilesimos` multiplica inteiros e arredonda meio-para-cima
sobre o produto. Arredondar antes, ou acumular em float, faz a soma dos itens divergir do total —
e é a divergência que o aprovador enxerga.

**O mapa código→HTTP mora no domínio.** Espalhado pelos handlers, ele diverge, e a mesma recusa
responde 400 numa rota e 409 em outra.

## Testing Decisions

Um bom teste observa comportamento externo: entra um total e faixas, sai uma faixa ou uma recusa.
Nenhum teste deste bloco conhece o nome de uma variável interna, e nenhum verifica que uma função
chamou outra — isso congelaria a implementação em vez de proteger o comportamento.

**Este é o primeiro dos dois seams do projeto.** O seam de domínio cobre a regra que vale a nota,
sem banco e sem servidor. O segundo — Route Handler, no INC5 — cobre o que este não alcança: o
409 de corrida do ADR 0004 e o 403 de papel. A decisão de manter dois, em vez do seam único mais
alto, é de custo: quinze casos de arredondamento e limite passando por HTTP seriam lentos o
bastante para não serem escritos.

**Módulos testados:** todos os sete. `tipos` e `erros` indiretamente, pelo uso.

**Os casos, já verificados contra a implementação atual (23 passando):** entrada monetária em três
formatos e entrada inválida; arredondamento de 2,5 × R$ 3,33 = R$ 8,33; quantidade fracionária e
recusa de precisão excedente; limite inclusivo no valor exato; valor um centavo acima subindo de
faixa; teto estourado; obra sem faixa; faixa sem aprovador; ordem da cadeia preservada; aprovador
da vez; decisão fora de ordem; decisão por quem não está na cadeia; avanço da vez após aprovação;
aprovação da última etapa aprovando o pedido; rejeição encerrando a cadeia; decisão após conclusão;
rejeição sem motivo.

**Prior art:** não há. Esta suíte é a primeira do projeto e estabelece a forma — arranjo explícito
no corpo do caso, sem fixture compartilhada, sem mock.

## Out of Scope

Qualquer tela ou rota. Persistência: nenhum módulo deste bloco conhece Prisma. Sessão, papéis e a
matriz de permissão (INC2) — `podeDecidir` responde sobre a cadeia, não sobre o papel. Os testes
de Route Handler (INC5). O simulador de alçada ao vivo (EXTRA1), que reusa `resolverFaixa` sem
alterá-lo.

## Further Notes

`src/domain/schemas.ts` depende de Zod, ainda não instalado. É a única peça do bloco que falta, e
está isolada na task INC1.5 justamente por isso: o resto do domínio não tem dependência externa
nenhuma, e essa ausência é o que o mantém barato de testar.

Verificado neste repositório: `tsc --noEmit` limpo, e `grep` por `from 'next` em `src/domain/`
não retorna nada.
