import assert from 'node:assert/strict'

const base = process.env.ORACLE_TEST_URL || 'http://127.0.0.1:3100'
let ready = false
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    const response = await fetch(`${base}/api/cards`, { signal: AbortSignal.timeout(2000) })
    if (response.ok) { ready = true; break }
  } catch {}
  await new Promise(resolve => setTimeout(resolve, 500))
}
assert.ok(ready, 'Server did not become ready')
for (const route of ['/', '/cards', '/draw']) {
  const response = await fetch(base + route)
  assert.equal(response.status, 200, route)
  assert.match(await response.text(), /Digital Oracle/, route)
}
const cards = await (await fetch(`${base}/api/cards`)).json()
assert.equal(cards.length, 78)
const image = await fetch(base + cards[0].imageUrl)
assert.equal(image.status, 200, 'Card image')
for (const [spreadType, count] of [['single', 1], ['past_present_future', 3]]) {
  const response = await fetch(`${base}/api/readings/draw`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: '如何安排今天的学习？', spreadType })
  })
  assert.equal(response.status, 200)
  const reading = await response.json()
  assert.equal(reading.cards.length, count)
  assert.equal(new Set(reading.cards.map(card => card.card.id)).size, count)
  assert.equal(reading.interpretations[0].provider, 'mock', 'CI must not call paid models')
  assert.ok(reading.interpretations[0].content.length > 0)
}
const invalid = await fetch(`${base}/api/readings/draw`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: '', spreadType: 'single' })
})
assert.equal(invalid.status, 400)
console.log('Smoke checks passed: pages, images, 78 cards, both spreads, input validation.')
