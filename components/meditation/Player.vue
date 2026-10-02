<script setup lang="ts">
import Visual from './Visual.vue'
import { currentBodyRegion, currentStage, formatRemaining, sessionTiming, type Duration, type Practice } from '~/utils/meditation'
const props = defineProps<{ practice: Practice; duration: Duration }>()
const router = useRouter()
const status = ref<'ready' | 'running' | 'paused' | 'complete'>('ready')
const startedAt = ref<number | null>(null)
const pausedAt = ref<number | null>(null)
const pausedDurationMs = ref(0)
const now = ref(Date.now())
const soundEnabled = ref(true)
const guidanceEnabled = ref(false)
const speech = useSpeech()
const { supported: speechSupported, error: speechError, status: speechStatus } = speech
const exitOpen = ref(false)
const exitTriggerRef = ref<HTMLButtonElement | null>(null)
const cancelExitRef = ref<HTMLButtonElement | null>(null)
let timer: ReturnType<typeof setInterval> | null = null
let audio: AudioContext | null = null
const timing = computed(() => sessionTiming({ durationMinutes: props.duration, startedAt: startedAt.value, pausedAt: pausedAt.value, pausedDurationMs: pausedDurationMs.value, now: now.value }))
const stage = computed(() => currentStage(props.practice, timing.value.elapsedMs, props.duration))
const bodyRegion = computed(() => currentBodyRegion(props.practice, props.duration, timing.value.elapsedMs))
const remaining = computed(() => formatRemaining(timing.value.remainingMs))
const running = computed(() => status.value === 'running')
const paused = computed(() => status.value === 'paused')
function readGuidance() {
  if (guidanceEnabled.value && running.value) void speech.speak(`${stage.value.title}。${stage.value.guidance}`, 'meditation')
}
function toggleGuidance() {
  guidanceEnabled.value = !guidanceEnabled.value
  if (guidanceEnabled.value) readGuidance()
  else speech.stop()
}
watch(() => stage.value.key, readGuidance)
function clearTimer() { if (timer !== null) { clearInterval(timer); timer = null } }
async function playTone(kind: 'start' | 'resume' | 'complete') {
  if (!soundEnabled.value) return
  try {
    audio ??= new window.AudioContext()
    if (audio.state === 'suspended') await audio.resume()
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    const length = kind === 'complete' ? 1.2 : .55
    const time = audio.currentTime
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime({ start: 392, resume: 440, complete: 523.25 }[kind], time)
    if (kind === 'complete') oscillator.frequency.exponentialRampToValueAtTime(659.25, time + length)
    gain.gain.setValueAtTime(.0001, time)
    gain.gain.exponentialRampToValueAtTime(.08, time + .08)
    gain.gain.exponentialRampToValueAtTime(.0001, time + length)
    oscillator.connect(gain); gain.connect(audio.destination)
    oscillator.start(time); oscillator.stop(time + length)
  } catch { soundEnabled.value = false }
}
function complete() {
  if (status.value === 'complete') return
  clearTimer()
  now.value = (startedAt.value ?? Date.now()) + props.duration * 60000 + pausedDurationMs.value
  status.value = 'complete'; exitOpen.value = false
  speech.stop()
  if (guidanceEnabled.value) void speech.speak(`练习完成。你完成了${props.duration}分钟${props.practice.label}。慢慢睁开眼睛，回到当下。`, 'meditation')
  void playTone('complete')
}
function startTimer() {
  clearTimer()
  timer = setInterval(() => { now.value = Date.now(); if (timing.value.complete) complete() }, 250)
}
function start() {
  startedAt.value = Date.now(); now.value = startedAt.value
  pausedAt.value = null; pausedDurationMs.value = 0; status.value = 'running'
  readGuidance()
  void playTone('start'); startTimer()
}
function pause() {
  if (!running.value) return
  now.value = Date.now(); pausedAt.value = now.value; status.value = 'paused'; clearTimer()
  speech.stop()
}
function resume() {
  if (!paused.value || pausedAt.value === null) return
  const time = Date.now()
  pausedDurationMs.value += time - pausedAt.value
  pausedAt.value = null; now.value = time; status.value = 'running'
  readGuidance()
  void playTone('resume'); startTimer()
}
function reset() {
  speech.stop()
  clearTimer(); status.value = 'ready'; startedAt.value = null; pausedAt.value = null
  pausedDurationMs.value = 0; now.value = Date.now(); exitOpen.value = false
}
async function back() { clearTimer(); speech.stop(); await router.push('/meditation') }
async function openExit() { exitOpen.value = true; await nextTick(); cancelExitRef.value?.focus() }
async function cancelExit() { exitOpen.value = false; await nextTick(); exitTriggerRef.value?.focus() }
function togglePause() { if (running.value) pause(); else if (paused.value) resume() }
function onKey(event: KeyboardEvent) {
  const interactive = (event.target as HTMLElement | null)?.matches('button, a, input, textarea, select')
  if (event.key === 'Escape') { if (exitOpen.value) void cancelExit(); else if (running.value || paused.value) void openExit(); return }
  if (event.code === 'Space' && !interactive && (running.value || paused.value)) { event.preventDefault(); togglePause() }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => { clearTimer(); window.removeEventListener('keydown', onKey); void audio?.close() })
