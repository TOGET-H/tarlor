import recovered from './meditation-data.json'

// Recovered from the deployed DobFq1n7.js module (2026-10-01).
export type PracticeId = 'breath' | 'mantra' | 'focus' | 'body-scan' | 'thoughts'
export type Goal = 'concentrate' | 'relax' | 'observe'
export type Duration = 3 | 5 | 10
export type Stage = { key: string; startRatio: number; title: string; guidance: string }
export type Practice = {
  id: PracticeId; label: string; englishLabel: string
  category: 'focus' | 'awareness'; categoryLabel: string; goals: Goal[]
  description: string; preparation: string; visual: PracticeId
  mantra?: string; stages: Stage[]; durations: Duration[]
  bodyRegions?: Partial<Record<Duration, string[]>>
}
export const durations: Duration[] = [3, 5, 10]
export const practices = recovered.practices as Practice[]
export const goals = recovered.goals as { value: Goal; label: string; description: string }[]
export function normalizeDuration(value: unknown): Duration {
  const n = Number(Array.isArray(value) ? value[0] : value)
  return durations.includes(n as Duration) ? n as Duration : 5
}
export function findPractice(value: unknown) {
  const id = Array.isArray(value) ? value[0] : value
  return practices.find(practice => practice.id === id)
}
export function sessionTiming(input: { durationMinutes: Duration; startedAt: number | null; pausedAt: number | null; pausedDurationMs: number; now: number }) {
  const total = input.durationMinutes * 60000
  if (input.startedAt === null) return { elapsedMs: 0, remainingMs: total, progress: 0, complete: false }
  const elapsedMs = Math.min(total, Math.max(0, (input.pausedAt ?? input.now) - input.startedAt - input.pausedDurationMs))
  return { elapsedMs, remainingMs: Math.max(0, total - elapsedMs), progress: elapsedMs / total, complete: elapsedMs >= total }
}
export function currentStage(practice: Practice, elapsedMs: number, duration: Duration) {
  const ratio = Math.min(1, Math.max(0, elapsedMs / (duration * 60000)))
  let index = 0
  practice.stages.forEach((stage, i) => { if (ratio >= stage.startRatio) index = i })
  const stage = practice.stages[index]!
  const next = practice.stages[index + 1]
  const end = next?.startRatio ?? 1
  return { ...stage, index, progress: end === stage.startRatio ? 1 : Math.min(1, Math.max(0, (ratio - stage.startRatio) / (end - stage.startRatio))), nextTitle: next?.title }
}
export function currentBodyRegion(practice: Practice, duration: Duration, elapsedMs: number) {
  const regions = practice.bodyRegions?.[duration]
  if (!regions?.length) return 'whole'
  const ratio = Math.min(1, Math.max(0, elapsedMs / (duration * 60000)))
  if (ratio < .12 || ratio >= .82) return 'whole'
  return regions[Math.min(regions.length - 1, Math.floor((ratio - .12) / .7 * regions.length))] ?? 'whole'
}
export function formatRemaining(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}
