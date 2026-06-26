import { getRouterParam } from 'h3'
import { parseId } from '../../utils/validation'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))

  await prisma.reading.delete({
    where: { id }
  })

  return { ok: true }
})
