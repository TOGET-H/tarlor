import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveAiConfig } from '../server/ai/config'
import { AiError } from '../server/ai/errors'
import { createAiGateway } from '../server/ai/gateway'
import { buildInterpretation } from '../server/services/interpretation'

const messages = [{ role: 'user' as const, content: 'test question' }]
const cards = [{ position: 'single', orientation: 'upright', card: {
  name: '愚者', uprightMeaning: '新的开始', reversedMeaning: '鲁莽'
} }]
const response = (content: unknown = '倾向：先准备再行动') =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }))
const config = (ai: Record<string, unknown> = {}) => resolveAiConfig({ ai })
const configured = (extra: Record<string, unknown> = {}) => config({
  defaultChannel: 'deepseek', channels: { deepseek: { apiKey: 'test-secret', ...extra } }
})
const errorCode = (code: string) => (error: unknown) => error instanceof AiError && error.code === code

test('all built-in channels use their own endpoint, model and credentials', async () => {
  const expected = {
    siliconflow: ['https://api.siliconflow.cn/v1/chat/completions', 'Pro/zai-org/GLM-4.7'],
    deepseek: ['https://api.deepseek.com/chat/completions', 'deepseek-chat'],
    glm: ['https://open.bigmodel.cn/api/paas/v4/chat/completions', 'glm-4.7']
  }
  for (const [channel, [url, model]] of Object.entries(expected)) {
    const transport: typeof fetch = async (input, init) => {
      assert.equal(input, url)
      assert.equal(new Headers(init?.headers).get('Authorization'), `Bearer key-${channel}`)
      const body = JSON.parse(String(init?.body))
      assert.equal(body.model, model)
      assert.deepEqual(body.messages, messages)
      assert.equal(body.stream, false)
      assert.equal(init?.redirect, 'error')
      return response()
    }
    const gateway = createAiGateway(config({ channels: { [channel]: { apiKey: `key-${channel}` } } }), transport)
    const result = await gateway.generateText({ channel, messages })
    assert.equal(result.channel, channel)
    assert.equal(result.model, model)
  }
})

test('custom channel, default selection and text-block normalization', async () => {
  const gateway = createAiGateway(config({ defaultChannel: 'local-ai', channels: {
    'local-ai': { apiKey: 'local', model: 'configured-model', apiUrl: 'http://127.0.0.1:8000/v1/chat/completions' }
  } }), async () => response([{ type: 'text', text: ' hello ' }, { type: 'image', text: 'ignored' }, { text: 'world ' }]))
  assert.deepEqual(await gateway.generateText({ messages }), {
    channel: 'local-ai', model: 'configured-model', content: 'hello world'
  })
})

test('legacy Nuxt and SILICONFLOW environment configuration remain supported', () => {
  const legacy = resolveAiConfig({ siliconflowApiKey: 'old-nuxt', siliconflowModel: 'old-model' }, {
    SILICONFLOW_API_KEY: 'old-env', SILICONFLOW_API_URL: 'https://legacy.example/chat/completions'
  }).channels.siliconflow!
  assert.equal(legacy.apiKey, 'old-nuxt')
  assert.equal(legacy.model, 'old-model')
  assert.equal(legacy.apiUrl, 'https://legacy.example/chat/completions')
  const migrated = resolveAiConfig({ ai: { channels: { siliconflow: { apiKey: 'new', model: 'new-model' } } },
    siliconflowApiKey: 'old', siliconflowModel: 'old' }).channels.siliconflow!
  assert.equal(migrated.apiKey, 'new')
  assert.equal(migrated.model, 'new-model')
})

test('catalog returns status without secrets, endpoints or model internals', () => {
  const gateway = createAiGateway(config({ channels: {
    deepseek: { apiKey: 'never-return-this', apiUrl: 'https://private.example/v1', model: 'private-model' },
    glm: { enabled: 'false', apiKey: 'other-secret' }
  } }))
  const catalog = gateway.describeChannels()
  assert.deepEqual(catalog.channels.map(c => [c.id, c.status]), [
    ['siliconflow', 'unconfigured'], ['deepseek', 'ready'], ['glm', 'disabled']
  ])
  assert.doesNotMatch(JSON.stringify(catalog), /never-return|other-secret|private\.example|private-model|apiKey|apiUrl/)
})

