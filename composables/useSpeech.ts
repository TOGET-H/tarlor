import { createSpeechPlayer, type SpeechStatus } from '~/utils/speech'
import type { SpeechPurpose } from '~/shared/tts'

export function useSpeech() {
  const supported = ref(false)
  const status = ref<SpeechStatus>('idle')
  const error = ref('')
  let player: ReturnType<typeof createSpeechPlayer> | undefined
  function stop() { player?.stop() }
  onMounted(() => {
    supported.value = 'Audio' in window
    if (supported.value) {
      player = createSpeechPlayer({
        async synthesize(body, signal) {
          let response: Response
          try {
            response = await fetch('/api/tts/synthesize', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
              signal: AbortSignal.any([signal, AbortSignal.timeout(65000)])
            })
          } catch { throw new Error('语音连接失败或超时，请稍后重试。') }
          if (!response.ok) {
            const messages: Record<number, string> = {
              400: '语音内容或音色无效，请重新选择。', 429: '语音服务正忙，请稍后重试。',
              503: '语音服务暂未开启。', 504: '语音生成超时，请稍后重试。'
            }
            throw new Error(messages[response.status] ?? '语音生成失败，请稍后重试。')
          }
          if (!response.headers.get('Content-Type')?.includes('audio/mpeg')) throw new Error('语音服务返回的音频无效。')
          const blob = await response.blob()
          if (!blob.size) throw new Error('语音服务未返回音频。')
          return blob
        },
        audio: url => new Audio(url), createUrl: blob => URL.createObjectURL(blob), revokeUrl: url => URL.revokeObjectURL(url)
      }, state => {
        status.value = state.status; error.value = state.error
      })
    }
    window.addEventListener('pagehide', stop)
  })
  onBeforeUnmount(() => {
    stop()
    window.removeEventListener('pagehide', stop)
  })
  return {
    supported, status, error, stop,
    speak: (text: string, purpose: SpeechPurpose = 'reading', voice?: string) => player?.speak(text, purpose, voice),
    pause: () => player?.pause(), resume: () => player?.resume()
  }
}
