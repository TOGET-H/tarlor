import { createError, getRouterParam, readBody } from 'h3'
import { parseId, requiredString, validateReadingStatus } from '../../utils/validation'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.reading.findUnique({ where: { id } })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: '没有找到这条记录'
    })
  }

  return prisma.reading.update({
    where: { id },
    data: {
      question: requiredString(body.question, 'question'),
      status: validateReadingStatus(body.status)
    },
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
})
