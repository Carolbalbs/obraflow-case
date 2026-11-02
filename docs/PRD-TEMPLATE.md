# PRD — modelo

> **O que é.** Um PRD descreve o *problema* e o *resultado esperado*, nunca a implementação.
> Se uma frase deste documento só pode ser escrita por quem já sabe como o código vai ser, ela
> está no lugar errado — pertence a uma spec ou a um ADR.

## Como construir

O PRD não se escreve de uma vez. Ele é fruto de um laço de ida e volta:

| Turno | Quem | O quê |
|---|---|---|
| 1 | Você | Descreve o problema em texto corrido, sem estrutura. |
| 2 | IA | Faz perguntas — o que está ambíguo, o que falta, o que se contradiz. |
| 3 | Você | Refina os goals: o que é mensurável, o que é verificável. |
| 4 | IA | Atualiza o `PRD.md`. |

Repete-se até que **nenhuma pergunta restante mude o escopo**. Só então começa o código.

Regra de parada: se a IA ainda pergunta e a resposta muda o que será construído, o PRD não está
pronto. Se as perguntas restantes são de implementação, ele está.

---

## 1. Problema — o que está errado

Qual é a situação atual, para quem ela dói, e qual é o custo de não resolver.

- **Contexto:** como as coisas funcionam hoje.
- **Dor:** o que especificamente falha, e para quem.
- **Custo de não fazer:** o que continua acontecendo se nada mudar.

> Teste: a seção descreve algo que existe *antes* de qualquer solução? Se ela menciona uma tela,
> um endpoint ou um banco, não é problema — é solução disfarçada.

---

## 2. Goals — metas mensuráveis e verificáveis

Cada goal é uma frase com um critério que pode ser conferido por alguém que não escreveu o
código.

| # | Goal | Como se verifica |
|---|---|---|
| G1 | *(o resultado esperado)* | *(a observação que prova o resultado)* |
| G2 | | |
| G3 | | |

> Teste: dá para olhar o sistema pronto e dizer "sim" ou "não" para cada linha? "Ser intuitivo"
> falha. "Criar um pedido de 3 itens em menos de 4 campos obrigatórios" passa.

---

## 3. Fora de escopo — o que **não** será feito

Lista explícita, cada item com o motivo. Escopo negativo é o que impede a conversa de se
alargar sozinha durante a implementação.

| Item | Por que fica de fora |
|---|---|
| | |
| | |

> Teste: cada linha responde "por que não", não só "não". Sem o motivo, a lista vira palpite e
> alguém vai reabrir o assunto na metade do trabalho.

---

## 4. User stories — cenários do usuário final

Uma história por cenário real, com critérios de aceite no formato dado/quando/então.

### US-1 — *(título curto)*

**Como** *(papel)*, **quero** *(ação)*, **para** *(resultado)*.

**Aceite:**
- Dado *(estado inicial)*, quando *(ação)*, então *(resultado observável)*.
- Dado *(caso de borda)*, quando *(ação)*, então *(recusa com mensagem X)*.

### US-2 — *(…)*

> Teste: toda história tem pelo menos um aceite que descreve a **falha**. Histórias só com o
> caminho feliz escondem as decisões difíceis.

---

## 5. Contexto técnico — stack, padrões, decisões

O mínimo que alguém precisa saber antes de abrir o editor. Decisões com consequência moram em
ADRs; aqui fica o ponteiro.

- **Stack:** *(linguagem, framework, banco, testes)*
- **Padrões:** *(convenções de código, nomenclatura, estrutura de pastas)*
- **Restrições:** *(prazo, ambiente, o que não pode ser usado)*
- **Decisões registradas:** *(links para ADRs)*

> Teste: isto é contexto ou é projeto? Se a seção explica *como* algo será implementado, ela
> pertence a uma spec.
