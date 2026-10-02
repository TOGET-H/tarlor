export const ttsVoices = [
  { id: 'zh-CN-YunxiNeural', label: '云溪（男声）' },
  { id: 'zh-CN-XiaoxiaoNeural', label: '晓晓（女声）' }
] as const
export type SpeechPurpose = 'reading' | 'meditation'
export type SpeechRequest = { text: string; channel?: string; voice?: string; purpose?: SpeechPurpose }
export const maxSpeechChunkLength = 350
