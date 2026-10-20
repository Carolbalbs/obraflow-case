# INC0 · Esqueleto — spec master

## Problem Statement

Quem vai construir o Dokimos não tem onde construir. Não existe aplicação que suba, não existe
banco que responda, não existe tela que prove que as duas coisas se falam. Cada decisão tomada
daqui para frente — a regra de alçada, a cadeia, a decisão — precisa de um lugar onde ser
exercitada, e esse lugar precisa existir antes, não depois.

O risco específico não é "falta o esqueleto". É que o esqueleto errado custa caro tarde: dinheiro
em ponto flutuante descoberto no INC4 obriga a refazer migration, seed e domínio juntos; um
cliente Prisma sem singleton só aparece como vazamento de conexão depois de uma hora de
desenvolvimento com HMR; um tema Tailwind improvisado obriga a reescrever cor por cor em sete
telas.

## Solution

Um projeto Next que sobe, lê do banco e mostra na tela, com todas as decisões estruturais já
tomadas e gravadas no schema — não um projeto mínimo a ser corrigido depois.

Ao fim do INC0 a pessoa roda `npm run dev` e vê as obras do seed renderizadas com a tipografia e a
cor de marca do ObraFlow. Nada mais. Mas o que está por baixo já é definitivo: oito modelos,
dinheiro em centavos, quantidade em milésimos, snapshot da faixa reservado no pedido.

## User Stories

1. Como desenvolvedora do case, quero clonar o repositório e rodar um único comando de instalação, para que começar a trabalhar não dependa de conhecimento não escrito.
2. Como desenvolvedora, quero que `npm run dev` suba sem nenhum erro no console, para que qualquer erro que eu veja depois seja meu e não herdado.
3. Como desenvolvedora, quero o App Router do Next, para que as rotas de API e as telas convivam num projeto só, como o enunciado pede.
4. Como desenvolvedora, quero TypeScript estrito desde a primeira linha, para que erro de tipo apareça ao escrever e não ao executar.
5. Como desenvolvedora, quero que a aplicação viva na raiz do fork sem `src-dir`, para que o diretório `site/` do material original continue intocado e comparável.
6. Como avaliador, quero que o projeto use a identidade visual do ObraFlow, para que eu reconheça a entrega como daquele produto e não como um template genérico.
7. Como desenvolvedora, quero os tokens de cor, superfície e tipografia declarados num lugar só, para que eu nunca escolha um hexadecimal no meio de um componente.
8. Como desenvolvedora, quero as fontes Inter e Lora carregadas como o site original carrega, para que o eyebrow em Lora itálico apareça igual ao desenho.
9. Como desenvolvedora, quero o schema Prisma completo já na primeira migration, para que o domínio do INC1 seja escrito contra tabelas reais e não contra uma intenção.
10. Como desenvolvedora, quero todo valor monetário gravado como inteiro em centavos, para que nenhum arredondamento de ponto flutuante participe de um total que alguém vai aprovar.
11. Como desenvolvedora, quero quantidade gravada em milésimos, para que "2,5 kg" seja 2500 e o cálculo de total de item permaneça inteiro de ponta a ponta.
12. Como desenvolvedora, quero que o pedido já tenha colunas para o snapshot da faixa, para que o ADR 0001 seja estrutural e não um cuidado a lembrar no INC4.
13. Como desenvolvedora, quero que a etapa carregue a própria decisão, para que o UPDATE condicional do ADR 0004 tenha um alvo único e óbvio.
14. Como desenvolvedora, quero `@@unique([pedidoId, ordem])` na etapa e no item, para que duplicata de posição seja impossível por construção e não por validação.
15. Como desenvolvedora, quero um cliente Prisma singleton, para que o recarregamento a quente do Next não abra uma conexão nova a cada salvamento.
16. Como desenvolvedora, quero o driver adapter configurado em `prisma.config.ts`, para que o Prisma 7 funcione sem eu descobrir a exigência no meio do INC3.
17. Como desenvolvedora, quero um seed mínimo com obras, para que a primeira página tenha o que mostrar antes de existir qualquer formulário.
18. Como desenvolvedora, quero `npm run db:reset`, para que voltar ao estado limpo seja um comando e não um ritual.
19. Como desenvolvedora, quero `npm run seed` imprimindo a contagem do que inseriu, para que o sucesso seja visível e não presumido.
20. Como avaliador, quero ver uma página lendo do banco já no primeiro incremento, para que eu saiba que a integração existe antes das telas.

## Implementation Decisions

**Aplicação na raiz, `site/` intocado.** O projeto Next ocupa a raiz do fork, sem `src-dir`. `app/`
guarda rotas e telas; `src/` guarda o que não é Next — domínio, servidor, acesso a dados. O
diretório `site/` do material original permanece como está, e é dele que saem os tokens visuais.

