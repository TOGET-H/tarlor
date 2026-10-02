// Run after build with DATABASE_URL pointing to an isolated, seeded test database.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

assert.ok(process.env.DATABASE_URL, 'Set DATABASE_URL to an isolated seeded test database')
const requests = []
const upstream = createServer(async (req, res) => {
  let raw = ''
  for await (const chunk of req) raw += chunk
  requests.push({ path: req.url, authorization: req.headers.authorization, body: JSON.parse(raw) })
  res.setHeader('Content-Type', 'application/json')
  if (req.url === '/glm') {
    res.writeHead(429)
    res.end(JSON.stringify({ error: 'private provider failure' }))
  } else {
    res.end(JSON.stringify({ choices: [{ message: { content: '倾向：先准备再行动。' } }] }))
  }
})
upstream.listen(0, '127.0.0.1')
await once(upstream, 'listening')
const upstreamBase = `http://127.0.0.1:${upstream.address().port}`
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
  !/^(NUXT_AI(?:_|$)|NUXT_SILICONFLOW_|SILICONFLOW_)/i.test(key)))
Object.assign(env, { HOST: '127.0.0.1', NUXT_AI_DEFAULT_CHANNEL: 'deepseek', NUXT_AI_FALLBACK_TO_MOCK: 'false' })
for (const channel of ['deepseek', 'glm', 'siliconflow']) {
  const prefix = `NUXT_AI_CHANNELS_${channel.toUpperCase()}`
  env[`${prefix}_API_KEY`] = `fake-${channel}`
  env[`${prefix}_MODEL`] = `runtime-${channel}`
  env[`${prefix}_API_URL`] = `${upstreamBase}/${channel}`
  env[`${prefix}_MAX_TOKENS`] = '123'
  env[`${prefix}_TEMPERATURE`] = '0.3'
}
// Reserve an available application port, then release it immediately before spawning.
const reservation = createServer()
reservation.listen(0, '127.0.0.1')
await once(reservation, 'listening')
env.PORT = String(reservation.address().port)
await new Promise(resolve => reservation.close(resolve))
const base = `http://127.0.0.1:${env.PORT}`
const app = spawn(process.execPath, ['.output/server/index.mjs'], { env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
let log = ''
app.stdout.on('data', chunk => { log = (log + chunk).slice(-8000) })
app.stderr.on('data', chunk => { log = (log + chunk).slice(-8000) })
const exited = once(app, 'exit')
const draw = body => fetch(`${base}/api/readings/draw`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: '如何安排学习？', spreadType: 'single', ...body })
})
try {
  let ready = false
  for (let i = 0; i < 60; i++) {
    assert.equal(app.exitCode, null, `Production server exited: ${log}`)
    try {
      const response = await fetch(`${base}/api/ai/channels`, { signal: AbortSignal.timeout(1000) })
      if (response.ok) { ready = true; break }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert.ok(ready, `Production server did not start: ${log}`)
  const catalog = await (await fetch(`${base}/api/ai/channels`)).json()
  assert.equal(catalog.defaultChannel, 'deepseek')
  assert.equal(catalog.fallbackToMock, false)
  assert.ok(catalog.channels.every(channel => channel.status === 'ready'))
  assert.doesNotMatch(JSON.stringify(catalog), /fake-|runtime-|apiKey|apiUrl/)
  for (const channel of [undefined, 'siliconflow', 'deepseek']) {
    const response = await draw({ channel, model: 'caller-model', apiKey: 'caller-key', apiUrl: 'http://caller.invalid' })
    assert.equal(response.status, 200)
    const result = (await response.json()).interpretations[0]
    const selected = channel || 'deepseek'
    assert.equal(result.source, 'ai')
    assert.equal(result.channel, selected)
    assert.equal(result.model, `runtime-${selected}`)
    const sent = requests.at(-1)
    assert.equal(sent.path, `/${selected}`)
    assert.equal(sent.authorization, `Bearer fake-${selected}`)
    assert.equal(sent.body.model, `runtime-${selected}`)
    assert.equal(sent.body.max_tokens, 123)
    assert.equal(sent.body.temperature, 0.3)
  }
  const failed = await draw({ channel: 'glm' })
  assert.equal(failed.status, 502)
  const error = await failed.json()
  assert.equal(error.data.code, 'UPSTREAM_ERROR')
  assert.doesNotMatch(JSON.stringify(error), /private provider failure|fake-/)
  assert.equal((await draw({ channel: 'unknown' })).status, 400)
  assert.equal(requests.length, 4, 'No retries, no calls for invalid channels')
  console.log('AI runtime checks passed: post-build env overrides, routing, credentials, parameters, strict errors, caller isolation.')
} finally {
  app.kill()
  await exited
  upstream.closeAllConnections()
  await new Promise(resolve => upstream.close(resolve))
}
