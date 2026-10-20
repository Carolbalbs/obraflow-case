// Temporário: põe Amanda como criadora do pedido, para provar que não há segregação de função.
import { prisma } from '../../src/db/prisma'
const id = Number(process.argv[2])
prisma.pedido
  .update({ where: { id }, data: { criadoPorId: process.argv[3] }, select: { id: true, criadoPorId: true } })
  .then((p) => console.log(JSON.stringify(p)))
  .finally(() => prisma.$disconnect())