</script>

<template>
  <section class="meditation-session" :class="[`status-${status}`, `practice-${practice.id}`]">
    <template v-if="status === 'ready'">
      <button class="meditation-session-back" type="button" @click="back"><span aria-hidden="true">←</span> 返回选择</button>
      <div class="meditation-ready">
        <div class="meditation-ready-signal" aria-hidden="true"><span /></div>
        <p class="eyebrow">{{ practice.englishLabel }} · {{ duration }} Minutes</p>
        <h1>{{ practice.label }}</h1><p class="meditation-ready-description">{{ practice.description }}</p>
        <div class="meditation-ready-note"><span>开始前</span><p>{{ practice.preparation }}</p></div>
        <button type="button" :disabled="!speechSupported" :aria-pressed="guidanceEnabled" @click="toggleGuidance">{{ guidanceEnabled ? '语音引导已开启' : '开启语音引导' }}</button>
        <p v-if="!speechSupported" class="meditation-privacy-note">当前浏览器不支持朗读，可使用文字引导。</p>
        <button class="primary meditation-ready-start" type="button" @click="start">开始练习</button>
        <p class="meditation-privacy-note">本次练习不会保存记录 · <a href="https://github.com/TOGET-H/tarlor" target="_blank" rel="noopener noreferrer">开源代码</a></p>
        <p v-if="speechError" class="meditation-speech-error" role="status">{{ speechError }}</p>
      </div>
    </template>
    <div v-else-if="status === 'complete'" class="meditation-complete">
      <div class="meditation-complete-mark" aria-hidden="true"><span /></div><p class="eyebrow">Practice Complete</p><h1>练习完成</h1>
      <p>你完成了 {{ duration }} 分钟{{ practice.label }}。</p>
      <button v-if="speechStatus === 'paused'" type="button" @click="speech.resume">播放完成引导</button>
      <div class="meditation-complete-actions"><button class="primary" type="button" @click="reset">再练一次</button><button type="button" @click="back">返回冥想首页</button></div>
      <p v-if="speechError" class="meditation-speech-error" role="status">{{ speechError }}</p>
    </div>
    <template v-else>
      <header class="meditation-player-header">
        <button ref="exitTriggerRef" class="meditation-icon-button" type="button" aria-label="结束练习" title="结束练习" @click="openExit">×</button>
        <div><span>{{ practice.label }}</span><small>{{ paused ? '已暂停' : '练习中' }}</small></div>
        <time :datetime="`PT${Math.ceil(timing.remainingMs / 1000)}S`">{{ remaining }}</time>
      </header>
      <div class="meditation-player-focus">
        <Visual :visual="practice.visual" :active="running" :paused="paused" :body-region="bodyRegion" />
        <div class="meditation-guidance" aria-live="polite"><p>{{ paused ? '练习已暂停' : stage.title }}</p><span>{{ paused ? '准备好后继续，计时会从这里恢复。' : stage.guidance }}</span></div>
      </div>
      <footer class="meditation-player-controls">
        <button type="button" :disabled="!speechSupported" :aria-pressed="guidanceEnabled" @click="toggleGuidance">{{ guidanceEnabled ? '关闭语音引导' : '开启语音引导' }}</button>
        <button type="button" :aria-pressed="soundEnabled" :title="soundEnabled ? '关闭提示音' : '开启提示音'" @click="soundEnabled = !soundEnabled"><span aria-hidden="true">{{ soundEnabled ? '◉' : '○' }}</span> {{ soundEnabled ? '提示音开启' : '提示音关闭' }}</button>
        <button class="meditation-pause-button" type="button" @click="togglePause"><span aria-hidden="true">{{ paused ? '▶' : 'Ⅱ' }}</span> {{ paused ? '继续练习' : '暂停' }}</button>
        <button v-if="speechStatus === 'paused' && running" type="button" @click="speech.resume">播放当前引导</button>
        <span v-if="speechStatus === 'loading'" class="meditation-speech-error" role="status">正在生成语音…</span>
        <p v-if="speechError" class="meditation-speech-error" role="status">{{ speechError }}</p>
      </footer>
    </template>
    <div v-if="exitOpen" class="meditation-exit-layer">
      <button class="meditation-exit-backdrop" type="button" aria-label="取消结束" @click="cancelExit" />
      <div class="meditation-exit-dialog" role="dialog" aria-modal="true" aria-labelledby="meditation-exit-title">
        <p class="eyebrow">End Practice</p><h2 id="meditation-exit-title">现在结束练习？</h2><p>本次进度不会保存。你也可以先暂停，准备好再继续。</p>
        <div><button ref="cancelExitRef" class="primary" type="button" @click="cancelExit">继续练习</button><button type="button" @click="back">结束并返回</button></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.meditation-player-controls { flex-wrap: wrap; gap: 10px; }
.meditation-player-controls button { flex: 1 1 140px; width: auto; min-width: 0; }
.meditation-speech-error { flex-basis: 100%; margin: 4px 0; color: var(--muted); font-size: 13px; text-align: center; }
@media (width <= 480px) {
  .meditation-player-controls button { flex-basis: calc(50% - 10px); padding: 8px; }
  .meditation-player-controls .meditation-pause-button { flex-basis: 100%; }
}
</style>
