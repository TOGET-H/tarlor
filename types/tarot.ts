export type TarotCard = {
  id: number
  name: string
  arcana: string
  suit: string | null
  number: string | null
  uprightMeaning: string
  reversedMeaning: string
  description: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export type ReadingCard = {
  id: number
  position: string
  orientation: string
  sortOrder: number
  card: TarotCard
}

export type Interpretation = {
  id: number
  provider: string
  content: string
  createdAt: string
}

export type Reading = {
  id: number
  question: string
  spreadType: string
  status: string
  createdAt: string
  updatedAt: string
  cards: ReadingCard[]
  interpretations: Interpretation[]
}
