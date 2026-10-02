import { validateChannel } from './config'
import { AiError } from './errors'
import { generateCompatibleText } from './openai-compatible'
import type { AiConfig, AiTextRequest } from './types'

export function createAiGateway(config: AiConfig, transport: typeof fetch = fetch) {
  function selectChannel(requested?: string) {
    const id = requested === undefined ? config.defaultChannel : requested
    if (typeof id !== 'string' || !Object.hasOwn(config.channels, id)) {
      throw new AiError('UNKNOWN_CHANNEL', '请选择有效的 AI 调用通道', 400)
    }
    const channel = config.channels[id]!
    if (!channel.enabled) throw new AiError('CHANNEL_DISABLED', '该 AI 通道已停用', 503)
    return channel
  }

  return {
    fallbackToMock: config.fallbackToMock,
    selectChannel,
    describeChannels() {
      return {
        defaultChannel: config.defaultChannel,
        fallbackToMock: config.fallbackToMock,
        channels: Object.values(config.channels).map(channel => {
          let status: 'ready' | 'disabled' | 'unconfigured' | 'invalid' = 'ready'
          try { validateChannel(channel) } catch (error) {
            status = error instanceof AiError && error.code === 'CHANNEL_DISABLED' ? 'disabled'
              : error instanceof AiError && error.code === 'CHANNEL_UNCONFIGURED' ? 'unconfigured' : 'invalid'
          }
          return { id: channel.id, label: channel.label, status }
        })
      }
    },
    async generateText(request: AiTextRequest) {
      const channel = selectChannel(request.channel)
      validateChannel(channel)
      return generateCompatibleText(channel, request.messages, transport)
    }
  }
}

export type AiGateway = ReturnType<typeof createAiGateway>
