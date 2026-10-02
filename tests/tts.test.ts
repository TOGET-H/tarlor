import test from 'node:test'
import assert from 'node:assert/strict'
import { createTtsGateway } from '../server/tts/gateway'
import { resolveTtsConfig, TtsError } from '../server/tts/config'
import { synthesizeEdgeSpeech } from '../server/tts/edge'
import { createServer, type Socket } from 'node:net'
import { once } from 'node:events'
const code = (expected: string) => (error: unknown) => error instanceof TtsError && error.code === expected
const config = resolveTtsConfig({})

test('a stalled proxy times out and its worker connection is terminated', async () => {
  const sockets = new Set<Socket>()
  const proxy = createServer(socket => {
    sockets.add(socket); socket.on('close', () => sockets.delete(socket))
    socket.resume() // Consume CONNECT bytes so the peer's EOF can be observed.
  })
  proxy.listen(0, '127.0.0.1')
  await once(proxy, 'listening')
  const address = proxy.address()
  assert.ok(address && typeof address !== 'string')
  try {
    const start = Date.now()
    await assert.rejects(synthesizeEdgeSpeech({ text: 'test', voice: config.voice, rate: config.rate,
      pitch: config.pitch, timeoutMs: 1000, proxy: `http://127.0.0.1:${address.port}` }), code('TTS_TIMEOUT'))
    assert.ok(Date.now() - start < 5000)
    await new Promise(resolve => setTimeout(resolve, 50))
    assert.equal(sockets.size, 0, 'Terminated worker must not leave a proxy socket open')
  } finally {
    for (const socket of sockets) socket.destroy()
    await new Promise<void>(resolve => proxy.close(() => resolve()))
  }
})

test('voice, purpose and server configuration reach the provider; caller connection overrides are ignored', async () => {
  const gateway = createTtsGateway(async input => {
    assert.equal(input.voice, 'zh-CN-XiaoxiaoNeural')
    assert.equal(input.rate, '-15%')
    assert.equal(input.pitch, '+0Hz')
    assert.equal(input.proxy, '')
    assert.equal(input.timeoutMs, 30000)
    return new Uint8Array([1, 2, 3])
  })
  await gateway.synthesize({ text: '测试', purpose: 'meditation', voice: 'zh-CN-XiaoxiaoNeural', proxy: 'http://untrusted', timeoutMs: 0 }, config)
})

test('invalid, oversized, disabled or unknown-channel requests never call the provider', async () => {
  const gateway = createTtsGateway(async () => { assert.fail('No provider request') })
  for (const body of [null, [], { text: '' }, { text: '文'.repeat(351) }, { text: 'test', voice: 'unknown' },
    { text: 'test', channel: 'unknown' }, { text: 'test', purpose: 'unknown' }]) {
    await assert.rejects(gateway.synthesize(body, config), (error: unknown) => error instanceof TtsError && error.statusCode === 400)
  }
  await assert.rejects(gateway.synthesize({ text: 'test' }, resolveTtsConfig({ enabled: 'false' })), code('TTS_DISABLED'))
  assert.throws(() => resolveTtsConfig({ rate: 'invalid' }), code('INVALID_CONFIG'))
})

test('identical in-flight requests coalesce; cache varies by voice and expires', async () => {
  let time = 0
  let calls = 0
  const gateway = createTtsGateway(async () => { calls++; return new Uint8Array([1]) }, () => time)
  await Promise.all([gateway.synthesize({ text: '你好' }, config), gateway.synthesize({ text: '你好' }, config)])
  await gateway.synthesize({ text: '你好' }, config)
  assert.equal(calls, 1)
  await gateway.synthesize({ text: '你好', voice: 'zh-CN-XiaoxiaoNeural' }, config)
  assert.equal(calls, 2)
  time = 600001
  await gateway.synthesize({ text: '你好' }, config)
  assert.equal(calls, 3)
})

test('concurrency is bounded and failures release slots without exposing provider messages', async () => {
  const releases: Array<(audio: Uint8Array) => void> = []
  const gateway = createTtsGateway(() => new Promise(resolve => releases.push(resolve)))
  const one = gateway.synthesize({ text: 'one' }, config)
  const two = gateway.synthesize({ text: 'two' }, config)
  await assert.rejects(gateway.synthesize({ text: 'three' }, config), code('TTS_BUSY'))
  releases.forEach(release => release(new Uint8Array([1])))
  await Promise.all([one, two])
  const failed = createTtsGateway(async () => { throw new Error('secret provider URL and user text') })
  await assert.rejects(failed.synthesize({ text: 'test' }, config), (error: unknown) => {
    assert.ok(error instanceof TtsError)
    assert.equal(error.code, 'TTS_FAILED')
    assert.doesNotMatch(error.message, /secret|provider|user/)
    return true
  })
})
