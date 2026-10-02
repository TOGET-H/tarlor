import { maxSpeechChunkLength, type SpeechRequest, type SpeechPurpose } from '../shared/tts'

export type SpeechStatus = 'idle' | 'loading' | 'speaking' | 'paused'
export type SpeechState = { status: SpeechStatus; error: string }
export type SpeechAudio = Pick<HTMLAudioElement, 'play' | 'pause' | 'load' | 'removeAttribute' | 'onended' | 'onerror'>
export type SpeechDependencies = {
  synthesize: (request: SpeechRequest, signal: AbortSignal) => Promise<Blob>
  audio: (url: string) => SpeechAudio
  createUrl: (blob: Blob) => string
  revokeUrl: (url: string) => void
}

export function splitSpeechText(text: string): string[] {
  const chunks: string[] = []
  let chunk = ''
  for (const sentence of text.trim().match(/[^。！？!?\n]+[。！？!?\n]*|[。！？!?]+/gu) ?? []) {
    if (chunk && chunk.length + sentence.length > maxSpeechChunkLength) { chunks.push(chunk); chunk = '' }
    for (const character of sentence) {
      if (chunk.length + character.length > maxSpeechChunkLength) { chunks.push(chunk); chunk = '' }
      chunk += character
    }
  }
  if (chunk.trim()) chunks.push(chunk)
  return chunks.filter(part => part.trim())
}

export function createSpeechPlayer(deps: SpeechDependencies, changed: (state: SpeechState) => void) {
  let status: SpeechStatus = 'idle'
  let generation = 0
  let chunks: string[] = []
  let index = 0
  let current: SpeechAudio | null = null
  let url = ''
  let controller: AbortController | null = null
  let options: { voice?: string; purpose: SpeechPurpose } = { purpose: 'reading' }
  const emit = (next: SpeechStatus, error = '') => { status = next; changed({ status, error }) }
  function releaseAudio() {
    if (current) {
      current.onended = null; current.onerror = null
      current.pause(); current.removeAttribute('src'); current.load(); current = null
    }
    if (url) { deps.revokeUrl(url); url = '' }
  }
  function stop() {
    generation++
    controller?.abort(); controller = null
    releaseAudio(); chunks = []; index = 0
    emit('idle')
  }
  async function play(token: number) {
    try {
      await current!.play()
      if (token === generation && status !== 'paused') emit('speaking')
    } catch {
      if (token === generation) emit('paused', '播放未开始，请点击继续朗读。')
    }
  }
  async function next(token: number) {
    if (token !== generation) return
    releaseAudio()
    const text = chunks[index]
    if (!text) { emit('idle'); return }
    emit('loading')
    controller = new AbortController()
    try {
      const blob = await deps.synthesize({ text, ...options }, controller.signal)
      if (token !== generation) return
      url = deps.createUrl(blob); current = deps.audio(url)
      current.onended = () => { if (token === generation) { index++; void next(token) } }
      current.onerror = () => {
        if (token !== generation) return
        stop(); emit('idle', '音频无法播放，请重试。')
      }
      await play(token)
    } catch (error) {
      if (token !== generation) return
      stop()
      emit('idle', error instanceof Error ? error.message : '语音生成失败，请稍后重试。')
    }
  }
  return {
    speak(text: string, purpose: SpeechPurpose = 'reading', voice?: string) {
      stop(); chunks = splitSpeechText(text); options = { purpose, voice }
      return next(generation)
    },
    pause() {
      if (status !== 'speaking' || !current) return
      emit('paused'); current.pause()
    },
    async resume() {
      if (status !== 'paused' || !current) return
      emit('loading'); await play(generation)
    },
    stop
  }
}
