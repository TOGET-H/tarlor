<script setup lang="ts">
import { ttsVoices } from '~/shared/tts'
const props = defineProps<{ text: string }>()
const voice = ref('')
const { supported, status, error, speak, pause, resume, stop } = useSpeech()
watch(() => props.text, stop)
watch(voice, stop)
function toggle() {
  if (status.value === 'speaking') pause()
  else if (status.value === 'paused') resume()
  else void speak(props.text, 'reading', voice.value || undefined)
}
</script>

<template>
  <div class="speech-reader" role="group" aria-label="解读朗读">
    <div class="speech-reader-actions">
      <label>音色 <select v-model="voice" aria-label="朗读音色"><option value="">默认音色</option><option v-for="option in ttsVoices" :key="option.id" :value="option.id">{{ option.label }}</option></select></label>
      <button type="button" :disabled="!supported || !text.trim() || status === 'loading'" @click="toggle">
        {{ status === 'loading' ? '生成语音…' : status === 'speaking' ? '暂停朗读' : status === 'paused' ? '继续朗读' : '朗读解读' }}
      </button>
      <button v-if="status !== 'idle'" type="button" @click="stop">停止朗读</button>
    </div>
    <p v-if="!supported" class="muted">当前浏览器不支持朗读，可继续阅读文字。</p>
    <p v-if="error" class="error" role="status">{{ error }}</p>
    <p class="muted"><a href="https://github.com/TOGET-H/tarlor" target="_blank" rel="noopener noreferrer">开源代码</a></p>
  </div>
</template>

<style scoped>
.speech-reader { margin: 14px 0; }
.speech-reader-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.speech-reader-actions label { display: flex; align-items: center; gap: 6px; }
.speech-reader-actions select { width: auto; max-width: 180px; min-height: 44px; }
.speech-reader-actions button { min-height: 44px; }
.speech-reader p { font-size: 13px; margin: 8px 0 0; }
</style>
