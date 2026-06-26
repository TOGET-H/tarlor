import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  return prisma.reading.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      cards: {
        orderBy: { sortOrder: 'asc' },
        include: { card: true }
      },
      interpretations: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })
})
