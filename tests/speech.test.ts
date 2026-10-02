import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpeechPlayer, splitSpeechText, type SpeechAudio, type SpeechState } from '../utils/speech'

function harness(synthesize = async (_: unknown, _signal: AbortSignal) => new Blob(['mp3'], { type: 'audio/mpeg' })) {
  const states: SpeechState[] = []
  const audio: SpeechAudio[] = []
  const revoked: string[] = []
  const player = createSpeechPlayer({
    synthesize,
    audio: () => {
      const item: SpeechAudio = { play: async () => {}, pause() {}, load() {}, removeAttribute() {}, onended: null, onerror: null }
      audio.push(item); return item
    },
    createUrl: () => `blob:${audio.length}`, revokeUrl: url => { revoked.push(url) }
  }, state => states.push(state))
  return { player, states, audio, revoked }
}
const tick = () => new Promise(resolve => setImmediate(resolve))

test('long Chinese and emoji text preserves characters within server length bounds', () => {
  const input = '倾向：先准备。' + '🧘'.repeat(405) + '！'
  const chunks = splitSpeechText(input)
  assert.equal(chunks.join(''), input)
  assert.ok(chunks.every(chunk => chunk.length <= 350 && !/[\uD800-\uDBFF]$/.test(chunk)))
  assert.deepEqual(splitSpeechText(' \n '), [])
})

test('MP3 chunks play sequentially and release object URLs', async () => {
  const h = harness()
  await h.player.speak('文'.repeat(400))
  assert.equal(h.audio.length, 1)
  assert.equal(h.states.at(-1)!.status, 'speaking')
  h.audio[0]!.onended?.call({} as HTMLMediaElement, {} as Event)
  await tick()
  assert.equal(h.audio.length, 2)
  assert.equal(h.revoked.length, 1)
  h.player.stop()
  assert.equal(h.revoked.length, 2)
})

test('pause and resume reuse existing audio without another synthesis request', async () => {
  const h = harness()
  await h.player.speak('朗读测试')
  h.player.pause()
  assert.equal(h.states.at(-1)!.status, 'paused')
  await h.player.resume()
  assert.equal(h.states.at(-1)!.status, 'speaking')
  assert.equal(h.audio.length, 1)
})

test('stopping a pending synthesis aborts it and ignores late results', async () => {
  let resolve!: (blob: Blob) => void
  let signal!: AbortSignal
  const h = harness(async (_, passedSignal) => { signal = passedSignal; return new Promise(done => { resolve = done }) })
  const pending = h.player.speak('旧阶段')
  h.player.stop()
  assert.equal(signal.aborted, true)
  resolve(new Blob(['late']))
  await pending
  assert.equal(h.audio.length, 0)
  assert.equal(h.states.at(-1)!.status, 'idle')
})

test('old audio events cannot restart playback after replacement', async () => {
  const h = harness()
  await h.player.speak('旧阶段')
  const oldEnd = h.audio[0]!.onended!
  await h.player.speak('新阶段')
  oldEnd.call({} as HTMLMediaElement, {} as Event)
  await tick()
  assert.equal(h.audio.length, 2)
  assert.equal(h.states.at(-1)!.status, 'speaking')
})

test('autoplay refusal allows an explicit retry, synthesis errors remain visible', async () => {
  const h = harness()
  await h.player.speak('测试')
  h.player.pause()
  h.audio[0]!.play = async () => { throw new Error('NotAllowedError') }
  await h.player.resume()
  assert.equal(h.states.at(-1)!.status, 'paused')
  assert.match(h.states.at(-1)!.error, /点击继续/)
  const failed = harness(async () => { throw new Error('语音生成失败') })
  await failed.player.speak('失败')
  assert.deepEqual(failed.states.at(-1), { status: 'idle', error: '语音生成失败' })
})
