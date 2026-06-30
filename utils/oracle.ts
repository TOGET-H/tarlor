import { useState } from '#app'
import type { Reading } from '~/types/tarot'

export type OracleTheme = 'blue' | 'ember' | 'moss' | 'violet'
export type SpreadType = 'single' | 'past_present_future'

export const oracleThemes: Array<{
  key: OracleTheme
  name: string
  tone: string
}> = [
  { key: 'blue', name: '月光白', tone: '月辉镜面' },
  { key: 'ember', name: '粉晶', tone: '蔷薇回声' },
  { key: 'moss', name: '橄榄石', tone: '林间辉光' },
  { key: 'violet', name: '紫水晶', tone: '夜幕晶簇' }
]

export const spreadOptions: Array<{
  value: SpreadType
  label: string
  shortLabel: string
  description: string
}> = [
  {
    value: 'single',
    label: '单张牌',
    shortLabel: '单牌',
    description: '聚焦当下最重要的提示'
  },
  {
    value: 'past_present_future',
    label: '过去 / 现在 / 未来',
    shortLabel: '三牌',
    description: '观察事情从来源到走向的变化'
  }
]

export const positionLabels: Record<string, string> = {
  single: '核心提示',
  past: '过去',
  present: '现在',
  future: '未来'
}

export const orientationLabels: Record<string, string> = {
  upright: '正位',
  reversed: '逆位'
}

export const statusLabels: Record<string, string> = {
  draft: '草稿',
  interpreted: '已解读',
  archived: '已归档'
}

export function normalizeTheme(value: unknown): OracleTheme {
  return oracleThemes.some((theme) => theme.key === value)
    ? value as OracleTheme
    : 'blue'
}

export function useOracleTheme() {
  return useState<OracleTheme>('oracle-theme', () => 'blue')
}

export function normalizeSpread(value: unknown): SpreadType {
  return spreadOptions.some((spread) => spread.value === value)
    ? value as SpreadType
    : 'single'
}

export function meaningFor(entry: Reading['cards'][number]) {
  return entry.orientation === 'upright'
    ? entry.card.uprightMeaning
    : entry.card.reversedMeaning
}

export function latestInterpretation(reading: Reading) {
  return reading.interpretations[0]?.content || '这条记录暂时没有解读内容。'
}

export function formatReadingDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function cardSummary(reading: Reading) {
  return reading.cards
    .map((entry) => {
      const position = positionLabels[entry.position] ?? entry.position
      const orientation = orientationLabels[entry.orientation] ?? entry.orientation
      return `${position}：${entry.card.name}（${orientation}）`
    })
    .join(' · ')
}

export function tarotCardThumbnailUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return ''
  }

  const match = imageUrl.match(/^\/tarot\/cards\/([^/?#]+)\.[a-z0-9]+$/i)

  if (!match) {
    return imageUrl
  }

  return `/tarot/cards/thumbs/${match[1]}.webp`
}

function wrapText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  const lines: string[] = []
  let current = ''

  for (const char of normalized) {
    if ((current + char).length > maxLength) {
      lines.push(current)
      current = char
    } else {
      current += char
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2)

  context.beginPath()
  context.moveTo(x + r, y)
  context.lineTo(x + width - r, y)
  context.quadraticCurveTo(x + width, y, x + width, y + r)
  context.lineTo(x + width, y + height - r)
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  context.lineTo(x + r, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - r)
  context.lineTo(x, y + r)
  context.quadraticCurveTo(x, y, x + r, y)
  context.closePath()
}

function drawTextLines(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  startY: number,
  size: number,
  lineHeight: number,
  fill = '#f6f0e8'
) {
  context.fillStyle = fill
  context.font = `${size}px "Iowan Old Style", "Songti SC", "STSong", Georgia, serif`
  context.textBaseline = 'alphabetic'

  lines.forEach((line, index) => {
    context.fillText(line, x, startY + index * lineHeight)
  })
}

export async function downloadReadingImage(reading: Reading) {
  const width = 1200
  const height = 1700
  const cardLines = reading.cards.map((entry) => {
    const position = positionLabels[entry.position] ?? entry.position
    const orientation = orientationLabels[entry.orientation] ?? entry.orientation
    return `${position} / ${entry.card.name} / ${orientation} / ${meaningFor(entry)}`
  })
  const reportLines = wrapText(latestInterpretation(reading), 34).slice(0, 34)
  const questionLines = wrapText(reading.question, 24).slice(0, 3)
  const cardTextLines = cardLines.flatMap((line) => wrapText(line, 32)).slice(0, 18)
  const date = formatReadingDate(reading.createdAt)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('当前浏览器不支持 Canvas 导出')
  }

  const background = context.createRadialGradient(width * 0.5, height * 0.18, 60, width * 0.5, height * 0.18, width * 0.86)
  background.addColorStop(0, '#27354a')
  background.addColorStop(0.48, '#11151f')
  background.addColorStop(1, '#06070a')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  context.fillStyle = 'rgba(255, 255, 255, 0.34)'
  const exportStars: Array<[number, number, number]> = [
    [160, 180, 2],
    [360, 260, 1.5],
    [900, 170, 2],
    [1040, 380, 1.5],
    [240, 620, 1.2],
    [820, 690, 1.5],
    [1010, 1040, 1.2],
    [190, 1300, 1.5]
  ]

  exportStars.forEach(([x, y, radius]) => {
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  })

  roundedRect(context, 88, 86, 1024, 1528, 34)
  context.fillStyle = 'rgba(12, 16, 24, 0.82)'
  context.fill()
  context.strokeStyle = 'rgba(109, 127, 156, 0.35)'
  context.lineWidth = 2
  context.stroke()

  context.fillStyle = '#9fb7d7'
  context.font = '24px "Iowan Old Style", "Songti SC", "STSong", Georgia, serif'
  context.fillText('DIGITAL ORACLE', 120, 156)
  context.fillStyle = '#f6f0e8'
  context.font = '56px "Iowan Old Style", "Songti SC", "STSong", Georgia, serif'
  context.fillText('在静默中遇见答案', 120, 230)

  const line = context.createLinearGradient(120, 0, 1080, 0)
  line.addColorStop(0, 'rgba(159, 183, 215, 0)')
  line.addColorStop(0.5, 'rgba(159, 183, 215, 0.68)')
  line.addColorStop(1, 'rgba(159, 183, 215, 0)')
  context.fillStyle = line
  context.fillRect(120, 284, 960, 2)

  drawTextLines(context, ['问题'], 120, 360, 28, 40, '#9fb7d7')
  drawTextLines(context, questionLines, 120, 414, 40, 56)
  drawTextLines(context, ['牌面'], 120, 620, 28, 40, '#9fb7d7')
  drawTextLines(context, cardTextLines, 120, 680, 28, 42, '#e6edf9')
  drawTextLines(context, ['解读'], 120, 1050, 28, 40, '#9fb7d7')
  drawTextLines(context, reportLines, 120, 1110, 27, 40, '#f2eee8')
  drawTextLines(context, [`保存于 ${date} · Tarot Journal`], 120, 1550, 22, 32, '#9aa7bd')

  const png = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = png
  link.download = `oracle-reading-${reading.id}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
}
