# SPEC — anatomia e modelo

> **O que é.** O PRD descreve o *problema*. A SPEC descreve a *execução*: em que ordem, o que
> cada pedaço entrega e como se prova que entregou. Se uma frase daqui não puder ser conferida
> por quem não escreveu o código, ela pertence ao PRD, não à spec.

Modelo preenchível: [`SPEC-TEMPLATE.json`](SPEC-TEMPLATE.json) — copie para `docs/SPEC.json`.

## Como funciona

| # | Quem | O quê |
|---|---|---|
| 1 | Você | `PRD.md` aprovada — nenhuma pergunta restante muda o escopo. |
| 2 | IA | Gera `SPEC.json` a partir do PRD, seguindo as 8 seções abaixo. |
| 3 | IA | Revisão com o [SPEC Reviewer](../specreviewerlionlab.md): gaps técnicos resolvidos sozinho, gaps de negócio perguntados um a um. |
| 4 | Você | **Valida as sprints** — ordem, risco, pré-requisito, critérios de aceite. |
| 5 | IA | Executa *uma feature por vez*, fechando os `acceptance_criteria` dela. |

Regra de parada do passo 4: se duas sprints podem ser feitas em qualquer ordem sem quebrar
nada, `pre_requisito` está incompleto ou a divisão está errada.

---

## As 8 seções

### 1. `sprints` — divisão do trabalho em ciclos
Array ordenado por `index`. Cada sprint tem `entregavel` conferível, `risco`, `pre_requisito` e
`definition_of_done`.

> Teste: dá para entregar a sprint e parar ali, com o sistema funcionando? Se não, ela está
> cortada no lugar errado.

### 2. `features` — o que cada sprint entrega
Dentro da sprint. Uma feature é uma capacidade nova do ponto de vista de quem usa, com
`steps` (as ações concretas), `edge_cases` e `out_of_scope` explícitos. A `categoria` não é
decoração: é por ela que o reviewer aplica o auto-fill (um `api_endpoint` ganha status codes e
payload limit; um `frontend` ganha loading, empty e error state).

> Teste: a `description` usa palavra de usuário; os `steps` usam palavra de execução.

### 3. `acceptance_criteria` — **como validar** *(o coração da spec)*
Lista de frases verificáveis dentro da feature: o caminho feliz, cada validação com o **texto
exato** da mensagem, o estado dos controles durante a requisição e cada erro por código. Todo
critério de erro ou limite vale mais que três de caminho feliz.

> Teste: dois desenvolvedores leem o mesmo critério e escrevem o mesmo teste. Se diz
> "funciona corretamente", o critério não existe.

### 4. `api_spec` — endpoints, métodos, payloads
Dentro da feature que o expõe. Método, rota, autorização, corpo com regras de validação,
**todas** as respostas de erro, timeout, limite de payload e efeitos colaterais.

> Teste: o front consegue ser escrito só com esta seção, sem perguntar nada.

### 5. `data_models` — **schemas e relações**
Global, no topo — modelo é compartilhado entre sprints. Campos com tipo, obrigatoriedade e
unidade; relações com `on_delete`; e `invariants`, as regras que nenhuma linha pode violar.

> Teste: a seção traduz direto para `schema.prisma` sem decisão nova pelo caminho.

### 6. `stack` — tecnologias e dependências
Por sprint (`"stack": ["react", "fastapi", "jwt"]`): é o que o agente daquele ciclo tem
permissão de usar. Tecnologia que aparece no código sem estar na stack da sprint é escopo
vazando.

### 7. `coder_agent_id` — quem executa
**Um agente por sprint.** A sprint aponta para um id de `coder_agents`, que define papel,
modelo e regras. Sprints de front e de back são sprints diferentes, com agentes diferentes.

### 8. `file_structure` — **árvore de arquivos**
Global. O destino de cada coisa, decidido antes. Arquivo criado fora dela exige atualizar a
spec no mesmo commit.

> Teste: a árvore responde "onde isso mora?" sem debate — é o que impede o projeto de criar
> três lugares para a mesma responsabilidade.

---

## Rastreabilidade

Os ids amarram tudo: `sprint → coder_agent_id`, `feature → models / files / tests`,
`feature.depends_on → outra feature`. Toda feature tem ao menos um `acceptance_criteria`; todo
endpoint pertence a uma feature; todo modelo citado existe em `data_models`. Um id órfão é
trabalho que ninguém pediu ou entrega que ninguém vai conferir.
