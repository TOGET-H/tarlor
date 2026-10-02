import { Worker } from 'node:worker_threads'
import { createRequire } from 'node:module'
import { TtsError } from './config'

export type TtsInput = { text: string; voice: string; rate: string; pitch: string; timeoutMs: number; proxy: string }
export type TtsProvider = (input: TtsInput) => Promise<Uint8Array>

// The library does not expose cancellation. Terminate an isolated worker on timeout
// so a stalled WebSocket cannot continue consuming a synthesis slot or memory.
const workerCode = `
const { parentPort, workerData } = require('node:worker_threads');
(async () => {
  const { Communicate } = require(workerData.modulePath);
  const { text, ...options } = workerData.input;
  const tts = new Communicate(text, { ...options, connectionTimeout: options.timeoutMs });
  const chunks = [];
  let size = 0;
  for await (const chunk of tts.stream()) {
    if (chunk.type !== 'audio' || !chunk.data) continue;
    size += chunk.data.byteLength;
    if (size > 2 * 1024 * 1024) throw new Error('Audio too large');
    chunks.push(Buffer.from(chunk.data));
  }
  parentPort.postMessage({ audio: Buffer.concat(chunks) });
})().catch(() => parentPort.postMessage({ failed: true }));
`

const synthesizeAttempt: TtsProvider = input => new Promise((resolve, reject) => {
  const modulePath = createRequire(import.meta.url).resolve('edge-tts-universal')
  const worker = new Worker(workerCode, { eval: true, workerData: { modulePath, input },
    stdout: true, stderr: true, resourceLimits: { maxOldGenerationSizeMb: 64 } })
  // Do not expose provider diagnostics or text to logs/responses.
  worker.stdout?.resume(); worker.stderr?.resume()
  let settled = false
  const finish = (error?: TtsError, audio?: Uint8Array) => {
    if (settled) return
    settled = true; clearTimeout(timer)
    void worker.terminate().then(() => {
      if (error) reject(error)
      else resolve(audio!)
    }, () => reject(new TtsError('TTS_FAILED', '语音合成失败，请稍后重试')))
  }
  const timer = setTimeout(() => finish(new TtsError('TTS_TIMEOUT', '语音生成超时，请稍后重试', 504)), input.timeoutMs)
  worker.once('message', result => {
    if (result.audio instanceof Uint8Array && result.audio.byteLength > 0) finish(undefined, result.audio)
    else finish(new TtsError('TTS_FAILED', '语音服务未返回音频，请稍后重试'))
  })
  worker.once('error', () => finish(new TtsError('TTS_FAILED', '语音服务连接失败，请稍后重试')))
  worker.once('exit', () => { if (!settled) finish(new TtsError('TTS_FAILED', '语音生成中断，请重试')) })
})

export const synthesizeEdgeSpeech: TtsProvider = async input => {
  const deadline = Date.now() + input.timeoutMs
  for (let attempt = 0; attempt < 2; attempt++) {
    try { return await synthesizeAttempt({ ...input, timeoutMs: Math.max(1, deadline - Date.now()) }) }
    catch (error) {
      if (!(error instanceof TtsError) || error.code !== 'TTS_FAILED' || attempt === 1 || deadline - Date.now() < 1000) throw error
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  throw new TtsError('TTS_FAILED', '语音生成失败，请稍后重试')
}
