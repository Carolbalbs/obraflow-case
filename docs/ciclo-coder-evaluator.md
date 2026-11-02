# Ciclo coder–evaluator

Diretriz de como o desenvolvimento agêntico deste projeto roda. Vale para qualquer sprint: um
agente implementa, outro julga, e só o que passa vira progresso.

O ciclo existe porque um agente sozinho é um péssimo juiz do próprio trabalho. Ele avalia o que
pretendeu fazer, não o que fez. Separar implementação de validação devolve o sinal que falta.

---

## O ciclo

```
INPUT ──▶ CODER ──▶ EVALUATOR ──PASS──▶ PROGRESS ──▶ próxima sprint
            ▲           │                               (contexto zerado)
            └───FAIL────┘
```

Quatro etapas, repetidas para cada sprint em sequência. O retorno do evaluator para o coder é
correção dentro do mesmo ciclo — não conta como sprint nova.

### 1. Input

O agente recebe três entradas e nada além delas:

| Arquivo | Papel |
| --- | --- |
| `SPEC.md` | O produto inteiro: domínio, contratos, regras de negócio. **Gerado de [`SPEC.json`](SPEC.json) por `npm run spec:md` — fonte de verdade é o JSON; nunca edite o `.md` à mão** |
| `sprints/NN-slug/` | O recorte desta rodada: `sprint.json` e um arquivo por feature, cada um com seus critérios de aceite |
| `PROGRESS.md` | O estado deixado pela sprint anterior |

O recorte é intencional. Contexto menor significa menos deriva, e obriga a escrever no documento
tudo o que importa. O que não estiver nesses três arquivos não existe para o agente.

### 2. Coder

Implementa as features da sprint — só as da sprint — e roda as verificações locais antes de
entregar:

```bash
npx tsc --noEmit
npm run lint
npm test
```

Erro de tipo, lint sujo ou teste quebrado nunca chegam ao evaluator. Esse portão é mecânico e
barato; gastar o julgamento do evaluator nele é desperdício.

Entrega: o diff, a saída das verificações e uma nota curta do que mudou e por quê.

### 3. Evaluator

Percorre o checklist da sprint, um critério por vez, e emite veredito binário.

**Não reescreve código.** Quando reprova, descreve qual critério falhou e com qual evidência,
para a correção ser dirigida em vez de adivinhada.

- `PASS` — todos os critérios atendidos, segue para o registro.
- `FAIL` — volta ao coder com critério, evidência e o que falta.

Formato do FAIL:

```
FAIL  critério 5 — erro de validação não retorna 422
      evidência: POST /obras com data inválida → 500
      falta: mapear ZodError para o código de erro do enum
```

### 4. Progress

Fecha o ciclo escrevendo o estado para quem vem depois. Como a próxima sprint roda com contexto
zerado, o `PROGRESS.md` é a única ponte entre as rodadas. Registra:

- o que ficou pronto nesta sprint;
- decisões técnicas e o motivo delas;
- pendências e dívidas conhecidas;
- ponto de partida da próxima sprint.

Progresso que não está escrito aqui está perdido.

---

## Onde a spec mora

Uma `SPEC.json` com todas as features vira um arquivo de milhares de linhas que ninguém relê — e
critério que ninguém relê não é critério, é intenção. O índice continua único; o conteúdo se
espalha em arquivos pequenos:

```
docs/spec/
  SPEC.json                        índice: meta, coder_agents, data_models, file_structure, sprints[]
  sprints/
    02-backend-core/
      sprint.json                  entregável, risco, pré-requisito, definition_of_done
      features/
        01-post-auth-login.json    7 critérios — uma tela de leitura
        02-guard-de-rota.json
        03-refresh-token.json
    03-frontend/
      ...
```

No índice fica o que é global e compartilhado entre sprints: modelos de dados, árvore de
arquivos, agentes e a ordem com as dependências. Cada entrada de sprint aponta para a sua pasta
pelo campo `dir`. O coder recebe a pasta da sprint; o evaluator abre **um arquivo de feature por
vez** — só o da feature que está julgando.

### A entrada no índice

```json
{
  "id": "sprint-002",
  "index": 2,
  "name": "Backend core",
  "dir": "sprints/02-backend-core",
  "entregavel": "login e sessão funcionando ponta a ponta",
  "risco": "medio",
  "pre_requisito": "sprint-001",
  "coder_agent_id": "agente-node",
  "stack": ["next", "prisma", "zod"]
}
```

Sem `features` aqui: elas moram nos arquivos, e `sprint.json` lista a ordem.

### O arquivo de feature

```json
{
  "id": "feat-003",
  "categoria": "api_endpoint",
  "name": "POST /auth/login",
  "steps": ["valida payload", "confere hash", "emite JWT de 15 min"],
  "edge_cases": ["usuário inexistente", "senha errada 5x seguidas"],
  "out_of_scope": ["refresh token", "SSO"],
  "acceptance_criteria": [
    { "id": "ac-1", "txt": "credencial válida retorna 200 com token JWT" },
    { "id": "ac-2", "txt": "email desconhecido retorna 401, não 404" },
    { "id": "ac-3", "txt": "payload sem senha retorna 422 com código do enum" }
  ]
}
```

### Granularidade do critério

- **5 a 12 critérios por feature.** Acima disso não é feature, é sprint disfarçada. Se o arquivo
  não cabe numa tela, divida a feature antes de escrever código.
