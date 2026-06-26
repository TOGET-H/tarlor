import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  return prisma.tarotCard.findMany({
    orderBy: [{ arcana: 'asc' }, { id: 'asc' }]
  })
})
