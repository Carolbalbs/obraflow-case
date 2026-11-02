# Checklist — mockups · front · back

Acompanhamento por frente. O backlog por incremento está em [jira/tasks.md](jira/tasks.md);
aqui a visão é por camada, para ver o que de cada artboard virou tela e rota.

---

## Mockups

Canvas: `claude.ai/artifact/YaiNTMMrDgGBtGFei6eCQo` — 12 artboards.
Nem todos entram no código: alguns são referência deliberada, e isso é decisão registrada, não
pendência.

| Artboard | Título | Destino |
|---|---|---|
| `Main` | 1 · Cadastro de pedido | implementar — Inc 4 |
| `Aprovacoes` | 2A · Aprovação (base) | implementar — Inc 5 |
| `AprovacoesC` | 2C · Overview do pedido | implementar — Inc 5 |
| `PedidoDetalhe` | 2C · Pedido completo | implementar — Inc 5 |
| `Alcadas` | 3 · Regras da alçada | implementar — Inc 3 |
| `Estados` | 4 · Estados e validações | implementar — Inc 6 |
| `Login` | 7 · Login (entrada e SSO) | implementar parcial — Inc 2, só modo demo; SSO fica no desenho |
| `TrocarConta` | 6 · Trocar de usuário | implementar — Inc 2 |
| `Perfis` | 8 · Perfis e multi-tenant | implementar parcial — Inc 2, só os quatro papéis; tenant fica no desenho (ADR 0006) |
| `AprovacoesB` | 2B · Aprovação ao vivo | extra E1 |
| `TempoReal` | 5 · Tempo real | referência — não implementar |
| `Empresa` | 9 · Empresa (cadastros) | **fora de escopo** — decidido; o enunciado dispensa |

- [x] Canvas lido e artboards classificados
- [ ] Tokens do `Perfis` conferidos contra `app/globals.css` ao construir cada tela
- [ ] Decisões de "fica no desenho" citadas no README, seção produção

### Lacunas — controles desenhados sem rota atrás

Levantados artboard a artboard; o inventário de handlers está no quadro `Eventos do front` do
canvas de diagramas (`claude.ai/artifact/4TRvKgswzUGqqzsH7P4YL9`). Cada item é uma decisão a
tomar **antes** de construir a tela, não durante. O efeito de cada
uma sobre os handlers está em [`specs/eventos-front.md`](specs/eventos-front.md).

- [x] **Valor mínimo da faixa** — *decidido:* o campo é **derivado e somente leitura**, exibindo
      o limite da faixa anterior + 1 centavo. O ADR 0002 fica de pé — sem coluna de mínimo, buraco
      e sobreposição seguem impossíveis por construção — e `alterarLimite(texto)` continua sendo
      handler único. Resta uma pendência: `Alcadas` ainda desenha os dois campos editáveis;
      corrigir o mockup ou ignorá-lo ao construir a tela 3.
- [ ] **Buscar pedido, obra ou fornecedor** — `Aprovacoes`, `AprovacoesB` e `TrocarConta`.
      `GET /api/pedidos` só prevê filtro por situação e obra. Decidir entre acrescentar o
      parâmetro de busca ou filtrar apenas o que já está carregado na tela.
- [ ] **Enviar sugestão a Carla** — `PedidoDetalhe`. Não há rota nem modelo de mensagem.
      Candidato a corte, com a decisão citada no README.
- [ ] **Pular por agora** — `AprovacoesC`. Nada no schema guarda "pulei este". Candidato a corte.
- [ ] **Cadastrar obra** — empty state de `Estados`. Só `GET /api/obras` está previsto. Decidir
      entre criar a rota de cadastro ou o empty state apontar para o seed.
- [ ] **Desfazer a troca de usuário** — `TrocarConta`. Exige guardar a sessão anterior.
- [ ] **Senha e SSO** — `Login`. Fora de escopo por decisão; o modo demo entra sem senha
      (ADR 0005). Citar na seção de produção do README.

---

## Back

### Domínio — `src/domain/`, sem import de `next/*`

