import { createError, getRouterParam, readBody } from 'h3'
import { optionalString, parseId, requiredString, validateArcana } from '../../utils/validation'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.tarotCard.findUnique({ where: { id } })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: '没有找到这张牌'
    })
  }

  return prisma.tarotCard.update({
    where: { id },
    data: {
      name: requiredString(body.name, 'name'),
      arcana: validateArcana(body.arcana),
      suit: optionalString(body.suit),
      number: optionalString(body.number),
      uprightMeaning: requiredString(body.uprightMeaning, 'uprightMeaning'),
      reversedMeaning: requiredString(body.reversedMeaning, 'reversedMeaning'),
      description: optionalString(body.description),
      imageUrl: optionalString(body.imageUrl)
    }
  })
})
