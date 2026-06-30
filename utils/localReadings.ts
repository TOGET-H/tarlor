import type { Reading } from '~/types/tarot'

const LOCAL_READINGS_KEY = 'digital-oracle:readings'
const MAX_LOCAL_READINGS = 80

type ReadingStatus = 'draft' | 'interpreted' | 'archived'

const statusValues = new Set<ReadingStatus>(['draft', 'interpreted', 'archived'])

function storage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function normalizeId(value: string | number | null | undefined) {
  const id = Number(value)
  return Number.isFinite(id) ? id : null
}

function isReading(value: unknown): value is Reading {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Partial<Reading>

  return (
    typeof item.id === 'number' &&
    typeof item.question === 'string' &&
    typeof item.spreadType === 'string' &&
    typeof item.status === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string' &&
    Array.isArray(item.cards) &&
    Array.isArray(item.interpretations)
  )
}

function newestFirst(readings: Reading[]) {
  return [...readings].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

function writeLocalReadings(readings: Reading[]) {
  const localStorage = storage()

  if (!localStorage) {
    return false
  }

  try {
    localStorage.setItem(
      LOCAL_READINGS_KEY,
      JSON.stringify(newestFirst(readings).slice(0, MAX_LOCAL_READINGS))
    )
    return true
  } catch {
    return false
  }
}

export function getLocalReadings() {
  const localStorage = storage()

  if (!localStorage) {
    return []
  }

  try {
    const raw = localStorage.getItem(LOCAL_READINGS_KEY)
    const parsed = raw ? JSON.parse(raw) : []

    return newestFirst(Array.isArray(parsed) ? parsed.filter(isReading) : [])
  } catch {
    return []
  }
}

export function getLocalReading(id: string | number | null | undefined) {
  const normalizedId = normalizeId(id)

  if (normalizedId === null) {
    return null
  }

  return getLocalReadings().find((reading) => reading.id === normalizedId) ?? null
}

export function saveLocalReading(reading: Reading) {
  const readings = getLocalReadings()
  const nextReadings = [
    reading,
    ...readings.filter((item) => item.id !== reading.id)
  ]

  return writeLocalReadings(nextReadings)
}

export function updateLocalReading(
  id: string | number | null | undefined,
  input: {
    question: string
    status: string
  }
) {
  const normalizedId = normalizeId(id)

  if (normalizedId === null) {
    return null
  }

  const readings = getLocalReadings()
  const existing = readings.find((reading) => reading.id === normalizedId)

  if (!existing) {
    return null
  }

  const updated: Reading = {
    ...existing,
    question: input.question.trim(),
    status: statusValues.has(input.status as ReadingStatus) ? input.status : 'interpreted',
    updatedAt: new Date().toISOString()
  }

  const saved = writeLocalReadings(
    readings.map((reading) => reading.id === normalizedId ? updated : reading)
  )

  return saved ? updated : null
}

export function deleteLocalReading(id: string | number | null | undefined) {
  const normalizedId = normalizeId(id)

  if (normalizedId === null) {
    return false
  }

  const readings = getLocalReadings()
  const nextReadings = readings.filter((reading) => reading.id !== normalizedId)

  if (nextReadings.length === readings.length) {
    return false
  }

  return writeLocalReadings(nextReadings)
}