- [ ] `dinheiro.ts` — centavos, milésimos, `totalItem`, formatação pt-BR
- [ ] `alcada.ts` — `resolverFaixa` (limite inclusivo, teto estourado, obra sem faixa)
- [ ] `alcada.ts` — `montarCadeia`
- [ ] `decisao.ts` — aprovador da vez, aprovação avança, rejeição encerra, motivo obrigatório
- [ ] `schemas.ts` — Zod por operação; rascunho permissivo × submetido estrito
- [ ] `erros.ts` — `VALIDACAO`, `SEM_REGRA_APLICAVEL`, `NAO_E_SUA_VEZ`, `CADEIA_CONCLUIDA`, `NAO_ENCONTRADO`, `SEM_PERMISSAO`
- [ ] Suíte do domínio verde (12–18 casos)

### Servidor — `src/server/`

- [ ] `sessao.ts` — **`lerSessao(req: Request)`**, nunca `cookies()` de `next/headers`
- [ ] `permissao.ts` — matriz dos quatro papéis
- [ ] `http.ts` — envelope `{ error: { code, message, fields? } }` e wrapper de rota

### Rotas — `app/api/`

- [ ] `POST`/`DELETE /api/sessao` — entrar e sair, atrás de `DEMO_MODE`
- [ ] `GET /api/usuarios` · `GET /api/obras` · `GET /api/fornecedores`
- [ ] `GET`/`POST /api/obras/:id/faixas`
- [ ] `PUT`/`DELETE /api/faixas/:id` — substituição total, aprovadores já ordenados
- [ ] `GET`/`POST /api/pedidos`
- [ ] `GET`/`PUT`/`DELETE /api/pedidos/:id` — PUT e DELETE só em rascunho
- [ ] `POST /api/pedidos/:id/submissao` — valida, resolve faixa, grava cadeia, numa transação
- [ ] `POST /api/pedidos/:id/decisoes` — UPDATE condicional, 409 em zero linhas

### Dados

- [x] `schema.prisma` com os oito modelos
- [x] Primeira migration aplicada
- [x] Cliente com driver adapter e singleton
- [x] Seed mínimo (3 obras)
- [ ] Seed completo — 8 pedidos em cada ponto do ciclo
- [ ] `docs/contrato-api.md` — escrito na abertura do Inc 3, derivado dos tipos do domínio

---

## Front

> Spec: [`specs/eventos-front.md`](specs/eventos-front.md) — inventário dos handlers por
> tela, a quádrupla dos hooks e o que é testado como função pura.

### Base

- [x] Next 16, TypeScript, App Router
- [x] Tailwind v4 com os tokens do ObraFlow
- [x] Inter e Lora carregadas
- [ ] Shell: cabeçalho com usuário, papel, trocar de usuário e construtora fixa
- [ ] Menu variando por papel (itens somem, não só desabilitam)

### Telas

- [ ] Entrada — lista de usuários do seed, sem senha
- [ ] Tela 3 · Alçadas — obra, faixas, aprovadores ordenados, criar/editar/remover
- [ ] Tela 1 · Cadastro — dados gerais, itens N, totalização, submissão
- [ ] Tela 2 · Aprovação — lista com filtros, detalhe, decisões, histórico

### Componentes

- [ ] Cadeia de aprovação (concluídas, atual, próximas; empilha em tela estreita)
- [ ] Editor de itens (adicionar, editar, remover, total não editável)
- [ ] Diálogo de rejeição com motivo obrigatório — shadcn
- [ ] Select de obra e fornecedor — shadcn
- [ ] Badge de situação do pedido

### Estados — exigidos pelo enunciado

- [ ] Loading em **toda** lista
- [ ] Empty state: sem obra, sem pedido, obra sem faixa
- [ ] Erro de API com "tentar de novo"
- [ ] Validação por campo, pelo mesmo schema do servidor
- [ ] Decisão indisponível sempre com explicação do motivo
- [ ] Responsivo de 390px; tabela de itens vira cartões abaixo de 768px

---

## Entrega

- [ ] `scripts/verificar.sh` — 409 fora de ordem, 409 duplicada, 403 sem permissão
- [ ] Screenshots das três telas
- [ ] README completo, com a tabela de o que cada usuário vê
- [ ] PR aberto com e-mail e telefone — **dia 31, não dia 1º**
