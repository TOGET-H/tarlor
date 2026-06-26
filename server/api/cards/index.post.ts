import { readBody } from 'h3'
import { optionalString, requiredString, validateArcana } from '../../utils/validation'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return prisma.tarotCard.create({
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
