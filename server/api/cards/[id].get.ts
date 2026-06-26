import { createError, getRouterParam } from 'h3'
import { parseId } from '../../utils/validation'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))
  const card = await prisma.tarotCard.findUnique({ where: { id } })

  if (!card) {
    throw createError({
      statusCode: 404,
      statusMessage: '没有找到这张牌'
    })
  }

  return card
})