test('unknown, inherited and disabled channels never invoke a provider or fall back', async () => {
  const gateway = createAiGateway(config({ channels: { glm: { enabled: false } } }), async () => {
    assert.fail('Network must not be called')
  })
  for (const channel of ['missing', 'constructor', '__proto__', '']) {
    await assert.rejects(buildInterpretation('question', 'single', cards, { ai: gateway, channel }), errorCode('UNKNOWN_CHANNEL'))
  }
  await assert.rejects(buildInterpretation('question', 'single', cards, { ai: gateway, channel: 'glm' }), errorCode('CHANNEL_DISABLED'))
})

test('missing keys yield an explicit mock result; strict mode raises an error', async () => {
  const gateway = createAiGateway(config(), async () => { assert.fail('No credentials, no network') })
  const result = await buildInterpretation('question', 'single', cards, { ai: gateway })
  assert.equal(result.provider, 'mock')
  assert.equal(result.source, 'mock')
  assert.equal(result.channel, 'siliconflow')
  assert.equal(result.model, null)
  assert.equal(result.fallbackReason, 'CHANNEL_UNCONFIGURED')
  assert.match(result.content, /未调用真实 AI 模型/)
  await assert.rejects(buildInterpretation('question', 'single', cards, {
    ai: createAiGateway(config({ fallbackToMock: 'false' }))
  }), errorCode('CHANNEL_UNCONFIGURED'))
})

test('successful interpretations preserve legacy provider and add actual channel metadata', async () => {
  const ai = createAiGateway(configured(), async (_url, init) => {
    const sent = JSON.parse(String(init?.body))
    assert.equal(sent.messages[0].role, 'system')
    assert.match(sent.messages[1].content, /question/)
    assert.match(sent.messages[1].content, /愚者/)
    return response()
  })
  const result = await buildInterpretation('question', 'single', cards, { ai })
  assert.equal(result.provider, 'deepseek-chat')
  assert.equal(result.source, 'ai')
  assert.equal(result.channel, 'deepseek')
  assert.equal('fallbackReason' in result, false)
})

test('upstream errors do not leak response bodies or retry billable requests', async () => {
  let attempts = 0
  const gateway = createAiGateway(configured(), async () => {
    attempts++
    return new Response('secret-key and private question', { status: 429 })
  })
  await assert.rejects(gateway.generateText({ messages }), (error: unknown) => {
    assert.ok(error instanceof AiError)
    assert.equal(error.code, 'UPSTREAM_ERROR')
    assert.equal(error.upstreamStatus, 429)
    assert.doesNotMatch(error.message, /secret-key|private question/)
    return true
  })
  assert.equal(attempts, 1)
  const fallback = await buildInterpretation('question', 'single', cards, { ai: gateway })
  assert.equal(fallback.fallbackReason, 'UPSTREAM_ERROR')
})

test('invalid JSON, empty content and reasoning-only output are classified', async () => {
  for (const [reply, code] of [
    [() => new Response('not-json'), 'INVALID_RESPONSE'],
    [() => response(' '), 'EMPTY_RESPONSE'],
    [() => new Response(JSON.stringify({ choices: [{ message: { reasoning_content: 'hidden' } }] })), 'EMPTY_RESPONSE']
  ] as const) {
    await assert.rejects(createAiGateway(configured(), async () => reply()).generateText({ messages }), errorCode(code))
  }
})

test('timeouts and network errors are classified without exposing raw errors', async () => {
  const timedOut = createAiGateway(configured({ timeoutMs: 5 }), async (_url, init) => {
    await new Promise(resolve => setTimeout(resolve, 15))
    assert.equal(init?.signal?.aborted, true)
    throw new Error('raw transport detail')
  })
  await assert.rejects(timedOut.generateText({ messages }), errorCode('TIMEOUT'))
  const offline = createAiGateway(configured(), async () => { throw new Error('secret url') })
  await assert.rejects(offline.generateText({ messages }), errorCode('NETWORK_ERROR'))
})

test('invalid transport parameters fail before network and never become mock successes', async () => {
  for (const extra of [{ timeoutMs: 0 }, { temperature: 3 }, { maxTokens: -1 },
    { apiUrl: 'file:///secret' }, { apiUrl: 'https://user:pass@example.com' }, { protocol: 'unsupported' },
    { apiKey: '', timeoutMs: 0 }]) {
    const ai = createAiGateway(configured(extra), async () => { assert.fail('Invalid config must not call network') })
    await assert.rejects(buildInterpretation('question', 'single', cards, { ai }), errorCode('INVALID_CONFIG'))
  }
})
