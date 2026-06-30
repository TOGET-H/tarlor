type DrawnCard = {
  position: string
  orientation: string
  sortOrder?: number
  card: {
    name: string
    uprightMeaning: string
    reversedMeaning: string
    description?: string | null
  }
}

type SiliconFlowContentPart = {
  type?: string
  text?: string
}

type SiliconFlowResponse = {
  choices?: Array<{
    message?: {
      content?: string | SiliconFlowContentPart[]
    }
  }>
  error?: {
    message?: string
  }
}

type BuildInterpretationOptions = {
  apiKey?: string
  model?: string
  apiUrl?: string
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

function cardPromptLines(cards: DrawnCard[]) {
  return cards.map((entry) => {
    const position = positionLabels[entry.position] ?? entry.position
    const orientation = orientationLabels[entry.orientation] ?? entry.orientation
    const meaning =
      entry.orientation === 'upright'
        ? entry.card.uprightMeaning
        : entry.card.reversedMeaning

    return [
      `位置：${position}`,
      `牌名：${entry.card.name}`,
      `方向：${orientation}`,
      `关键词：${meaning}`,
      entry.card.description ? `牌面说明：${entry.card.description}` : ''
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

function normalizeSiliconFlowContent(content: string | SiliconFlowContentPart[] | undefined) {
  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text || '')
      .join('')
      .trim()
  }

  return ''
}

function buildSystemPrompt() {
  return [
    '你是一位温和、克制、准确的中文塔罗解读者。',
    '你必须优先回答用户的具体问题，不允许只泛泛解释牌义。',
    '每一段都要回扣用户问题中的主题，例如事业、关系、学习、财务、情绪或行动选择。',
    '解读第一段第一句必须以“倾向：”开头，给出直接判断或当前最重要的方向。',
    '如果用户提出“要不要”“能不能”“怎么做”这类问题，“倾向：”后必须写条件式倾向，例如“先准备再行动”或“暂缓观察”，而不是回避。',
    '不要把“需要深思”“保持冷静”“视情况而定”单独当作倾向；这些只能作为补充条件。',
    '塔罗解读只能作为反思工具，不要声称能预测绝对未来，也不要给出确定的医疗、法律或投资结论。'
  ].join('\n')
}

function buildPrompt(question: string, spreadType: string, cards: DrawnCard[]) {
  const spreadLabel = spreadType === 'single' ? '单张牌' : '过去 / 现在 / 未来'

  return [
    '请根据下面的用户问题、牌阵和抽到的牌，生成一次可保存的塔罗解读。',
    '',
    '最重要的规则：',
    '1. 第一段必须直接回应用户问题，明确说明这次牌面更倾向于什么，以及需要注意什么。',
    '2. 不要把牌义当作独立百科来解释；牌义必须服务于用户问题。',
    '3. 用户问题里的关键主题必须在解读中出现，并贯穿整篇回答。',
    '4. 如果用户问“要不要换工作”这类选择，不要只说“需要思考”；必须写出类似“暂时不建议立刻换”“可以开始寻找机会但不要裸辞”这样的条件式建议。',
    '',
    '用户问题：',
    question,
    '',
    `牌阵：${spreadLabel}`,
    '',
    '抽到的牌：',
    cardPromptLines(cards),
    '',
    '输出格式：',
    '【直接回应】第一句固定写成“倾向：……”。用 2 到 4 句先回答用户真正问的事；如果是选择题或是否题，必须给出明确的条件式倾向。',
    '【牌面依据】结合每张牌的位置、方向和关键词，说明为什么这样判断。',
    '【现实建议】给出 2 到 4 条具体可执行的建议。',
    '',
    '写作要求：',
    '1. 使用简体中文。',
    '2. 语气神秘但克制，不要恐吓或过度承诺。',
    '3. 总长度控制在 300 到 600 字。'
  ].join('\n')
}

export async function buildInterpretation(
  question: string,
  spreadType: string,
  cards: DrawnCard[],
  options: BuildInterpretationOptions = {}
) {
  const fallback = buildMockInterpretation(question, spreadType, cards)
  const apiKey = options.apiKey?.trim()
  const model = options.model?.trim() || 'Pro/zai-org/GLM-4.7'
  const apiUrl = options.apiUrl?.trim() || 'https://api.siliconflow.cn/v1/chat/completions'

  if (!apiKey) {
    return {
      provider: 'mock',
      content: fallback
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt()
          },
          {
            role: 'user',
            content: buildPrompt(question, spreadType, cards)
          }
        ],
        temperature: 0.78,
        max_tokens: 900,
        stream: false
      })
    })

    const data = await response.json() as SiliconFlowResponse

    if (!response.ok) {
      throw new Error(
        JSON.stringify({
          model,
          status: response.status,
          message: data.error?.message || `SiliconFlow request failed with ${response.status}`
        })
      )
    }

    const content = normalizeSiliconFlowContent(data.choices?.[0]?.message?.content)

    if (!content) {
      throw new Error('SiliconFlow returned an empty interpretation')
    }

    return {
      provider: model,
      content
    }
  } catch (error) {
    console.error('SiliconFlow interpretation failed, falling back to mock.', error)

    return {
      provider: 'mock',
      content: fallback
    }
  }
}