**Oito modelos na primeira migration.** `Usuario`, `Obra`, `Fornecedor`, `Faixa`,
`FaixaAprovador`, `Pedido`, `ItemPedido`, `Etapa`. Nada é adicionado depois: migration posterior
neste case é sinal de decisão que deveria ter sido tomada aqui.

**Dinheiro e quantidade são inteiros.** Dinheiro em centavos (`Int`), quantidade em milésimos
(`Int`). O total de item é `round(quantidadeMilesimos * precoUnitarioCentavos / 1000)`, calculado
no domínio e persistido. Nenhum `Float` no schema.

**SQLite não tem enum.** Campos de domínio fechado — `papel`, `situacao` do pedido, `situacao` da
etapa — são `String` validada no domínio. A lista fechada mora em `src/domain/`, não no banco.

**O pedido carrega o snapshot da faixa.** `faixaId`, `faixaLimiteCentavos` e `faixaSemTeto` são
colunas do pedido, preenchidas na submissão. `faixaId` tem `onDelete: SetNull`: apagar a faixa não
apaga a história do pedido, e os dois campos denormalizados sobrevivem à exclusão. Isto implementa
o ADR 0001 no nível do schema.

**A faixa guarda só o limite superior.** `limiteCentavos` é `Int?`; nulo significa faixa aberta.
Não existe coluna de mínimo, e a ausência é a invariante do ADR 0002: buraco e sobreposição entre
faixas deixam de ser representáveis.

**A decisão vive na etapa.** `Etapa.situacao`, `decididoEm` e `motivo` ficam na própria posição da
cadeia. Não há tabela separada de decisões: o histórico é a leitura ordenada das etapas. Isso dá
ao ADR 0004 um alvo único para o UPDATE condicional.

**Identificador do pedido é `Int` autoincremento.** O pedido é citado por humanos como "#1002";
cuid não serve. Todas as outras entidades usam cuid.

**Exclusões são explícitas.** `Cascade` onde a parte não existe sem o todo (faixa→aprovadores,
pedido→itens, pedido→etapas, obra→faixas). `Restrict` onde apagar destruiria história (usuário que
decidiu, obra com pedido, fornecedor com pedido).

**Cliente Prisma singleton com driver adapter.** Prisma 7 exige `prisma.config.ts` e adapter
(`@prisma/adapter-better-sqlite3`). O cliente é memoizado em `globalThis` fora de produção, senão
o HMR abre uma conexão por recarga.

**Tema por tokens, não por classe solta.** Tailwind v4 com `@theme` apontando para os valores de
`site/assets/css/obraflow.css`: rampa de marca, rampa neutra, superfícies, Inter e Lora.

## Testing Decisions

Um bom teste observa comportamento externo: o que o sistema devolve a quem o usa, não como chegou
lá. Teste que conhece o nome de uma variável interna quebra quando o código melhora.

**O INC0 não tem teste automatizado, e isso é deliberado.** O que ele entrega — um projeto que
sobe, uma migration que aplica, um seed que insere — é verificado por execução, não por asserção:
teste de que `prisma migrate dev` funciona é o próprio `prisma migrate dev`. Testar aqui seria
testar o Next e o Prisma, não o Dokimos.

A verificação do incremento é operacional e cada task declara a sua: `npm run dev` sem erro de
console, `prisma migrate dev` aplicando limpo, `npm run seed` imprimindo contagem, página
server-side renderizando dado do banco.

**O que o INC0 precisa garantir é testabilidade futura, não teste presente.** Duas decisões aqui
existem para os seams do INC1 e do INC5: domínio em `src/domain/` sem nenhum import de `next/*`
(seam de função pura), e acesso a dados isolado em `src/db/` (para o seam de handler não precisar
de servidor). Quebrar qualquer uma inviabiliza o teste depois.

Prior art: não há ainda. O INC1 estabelece a primeira — a suíte de domínio no Vitest — e é ela que
as demais seguem.

## Out of Scope

Qualquer tela além da página de prova. Autenticação, sessão e papéis (INC2). Qualquer rota em
`app/api/*` (INC3 em diante). O domínio e seus testes (INC1). O seed completo com os oito pedidos
posicionados no ciclo (INC7) — aqui o seed é mínimo e existe só para a página ter o que ler.
Responsividade, estados de carregamento e erro (INC6).

## Further Notes

Prisma fica pinado em 7.10.1: o dist-tag `latest` está em release candidate e instalar sem pin
traz uma versão que muda de comportamento no meio da semana.

O INC0 já está concluído neste repositório — migration `20261029092421_inicial` aplicada, schema
com os oito modelos, `src/db/prisma.ts` e `prisma/seed.ts` presentes. Esta spec documenta as
decisões que ele fixou, porque são elas que os incrementos seguintes herdam e não podem renegociar
sem custo de migration.
