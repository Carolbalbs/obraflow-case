#!/usr/bin/env bash
# Monta o cenário da Sprint 6 pelas rotas das Sprints 4 e 5. O seed ainda não traz faixa,
# fornecedor nem pedido — isso é da Sprint 8.
set -e
B=${B:-http://localhost:3000}
MARINA=cseedusuariomarina0001; AMANDA=cseedusuarioamanda0002; JOAO=cseedusuariojoao00003
CAIO=cseedusuariocaio00004; OBRA=cseedobraaurora000001; FORN=ctmpfornecedorbahia01

curl -s -o /dev/null -X POST "$B/api/obras/$OBRA/faixas" -H "Cookie: dokimos_sessao=$MARINA" \
  -H 'Content-Type: application/json' -d "{\"limiteCentavos\":1000000,\"aprovadores\":[\"$AMANDA\"]}"
curl -s -o /dev/null -X POST "$B/api/obras/$OBRA/faixas" -H "Cookie: dokimos_sessao=$MARINA" \
  -H 'Content-Type: application/json' -d "{\"limiteCentavos\":null,\"aprovadores\":[\"$AMANDA\",\"$JOAO\"]}"

submeter() {
  local id
  id=$(curl -s -X POST "$B/api/pedidos" -H "Cookie: dokimos_sessao=$CAIO" -H 'Content-Type: application/json' \
    -d "{\"obraId\":\"$OBRA\",\"fornecedorId\":\"$FORN\",\"observacoes\":\"$3\",\"itens\":[{\"descricao\":\"$4\",\"quantidade\":\"$2\",\"unidade\":\"sc\",\"precoUnitario\":\"$1\"}]}" \
    | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
  curl -s -o /dev/null -X POST "$B/api/pedidos/$id/submissao" -H "Cookie: dokimos_sessao=$CAIO"
  echo "$id"
}

ALTO=$(submeter "42,90" "300" "Reposicao para a concretagem da laje do 3o pavimento." "Cimento CP-II 50 kg")
BAIXO=$(submeter "42,90" "100" "Complemento de acabamento." "Cimento CP-II 50 kg")
REJ=$(submeter "684,00" "85" "Pedido para rejeitar." "Vergalhao CA-50 10 mm")
curl -s -o /dev/null -X POST "$B/api/pedidos" -H "Cookie: dokimos_sessao=$CAIO" -H 'Content-Type: application/json' -d "{\"obraId\":\"$OBRA\"}"
echo "alto(2 aprovadores)=$ALTO baixo(so Amanda)=$BAIXO rejeitavel=$REJ"
