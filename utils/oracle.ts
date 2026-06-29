import type { Reading } from '~/types/tarot'

export type OracleTheme = 'blue' | 'ember' | 'moss' | 'violet'
export type SpreadType = 'single' | 'past_present_future'

export const oracleThemes: Array<{
  key: OracleTheme
  name: string
  tone: string
}> = [
  { key: 'blue', name: '蓝灰', tone: '静默星尘' },
  { key: 'ember', name: '红棕', tone: '余烬低语' },
  { key: 'moss', name: '黄绿', tone: '林间回声' },
  { key: 'violet', name: '紫色', tone: '夜幕直觉' }
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

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
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

function svgText(lines: string[], x: number, startY: number, size: number, lineHeight: number, fill = '#f6f0e8') {
  return lines
    .map((line, index) => `<text x="${x}" y="${startY + index * lineHeight}" font-size="${size}" fill="${fill}">${escapeXml(line)}</text>`)
    .join('')
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

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <radialGradient id="bg" cx="50%" cy="18%" r="80%">
          <stop offset="0%" stop-color="#27354a"/>
          <stop offset="48%" stop-color="#11151f"/>
          <stop offset="100%" stop-color="#06070a"/>
        </radialGradient>
        <linearGradient id="line" x1="0" x2="1">
          <stop offset="0%" stop-color="#9fb7d7" stop-opacity="0"/>
          <stop offset="50%" stop-color="#9fb7d7" stop-opacity="0.68"/>
          <stop offset="100%" stop-color="#9fb7d7" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <g opacity="0.34">
        <circle cx="160" cy="180" r="2" fill="#fff"/>
        <circle cx="360" cy="260" r="1.5" fill="#fff"/>
        <circle cx="900" cy="170" r="2" fill="#fff"/>
        <circle cx="1040" cy="380" r="1.5" fill="#fff"/>
        <circle cx="240" cy="620" r="1.2" fill="#fff"/>
        <circle cx="820" cy="690" r="1.5" fill="#fff"/>
        <circle cx="1010" cy="1040" r="1.2" fill="#fff"/>
        <circle cx="190" cy="1300" r="1.5" fill="#fff"/>
      </g>
      <rect x="88" y="86" width="1024" height="1528" rx="34" fill="#0c1018" opacity="0.82" stroke="#6d7f9c" stroke-opacity="0.35"/>
      <text x="120" y="156" font-size="24" fill="#9fb7d7">DIGITAL ORACLE</text>
      <text x="120" y="230" font-size="56" fill="#f6f0e8">在静默中遇见答案</text>
      <rect x="120" y="284" width="960" height="2" fill="url(#line)"/>
      <text x="120" y="360" font-size="28" fill="#9fb7d7">问题</text>
      ${svgText(questionLines, 120, 414, 40, 56)}
      <text x="120" y="620" font-size="28" fill="#9fb7d7">牌面</text>
      ${svgText(cardTextLines, 120, 680, 28, 42, '#e6edf9')}
      <text x="120" y="1050" font-size="28" fill="#9fb7d7">解读</text>
      ${svgText(reportLines, 120, 1110, 27, 40, '#f2eee8')}
      <text x="120" y="1550" font-size="22" fill="#9aa7bd">保存于 ${escapeXml(date)} · Tarot Journal</text>
    </svg>
  `

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const image = new Image()
    image.decoding = 'async'
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('无法生成解读长图'))
      image.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('当前浏览器不支持 Canvas 导出')
    }

    context.drawImage(image, 0, 0)
    const png = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = png
    link.download = `oracle-reading-${reading.id}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}
