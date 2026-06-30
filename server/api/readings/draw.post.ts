import { createError, readBody } from 'h3'
import { buildMockInterpretation } from '../../services/interpretation'
import { requiredString, validateSpreadType } from '../../utils/validation'
import { prisma } from '../../utils/prisma'

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
  const question = requiredString(body.question, 'question')
  const spreadType = validateSpreadType(body.spreadType) as SpreadType
  const positions = spreadPositions[spreadType]

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

  const interpretation = buildMockInterpretation(question, spreadType, drawnCards)
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
        provider: 'mock',
        content: interpretation,
        createdAt
      }
    ]
  }
})