- **Um critério, uma afirmação.** Se tem "e" ou "além disso", são dois. Critério composto só
  pode falhar inteiro, e o FAIL sai genérico demais para corrigir.
- **Entrada visível, saída visível.** Escreva o gatilho e o que se vê. Quem audita não deve
  precisar abrir o código para decidir se passou.
- **Id estável.** `feat-003.ac-2` aparece no FAIL, no commit e no `PROGRESS.md`. Sem id, o
  histórico não diz o que foi reprovado duas vezes.
- **Diff pequeno.** Com um arquivo por feature, mudar um critério produz três linhas de diff —
  revisável. No arquivo único, some no meio de duas mil.
- **Índice validado.** Fatiar cria risco de referência quebrada: `npm run spec:check` confere que
  toda sprint do índice tem pasta e que todo arquivo de feature é referenciado por um
  `sprint.json`.

O mesmo requisito, antes e depois:

```diff
- "Login funciona corretamente com validação de email e senha, tratando
-  erros e desabilitando o botão durante o request"

+ { "id": "ac-1", "txt": "campos email e senha renderizam" }
+ { "id": "ac-2", "txt": "email sem @ mostra 'Email inválido'" }
+ { "id": "ac-3", "txt": "senha vazia mostra 'Senha obrigatória'" }
+ { "id": "ac-4", "txt": "submit fica disabled durante o request" }
+ { "id": "ac-5", "txt": "401 mostra 'Credenciais inválidas'" }
```

O primeiro só permite o FAIL `"não funciona corretamente"`. O segundo permite
`"feat-003.ac-4 — botão segue clicável durante o request"`, que diz onde mexer.

---

## Regras que sustentam o loop

**Critério antes do código.** O evaluator não inventa o que cobrar: ele lê os critérios que já
estavam na sprint. Critério vago vira PASS fácil — escreva em forma verificável. "Tratamento de
erro adequado" não é critério; "entrada inválida retorna 422 com código do enum de erros" é.

**Quem julga não corrige.** Se o evaluator conserta o que encontrou, some o sinal de qualidade
do coder e o FAIL deixa de medir qualquer coisa.

**Portão mecânico primeiro.** `tsc`, lint e testes rodam antes do julgamento. O evaluator gasta
atenção no que só leitura pega: regra de negócio, borda, contrato.

**Contexto zerado entre sprints.** Cada sprint começa limpa. Por isso o `PROGRESS.md` registra
decisões e pendências, não só tarefas feitas.

**Limite de tentativas.** Depois de duas ou três voltas no mesmo critério, o problema costuma
estar no enunciado, não na implementação. Pare o loop e reescreva a sprint.

**Escopo fechado.** Uma sprint, uma camada. Sprint grande produz diff ilegível, FAIL genérico e
feedback que não corrige nada.

---

## Sequência de sprints

A ordem é a das dependências, não a das telas:

1. **Fundação** — estrutura, tooling, schema, contratos compartilhados. Tudo que as seguintes
   assumem como dado; errado aqui, todo FAIL posterior vira ruído.
2. **Backend core** — casos de uso, endpoints com validação, persistência, testes de caminho
   feliz e borda.
3. **Frontend** — telas sobre contratos já fechados; estados de carregando, vazio e erro.
4. **Integração** — fluxo ponta a ponta, falha entre camadas, build de produção.

---

## Modelos

### sprints/NN-slug/sprint.json

```json
{
  "id": "sprint-00N",
  "name": "<nome>",
  "entregavel": "<o que dá para demonstrar ao fim>",
  "risco": "baixo | medio | alto",
  "pre_requisito": "<id da sprint anterior ou null>",
  "out_of_scope": ["<o que explicitamente não se faz agora>"],
  "features": ["01-<slug>.json", "02-<slug>.json"],
  "definition_of_done": ["tsc sem erro", "lint limpo", "suíte verde"]
}
```

### sprints/NN-slug/features/NN-slug.json

```json
{
  "id": "feat-00N",
  "categoria": "api_endpoint | frontend | dominio | infra",
  "name": "<capacidade nova, em palavra de usuário>",
  "steps": ["<ação concreta>"],
  "edge_cases": ["<borda>"],
  "out_of_scope": ["<o que esta feature não resolve>"],
  "acceptance_criteria": [
    { "id": "ac-1", "txt": "<afirmação única e observável>" }
  ]
}
```

### PROGRESS.md

```md
# Progresso

## Sprint N · <nome> — PASS em <data>

### Pronto
- <item>

### Decisões
- <decisão> — porque <motivo>

### Pendências
- <o que ficou em aberto e onde>

### Próxima sprint começa em
<arquivo/estado de partida>
```

---

## Instruções para os agentes

**Coder:** "Leia `SPEC.json`, a pasta `sprints/NN-slug/` (o `sprint.json` e todos os arquivos de
`features/`) e `PROGRESS.md`. Implemente apenas o escopo da sprint, uma feature por vez. Rode
tsc, lint e testes até passarem. Entregue o diff, a saída das verificações e uma nota do que
mudou. Não altere critérios de aceite."

**Evaluator:** "Abra um arquivo de `features/` por vez e avalie os `acceptance_criteria` dele um
a um. Responda PASS ou FAIL citando o id do critério (`feat-003.ac-4`), a evidência e o que
falta. Não escreva nem corrija código."

---

Versão interativa deste fluxo: <https://claude.ai/artifact/7cJ1YyefS2KFAMuHuFypk6> (privado).
