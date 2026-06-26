type DrawnCard = {
  position: string
  orientation: string
  card: {
    name: string
    uprightMeaning: string
    reversedMeaning: string
  }
}

const positionLabels: Record<string, string> = {
  single: '核心提示',
  past: '过去',
  present: '现在',
  future: '未来'
}

const orientationLabels: Record<string, string> = {
  upright: '正位',
  reversed: '逆位'
}

export function buildMockInterpretation(question: string, spreadType: string, cards: DrawnCard[]) {
  const intro =
    spreadType === 'single'
      ? `关于“${question}”，这次单张牌解读会聚焦当前最重要的主题。`
      : `关于“${question}”，这组三张牌会从过去影响、当下状态和未来走向三个角度进行观察。`

  const lines = cards.map((entry) => {
    const meaning =
      entry.orientation === 'upright'
        ? entry.card.uprightMeaning
        : entry.card.reversedMeaning

    return `${positionLabels[entry.position] ?? entry.position}：${entry.card.name}（${orientationLabels[entry.orientation] ?? entry.orientation}）指向：${meaning}`
  })

  return `${intro}\n\n${lines.join('\n\n')}\n\n这是一段已保存的模拟解读。后续可以在服务层接入 AI 服务，而不需要改动抽牌 API 的数据结构。`
}
