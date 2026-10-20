// Temporário: cria o fornecedor que o seed ainda não tem (ele é da Sprint 8).
import { prisma } from '../../src/db/prisma'

async function main() {
  const acao = process.argv[2]
  if (acao === 'limpar') {
    await prisma.etapa.deleteMany({})
    await prisma.itemPedido.deleteMany({})
    await prisma.pedido.deleteMany({})
    await prisma.faixaAprovador.deleteMany({})
    await prisma.faixa.deleteMany({})
    await prisma.fornecedor.deleteMany({})
    console.log('limpo')
    return
  }
  const f = await prisma.fornecedor.upsert({
    where: { id: 'ctmpfornecedorbahia01' },
    update: {},
    create: { id: 'ctmpfornecedorbahia01', nome: 'Cimentos Bahia Ltda', documento: '12.345.678/0001-90' },
  })
  console.log(JSON.stringify(f))
}

main().finally(() => prisma.$disconnect())
