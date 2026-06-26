import { createError, getRouterParam } from 'h3'
import { parseId } from '../../utils/validation'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))
  const reading = await prisma.reading.findUnique({
    where: { id },
    include: {
      cards: {
        orderBy: { sortOrder: 'asc' },
        include: { card: true }
      },
      interpretations: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!reading) {
    throw createError({
      statusCode: 404,
      statusMessage: '没有找到这条记录'
    })
  }

  return reading
})
