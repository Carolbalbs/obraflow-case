/**
 * Os fornecedores, para quem precisa escolher um.
 *
 * Só listagem: cadastro de fornecedor está fora de escopo no PRD, e o seed é quem os cria.
 * Qualquer papel lê; sem sessão, 403 SEM_PERMISSAO, como em toda rota do projeto.
 *
 * A forma é a mesma que `app/pedidos/novo/page.tsx` entrega ao formulário: `id`, `nome` e
 * `documento` (nulo quando não informado), por nome.
 */

import { prisma } from '@/src/db/prisma'
import { exigirSessao, ok, rota } from '@/src/server/http'

export const GET = rota(async (req) => {
  await exigirSessao(req)

  const fornecedores = await prisma.fornecedor.findMany({
    select: { id: true, nome: true, documento: true },
    orderBy: { nome: 'asc' },
  })

  return ok(fornecedores)
})
