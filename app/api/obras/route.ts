/**
 * As obras, para quem precisa escolher uma.
 *
 * Só listagem: cadastro de obra está fora de escopo no PRD, e o seed é quem as cria. Qualquer
 * papel lê — obra não é dado sensível, e é o que a Tela 1 e a Tela 3 oferecem no seletor. Sem
 * sessão, 403 SEM_PERMISSAO, como em toda rota do projeto.
 *
 * A forma é a mesma que `app/pedidos/novo/page.tsx` entrega ao formulário: `id`, `nome`,
 * `cidade`, por nome.
 */

import { prisma } from '@/src/db/prisma'
import { exigirSessao, ok, rota } from '@/src/server/http'

export const GET = rota(async (req) => {
  await exigirSessao(req)

  const obras = await prisma.obra.findMany({
    select: { id: true, nome: true, cidade: true },
    orderBy: { nome: 'asc' },
  })

  return ok(obras)
})
