import { createError, readBody } from 'h3'
import { buildInterpretation } from '../../services/interpretation'
import { requiredString, validateSpreadType } from '../../utils/validation'
import { prisma } from '../../utils/prisma'
import { useAiGateway, aiHttpError } from '../../utils/ai'
import { AiError } from '../../ai/errors'

const spreadPositions = {
  single: ['single'],
  past_present_future: ['past', 'present', 'future']
} as const

type SpreadType = keyof typeof spreadPositions

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function randomOrientation() {
  return Math.random() > 0.5 ? 'upright' : 'reversed'
}

function createLocalReadingId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
  }
  const question = requiredString(body.question, 'question')
  const spreadType = validateSpreadType(body.spreadType) as SpreadType
  const positions = spreadPositions[spreadType]
  if (body.channel !== undefined && (typeof body.channel !== 'string' || !body.channel.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid AI channel' })
  }
  const channel = body.channel?.trim() as string | undefined
  const ai = useAiGateway(event)
  try { ai.selectChannel(channel) } catch (error) {
    if (error instanceof AiError) throw aiHttpError(error)
    throw error
  }

  const cards = await prisma.tarotCard.findMany()

  if (cards.length < positions.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `当前牌阵至少需要 ${positions.length} 张牌`
    })
  }

  const selectedCards = shuffle(cards).slice(0, positions.length)
  const drawnCards = selectedCards.map((card, index) => ({
    position: positions[index] ?? 'single',
    orientation: randomOrientation(),
    sortOrder: index,
    card
  }))

  const interpretation = await buildInterpretation(question, spreadType, drawnCards, { ai, channel }).catch(error => {
    if (error instanceof AiError) throw aiHttpError(error)
    throw error
  })
  const createdAt = new Date().toISOString()
  const readingId = createLocalReadingId()

  return {
    id: readingId,
    question,
    spreadType,
    status: 'interpreted',
    createdAt,
    updatedAt: createdAt,
    cards: drawnCards.map((entry, index) => ({
      id: readingId + index + 1,
      position: entry.position,
      orientation: entry.orientation,
      sortOrder: entry.sortOrder,
      card: entry.card
    })),
    interpretations: [
      {
        id: readingId + drawnCards.length + 1,
        ...interpretation,
        createdAt
      }
    ]
  }
})
