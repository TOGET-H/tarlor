import { createError, getRouterParam } from 'h3'
import { parseId } from '../../utils/validation'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))

  const usedCount = await prisma.readingCard.count({
    where: { cardId: id }
  })

  if (usedCount > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: '这张牌已被抽牌记录使用，不能删除'
    })
  }

  await prisma.tarotCard.delete({
    where: { id }
  })

  return { ok: true }
})
