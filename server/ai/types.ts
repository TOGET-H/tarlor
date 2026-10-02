export type AiMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type AiChannel = {
  id: string
  label: string
  enabled: boolean
  protocol: string
  apiKey: string
  apiUrl: string
  model: string
  timeoutMs: number
  temperature: number
  maxTokens: number
}

export type AiConfig = {
  defaultChannel: string
  fallbackToMock: boolean
  channels: Record<string, AiChannel>
}

export type AiTextResult = {
  channel: string
  model: string
  content: string
}

export type AiTextRequest = {
  channel?: string
  messages: AiMessage[]
}
