# Tarot CRUD Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable Nuxt full-stack tarot CRUD demo with local SQLite persistence, Nitro API routes, card management, reading history, card drawing, and mock AI interpretation.

**Architecture:** Use Nuxt as a single full-stack app. Prisma owns the SQLite schema and seed data; Nitro server routes expose card and reading APIs; Nuxt pages consume those APIs through `$fetch` and render the CRUD and draw flows.

**Tech Stack:** Nuxt 4, Vue 3, Nitro server API, Prisma, SQLite, TypeScript, pnpm.

---

## File Structure

- Create: `package.json` - Nuxt scripts, Prisma commands, dependencies.
- Create: `nuxt.config.ts` - Nuxt configuration.
- Create: `tsconfig.json` - Nuxt TypeScript project reference.
- Create: `app.vue` - Root app layout shell and navigation.
- Create: `assets/css/main.css` - Global app styles.
- Create: `prisma/schema.prisma` - SQLite data model.
- Create: `prisma/seed.ts` - Seed 12 sample tarot cards.
- Create: `server/utils/prisma.ts` - Shared Prisma client.
- Create: `server/utils/validation.ts` - Request validation helpers.
- Create: `server/services/interpretation.ts` - Mock interpretation service and future AI integration boundary.
- Create: `server/api/cards/index.get.ts` - List cards.
- Create: `server/api/cards/index.post.ts` - Create card.
- Create: `server/api/cards/[id].get.ts` - Get card detail.
- Create: `server/api/cards/[id].put.ts` - Update card.
- Create: `server/api/cards/[id].delete.ts` - Delete card.
- Create: `server/api/readings/index.get.ts` - List reading history.
- Create: `server/api/readings/draw.post.ts` - Create reading, draw cards, save interpretation.
- Create: `server/api/readings/[id].get.ts` - Get reading detail.
- Create: `server/api/readings/[id].put.ts` - Update reading question or status.
- Create: `server/api/readings/[id].delete.ts` - Delete reading.
- Create: `types/tarot.ts` - Shared frontend types.
- Create: `pages/index.vue` - Home page.
- Create: `pages/cards.vue` - Card library CRUD page.
- Create: `pages/draw.vue` - Draw flow page.
- Create: `pages/readings/index.vue` - Reading history page.
- Create: `pages/readings/[id].vue` - Reading detail page.

## Task 1: Scaffold Nuxt Project

**Files:**
- Create: `package.json`
- Create: `nuxt.config.ts`
- Create: `tsconfig.json`
- Create: `app.vue`
- Create: `assets/css/main.css`

- [ ] **Step 1: Create the Nuxt package manifest**

Create `package.json`:

```json
{
  "name": "tarot-crud-demo",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "typecheck": "nuxt typecheck"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "nuxt": "^4.0.0",
    "vue": "^3.5.0",
    "vue-router": "^4.5.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vue-tsc": "^2.1.0"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Create Nuxt config**

Create `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  typescript: {
    typeCheck: true
  }
})
```

- [ ] **Step 3: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

- [ ] **Step 4: Create the root app shell**

Create `app.vue`:

```vue
<template>
  <div class="app-shell">
    <header class="topbar">
      <NuxtLink class="brand" to="/">Tarot Journal</NuxtLink>
      <nav class="nav-links" aria-label="Primary navigation">
        <NuxtLink to="/draw">Draw</NuxtLink>
        <NuxtLink to="/cards">Cards</NuxtLink>
        <NuxtLink to="/readings">Readings</NuxtLink>
      </nav>
    </header>

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>
```

- [ ] **Step 5: Create global CSS**

Create `assets/css/main.css` with the visual system:

```css
:root {
  color-scheme: dark;
  --bg: #171512;
  --panel: #242019;
  --panel-soft: #2f2a21;
  --text: #f3eadc;
  --muted: #b8aa96;
  --line: #4b4033;
  --accent: #d8a657;
  --accent-strong: #f0c36f;
  --danger: #ef7d6b;
  --success: #9ecf86;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel-soft);
  color: var(--text);
  cursor: pointer;
  min-height: 38px;
  padding: 0 14px;
}

button.primary {
  border-color: #a8762d;
  background: var(--accent);
  color: #1d160c;
  font-weight: 700;
}

button.danger {
  border-color: #8b3d32;
  color: #ffd0ca;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #120f0c;
  color: var(--text);
  padding: 10px 12px;
}

textarea {
  min-height: 96px;
  resize: vertical;
}

.app-shell {
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid var(--line);
  background: rgba(23, 21, 18, 0.94);
  padding: 14px clamp(16px, 4vw, 48px);
  backdrop-filter: blur(12px);
}

.brand {
  color: var(--accent-strong);
  font-weight: 800;
}

.nav-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-links a {
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--muted);
  padding: 8px 10px;
}

.nav-links a.router-link-active {
  border-color: var(--line);
  color: var(--text);
  background: var(--panel);
}

.page {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0 56px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.section-header h1 {
  margin: 0;
  font-size: clamp(28px, 5vw, 44px);
}

.section-header p {
  margin: 8px 0 0;
  color: var(--muted);
  max-width: 720px;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  padding: 18px;
}

.grid {
  display: grid;
  gap: 16px;
}

.grid.two {
  grid-template-columns: minmax(0, 0.85fr) minmax(320px, 1.15fr);
}

.field {
  display: grid;
  gap: 7px;
}

.field label {
  color: var(--muted);
  font-size: 13px;
}

.form-grid {
  display: grid;
  gap: 12px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.error {
  border: 1px solid #70352d;
  border-radius: 8px;
  background: #351c18;
  color: #ffd0ca;
  padding: 10px 12px;
}

.muted {
  color: var(--muted);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border-bottom: 1px solid var(--line);
  padding: 12px 10px;
  text-align: left;
  vertical-align: top;
}

.table th {
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.tarot-card {
  display: grid;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: linear-gradient(180deg, #30291f, #211c16);
  padding: 14px;
}

.tarot-card h3 {
  margin: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  font-size: 12px;
  padding: 3px 8px;
}

.reading-card {
  min-height: 220px;
}

@media (max-width: 820px) {
  .topbar,
  .section-header {
    align-items: stretch;
    flex-direction: column;
  }

  .grid.two {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
pnpm install
```

Expected: dependencies install and `nuxt prepare` creates `.nuxt`.

## Task 2: Add Prisma Schema And Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`

- [ ] **Step 1: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model TarotCard {
  id              Int           @id @default(autoincrement())
  name            String
  arcana          String
  suit            String?
  number          String?
  uprightMeaning  String
  reversedMeaning String
  description     String?
  imageUrl        String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  readingCards    ReadingCard[]
}

model Reading {
  id              Int              @id @default(autoincrement())
  question        String
  spreadType      String
  status          String           @default("interpreted")
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  cards           ReadingCard[]
  interpretations Interpretation[]
}

model ReadingCard {
  id          Int       @id @default(autoincrement())
  readingId   Int
  cardId      Int
  position    String
  orientation String
  sortOrder   Int
  reading     Reading   @relation(fields: [readingId], references: [id], onDelete: Cascade)
  card        TarotCard @relation(fields: [cardId], references: [id], onDelete: Restrict)
}

model Interpretation {
  id        Int      @id @default(autoincrement())
  readingId Int
  provider  String   @default("mock")
  content   String
  createdAt DateTime @default(now())
  reading   Reading  @relation(fields: [readingId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Create seed file**

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const cards = [
  {
    name: 'The Fool',
    arcana: 'major',
    suit: null,
    number: '0',
    uprightMeaning: 'New beginnings, openness, trust, and a willingness to step into the unknown.',
    reversedMeaning: 'Carelessness, hesitation, scattered energy, or ignoring practical risks.',
    description: 'The Fool marks the first step of a journey and the courage to begin without full certainty.'
  },
  {
    name: 'The Magician',
    arcana: 'major',
    suit: null,
    number: 'I',
    uprightMeaning: 'Focus, skill, willpower, and turning available resources into action.',
    reversedMeaning: 'Manipulation, unused talent, unclear intention, or lack of follow-through.',
    description: 'The Magician connects idea and execution through concentration and craft.'
  },
  {
    name: 'The High Priestess',
    arcana: 'major',
    suit: null,
    number: 'II',
    uprightMeaning: 'Intuition, inner knowing, hidden information, and quiet observation.',
    reversedMeaning: 'Blocked intuition, secrecy, confusion, or refusing to listen inwardly.',
    description: 'The High Priestess asks for patience and attention to what is not obvious.'
  },
  {
    name: 'The Empress',
    arcana: 'major',
    suit: null,
    number: 'III',
    uprightMeaning: 'Nurturing, abundance, creativity, comfort, and natural growth.',
    reversedMeaning: 'Overgiving, creative block, dependence, or neglecting personal needs.',
    description: 'The Empress brings the energy of care, beauty, and sustained creation.'
  },
  {
    name: 'The Emperor',
    arcana: 'major',
    suit: null,
    number: 'IV',
    uprightMeaning: 'Structure, authority, discipline, protection, and practical leadership.',
    reversedMeaning: 'Rigidity, control issues, weak boundaries, or unstable foundations.',
    description: 'The Emperor favors order, responsibility, and decisions with clear boundaries.'
  },
  {
    name: 'The Lovers',
    arcana: 'major',
    suit: null,
    number: 'VI',
    uprightMeaning: 'Choice, alignment, partnership, values, and honest connection.',
    reversedMeaning: 'Misalignment, avoidance, difficult choices, or divided priorities.',
    description: 'The Lovers highlights decisions that reveal what someone truly values.'
  },
  {
    name: 'Strength',
    arcana: 'major',
    suit: null,
    number: 'VIII',
    uprightMeaning: 'Inner courage, patience, emotional steadiness, and gentle persistence.',
    reversedMeaning: 'Self-doubt, impatience, emotional reactivity, or forcing an outcome.',
    description: 'Strength shows power expressed through calm discipline rather than force.'
  },
  {
    name: 'The Hermit',
    arcana: 'major',
    suit: null,
    number: 'IX',
    uprightMeaning: 'Reflection, solitude, wisdom, guidance, and searching for truth.',
    reversedMeaning: 'Isolation, withdrawal, overthinking, or rejecting useful guidance.',
    description: 'The Hermit turns attention inward to find a more durable answer.'
  },
  {
    name: 'Ace of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 'Ace',
    uprightMeaning: 'Emotional renewal, compassion, love, intuition, and an open heart.',
    reversedMeaning: 'Emotional blockage, guardedness, disappointment, or unspoken feelings.',
    description: 'The Ace of Cups begins a cycle of emotional openness and connection.'
  },
  {
    name: 'Three of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 'Three',
    uprightMeaning: 'Heartbreak, truth, grief, painful clarity, and necessary release.',
    reversedMeaning: 'Healing, forgiveness, delayed grief, or difficulty moving on.',
    description: 'The Three of Swords names pain honestly so recovery can begin.'
  },
  {
    name: 'Six of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'Six',
    uprightMeaning: 'Generosity, exchange, support, fairness, and practical help.',
    reversedMeaning: 'Imbalance, strings attached, debt, dependency, or unfair exchange.',
    description: 'The Six of Pentacles asks whether giving and receiving are balanced.'
  },
  {
    name: 'Page of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 'Page',
    uprightMeaning: 'Curiosity, enthusiasm, exploration, and early creative momentum.',
    reversedMeaning: 'Restlessness, scattered ideas, delay, or fear of beginning.',
    description: 'The Page of Wands brings fresh creative fire before the plan is mature.'
  }
]

async function main() {
  await prisma.tarotCard.createMany({
    data: cards,
    skipDuplicates: true
  })
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
```

- [ ] **Step 3: Create local environment file**

Create `.env`:

```bash
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 4: Run migration and seed**

Run:

```bash
pnpm db:migrate --name init
pnpm db:seed
```

Expected: Prisma creates `prisma/dev.db`, generates the client, and inserts 12 tarot cards.

## Task 3: Add Server Utilities And Interpretation Service

**Files:**
- Create: `server/utils/prisma.ts`
- Create: `server/utils/validation.ts`
- Create: `server/services/interpretation.ts`
- Create: `types/tarot.ts`

- [ ] **Step 1: Create shared Prisma client**

Create `server/utils/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Step 2: Create validation helpers**

Create `server/utils/validation.ts`:

```ts
import { createError } from 'h3'

export function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} is required`
    })
  }

  return value.trim()
}

export function optionalString(value: unknown) {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function validateArcana(value: unknown) {
  const arcana = requiredString(value, 'arcana')

  if (!['major', 'minor'].includes(arcana)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'arcana must be major or minor'
    })
  }

  return arcana
}

export function validateSpreadType(value: unknown) {
  const spreadType = requiredString(value, 'spreadType')

  if (!['single', 'past_present_future'].includes(spreadType)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'spreadType must be single or past_present_future'
    })
  }

  return spreadType
}

export function validateReadingStatus(value: unknown) {
  const status = requiredString(value, 'status')

  if (!['draft', 'interpreted', 'archived'].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'status must be draft, interpreted, or archived'
    })
  }

  return status
}

export function parseId(value: string | undefined, label = 'id') {
  const id = Number(value)

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} must be a positive integer`
    })
  }

  return id
}
```

- [ ] **Step 3: Create interpretation service**

Create `server/services/interpretation.ts`:

```ts
type DrawnCard = {
  position: string
  orientation: string
  card: {
    name: string
    uprightMeaning: string
    reversedMeaning: string
  }
}

const positionLabels: Record<string, string> = {
  single: 'Focus',
  past: 'Past',
  present: 'Present',
  future: 'Future'
}

export function buildMockInterpretation(question: string, spreadType: string, cards: DrawnCard[]) {
  const intro =
    spreadType === 'single'
      ? `For "${question}", this one-card reading highlights the strongest current theme.`
      : `For "${question}", this three-card reading looks at the movement from past influence to present condition and likely direction.`

  const lines = cards.map((entry) => {
    const meaning =
      entry.orientation === 'upright'
        ? entry.card.uprightMeaning
        : entry.card.reversedMeaning

    return `${positionLabels[entry.position] ?? entry.position}: ${entry.card.name} (${entry.orientation}) points to ${meaning.toLowerCase()}`
  })

  return `${intro}\n\n${lines.join('\n\n')}\n\nThis is a saved mock interpretation. The service boundary can later call an AI provider without changing the reading API.`
}
```

- [ ] **Step 4: Create shared frontend types**

Create `types/tarot.ts`:

```ts
export type TarotCard = {
  id: number
  name: string
  arcana: string
  suit: string | null
  number: string | null
  uprightMeaning: string
  reversedMeaning: string
  description: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export type ReadingCard = {
  id: number
  position: string
  orientation: string
  sortOrder: number
  card: TarotCard
}

export type Interpretation = {
  id: number
  provider: string
  content: string
  createdAt: string
}

export type Reading = {
  id: number
  question: string
  spreadType: string
  status: string
  createdAt: string
  updatedAt: string
  cards: ReadingCard[]
  interpretations: Interpretation[]
}
```

## Task 4: Implement Card API Routes

**Files:**
- Create: `server/api/cards/index.get.ts`
- Create: `server/api/cards/index.post.ts`
- Create: `server/api/cards/[id].get.ts`
- Create: `server/api/cards/[id].put.ts`
- Create: `server/api/cards/[id].delete.ts`

- [ ] **Step 1: Create list route**

Create `server/api/cards/index.get.ts`:

```ts
export default defineEventHandler(async () => {
  return prisma.tarotCard.findMany({
    orderBy: [{ arcana: 'asc' }, { id: 'asc' }]
  })
})
```

- [ ] **Step 2: Create card creation route**

Create `server/api/cards/index.post.ts`:

```ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return prisma.tarotCard.create({
    data: {
      name: requiredString(body.name, 'name'),
      arcana: validateArcana(body.arcana),
      suit: optionalString(body.suit),
      number: optionalString(body.number),
      uprightMeaning: requiredString(body.uprightMeaning, 'uprightMeaning'),
      reversedMeaning: requiredString(body.reversedMeaning, 'reversedMeaning'),
      description: optionalString(body.description),
      imageUrl: optionalString(body.imageUrl)
    }
  })
})
```

- [ ] **Step 3: Create card detail route**

Create `server/api/cards/[id].get.ts`:

```ts
export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))
  const card = await prisma.tarotCard.findUnique({ where: { id } })

  if (!card) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Card not found'
    })
  }

  return card
})
```

- [ ] **Step 4: Create card update route**

Create `server/api/cards/[id].put.ts`:

```ts
export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.tarotCard.findUnique({ where: { id } })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Card not found'
    })
  }

  return prisma.tarotCard.update({
    where: { id },
    data: {
      name: requiredString(body.name, 'name'),
      arcana: validateArcana(body.arcana),
      suit: optionalString(body.suit),
      number: optionalString(body.number),
      uprightMeaning: requiredString(body.uprightMeaning, 'uprightMeaning'),
      reversedMeaning: requiredString(body.reversedMeaning, 'reversedMeaning'),
      description: optionalString(body.description),
      imageUrl: optionalString(body.imageUrl)
    }
  })
})
```

- [ ] **Step 5: Create card delete route**

Create `server/api/cards/[id].delete.ts`:

```ts
export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))

  const usedCount = await prisma.readingCard.count({
    where: { cardId: id }
  })

  if (usedCount > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Card is used by saved readings and cannot be deleted'
    })
  }

  await prisma.tarotCard.delete({
    where: { id }
  })

  return { ok: true }
})
```

- [ ] **Step 6: Verify card APIs manually**

Run the dev server after Task 7, then check:

```bash
curl -s http://localhost:3000/api/cards
curl -s -X POST http://localhost:3000/api/cards -H 'content-type: application/json' -d '{"name":"Test Card","arcana":"major","uprightMeaning":"Clear action","reversedMeaning":"Blocked action"}'
```

Expected: the list returns seeded cards; the POST returns the created card.

## Task 5: Implement Reading API Routes

**Files:**
- Create: `server/api/readings/index.get.ts`
- Create: `server/api/readings/draw.post.ts`
- Create: `server/api/readings/[id].get.ts`
- Create: `server/api/readings/[id].put.ts`
- Create: `server/api/readings/[id].delete.ts`

- [ ] **Step 1: Create reading list route**

Create `server/api/readings/index.get.ts`:

```ts
export default defineEventHandler(async () => {
  return prisma.reading.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      cards: {
        orderBy: { sortOrder: 'asc' },
        include: { card: true }
      },
      interpretations: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })
})
```

- [ ] **Step 2: Create draw route**

Create `server/api/readings/draw.post.ts`:

```ts
const spreadPositions: Record<string, string[]> = {
  single: ['single'],
  past_present_future: ['past', 'present', 'future']
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function randomOrientation() {
  return Math.random() > 0.5 ? 'upright' : 'reversed'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const question = requiredString(body.question, 'question')
  const spreadType = validateSpreadType(body.spreadType)
  const positions = spreadPositions[spreadType]

  const cards = await prisma.tarotCard.findMany()

  if (cards.length < positions.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `At least ${positions.length} cards are required for this spread`
    })
  }

  const selectedCards = shuffle(cards).slice(0, positions.length)
  const drawnCards = selectedCards.map((card, index) => ({
    position: positions[index],
    orientation: randomOrientation(),
    sortOrder: index,
    card
  }))

  const interpretation = buildMockInterpretation(question, spreadType, drawnCards)

  return prisma.reading.create({
    data: {
      question,
      spreadType,
      status: 'interpreted',
      cards: {
        create: drawnCards.map((entry) => ({
          cardId: entry.card.id,
          position: entry.position,
          orientation: entry.orientation,
          sortOrder: entry.sortOrder
        }))
      },
      interpretations: {
        create: {
          provider: 'mock',
          content: interpretation
        }
      }
    },
    include: {
      cards: {
        orderBy: { sortOrder: 'asc' },
        include: { card: true }
      },
      interpretations: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
})
```

- [ ] **Step 3: Create reading detail route**

Create `server/api/readings/[id].get.ts`:

```ts
export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))
  const reading = await prisma.reading.findUnique({
    where: { id },
    include: {
      cards: {
        orderBy: { sortOrder: 'asc' },
        include: { card: true }
      },
      interpretations: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!reading) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Reading not found'
    })
  }

  return reading
})
```

- [ ] **Step 4: Create reading update route**

Create `server/api/readings/[id].put.ts`:

```ts
export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.reading.findUnique({ where: { id } })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Reading not found'
    })
  }

  return prisma.reading.update({
    where: { id },
    data: {
      question: requiredString(body.question, 'question'),
      status: validateReadingStatus(body.status)
    },
    include: {
      cards: {
        orderBy: { sortOrder: 'asc' },
        include: { card: true }
      },
      interpretations: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
})
```

- [ ] **Step 5: Create reading delete route**

Create `server/api/readings/[id].delete.ts`:

```ts
export default defineEventHandler(async (event) => {
  const id = parseId(getRouterParam(event, 'id'))

  await prisma.reading.delete({
    where: { id }
  })

  return { ok: true }
})
```

- [ ] **Step 6: Verify reading APIs manually**

Run:

```bash
curl -s -X POST http://localhost:3000/api/readings/draw -H 'content-type: application/json' -d '{"question":"What should I focus on today?","spreadType":"single"}'
curl -s http://localhost:3000/api/readings
```

Expected: draw creates a reading with one card and one mock interpretation; list returns it.

## Task 6: Build Frontend Pages

**Files:**
- Create: `pages/index.vue`
- Create: `pages/cards.vue`
- Create: `pages/draw.vue`
- Create: `pages/readings/index.vue`
- Create: `pages/readings/[id].vue`

- [ ] **Step 1: Create home page**

Create `pages/index.vue`:

```vue
<template>
  <section>
    <div class="section-header">
      <div>
        <h1>Tarot Journal</h1>
        <p>Draw cards, save readings, and keep the interpretation history ready for a future AI reader.</p>
      </div>
    </div>

    <div class="card-grid">
      <NuxtLink class="tarot-card" to="/draw">
        <span class="badge">Reading</span>
        <h3>Draw cards</h3>
        <p class="muted">Ask a question and save a one-card or three-card reading.</p>
      </NuxtLink>
      <NuxtLink class="tarot-card" to="/cards">
        <span class="badge">Library</span>
        <h3>Manage cards</h3>
        <p class="muted">Create, edit, and review the local sample tarot library.</p>
      </NuxtLink>
      <NuxtLink class="tarot-card" to="/readings">
        <span class="badge">History</span>
        <h3>Reading records</h3>
        <p class="muted">Open saved readings and update or archive the question.</p>
      </NuxtLink>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Create card management page**

Create `pages/cards.vue` with a form, list, edit, and delete flow:

```vue
<script setup lang="ts">
import type { TarotCard } from '~/types/tarot'

const emptyForm = {
  name: '',
  arcana: 'major',
  suit: '',
  number: '',
  uprightMeaning: '',
  reversedMeaning: '',
  description: '',
  imageUrl: ''
}

const { data: cards, refresh } = await useFetch<TarotCard[]>('/api/cards', {
  default: () => []
})

const form = reactive({ ...emptyForm })
const editingId = ref<number | null>(null)
const error = ref('')
const saving = ref(false)

function editCard(card: TarotCard) {
  editingId.value = card.id
  Object.assign(form, {
    name: card.name,
    arcana: card.arcana,
    suit: card.suit ?? '',
    number: card.number ?? '',
    uprightMeaning: card.uprightMeaning,
    reversedMeaning: card.reversedMeaning,
    description: card.description ?? '',
    imageUrl: card.imageUrl ?? ''
  })
}

function resetForm() {
  editingId.value = null
  error.value = ''
  Object.assign(form, emptyForm)
}

async function saveCard() {
  error.value = ''
  saving.value = true

  try {
    if (editingId.value) {
      await $fetch(`/api/cards/${editingId.value}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/cards', {
        method: 'POST',
        body: form
      })
    }

    await refresh()
    resetForm()
  } catch (err: any) {
    error.value = err?.statusMessage || err?.data?.statusMessage || 'Unable to save card'
  } finally {
    saving.value = false
  }
}

async function deleteCard(card: TarotCard) {
  error.value = ''

  try {
    await $fetch(`/api/cards/${card.id}`, {
      method: 'DELETE'
    })
    await refresh()
    if (editingId.value === card.id) {
      resetForm()
    }
  } catch (err: any) {
    error.value = err?.statusMessage || err?.data?.statusMessage || 'Unable to delete card'
  }
}
</script>

<template>
  <section>
    <div class="section-header">
      <div>
        <h1>Card Library</h1>
        <p>Manage the local tarot cards used by the draw flow.</p>
      </div>
    </div>

    <div class="grid two">
      <form class="panel form-grid" @submit.prevent="saveCard">
        <h2>{{ editingId ? 'Edit card' : 'Add card' }}</h2>
        <p v-if="error" class="error">{{ error }}</p>

        <div class="field">
          <label for="name">Name</label>
          <input id="name" v-model="form.name" required>
        </div>

        <div class="field">
          <label for="arcana">Arcana</label>
          <select id="arcana" v-model="form.arcana">
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>

        <div class="field">
          <label for="suit">Suit</label>
          <input id="suit" v-model="form.suit" placeholder="cups, swords, pentacles, wands">
        </div>

        <div class="field">
          <label for="number">Number or rank</label>
          <input id="number" v-model="form.number">
        </div>

        <div class="field">
          <label for="upright">Upright meaning</label>
          <textarea id="upright" v-model="form.uprightMeaning" required />
        </div>

        <div class="field">
          <label for="reversed">Reversed meaning</label>
          <textarea id="reversed" v-model="form.reversedMeaning" required />
        </div>

        <div class="field">
          <label for="description">Description</label>
          <textarea id="description" v-model="form.description" />
        </div>

        <div class="actions">
          <button class="primary" type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save card' }}</button>
          <button type="button" @click="resetForm">Clear</button>
        </div>
      </form>

      <div class="panel">
        <table class="table">
          <thead>
            <tr>
              <th>Card</th>
              <th>Arcana</th>
              <th>Meaning</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="card in cards" :key="card.id">
              <td>
                <strong>{{ card.name }}</strong>
                <div class="muted">{{ card.number || 'No number' }}</div>
              </td>
              <td>{{ card.arcana }}</td>
              <td>{{ card.uprightMeaning }}</td>
              <td>
                <div class="actions">
                  <button type="button" @click="editCard(card)">Edit</button>
                  <button class="danger" type="button" @click="deleteCard(card)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Create draw page**

Create `pages/draw.vue`:

```vue
<script setup lang="ts">
import type { Reading } from '~/types/tarot'

const question = ref('')
const spreadType = ref('single')
const reading = ref<Reading | null>(null)
const error = ref('')
const drawing = ref(false)

function meaningFor(entry: Reading['cards'][number]) {
  return entry.orientation === 'upright'
    ? entry.card.uprightMeaning
    : entry.card.reversedMeaning
}

async function drawCards() {
  error.value = ''
  reading.value = null
  drawing.value = true

  try {
    reading.value = await $fetch<Reading>('/api/readings/draw', {
      method: 'POST',
      body: {
        question: question.value,
        spreadType: spreadType.value
      }
    })
  } catch (err: any) {
    error.value = err?.statusMessage || err?.data?.statusMessage || 'Unable to draw cards'
  } finally {
    drawing.value = false
  }
}
</script>

<template>
  <section>
    <div class="section-header">
      <div>
        <h1>Draw Cards</h1>
        <p>Ask a question, select a spread, and save the reading with a mock interpretation.</p>
      </div>
    </div>

    <div class="grid two">
      <form class="panel form-grid" @submit.prevent="drawCards">
        <div class="field">
          <label for="question">Question</label>
          <textarea id="question" v-model="question" required placeholder="What should I understand right now?" />
        </div>

        <div class="field">
          <label for="spread">Spread</label>
          <select id="spread" v-model="spreadType">
            <option value="single">Single card</option>
            <option value="past_present_future">Past / Present / Future</option>
          </select>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="primary" type="submit" :disabled="drawing">{{ drawing ? 'Drawing...' : 'Draw and save' }}</button>
      </form>

      <div class="panel">
        <h2>Result</h2>
        <p v-if="!reading" class="muted">Your saved reading will appear here.</p>

        <div v-else class="grid">
          <div class="card-grid">
            <article v-for="entry in reading.cards" :key="entry.id" class="tarot-card reading-card">
              <span class="badge">{{ entry.position }} · {{ entry.orientation }}</span>
              <h3>{{ entry.card.name }}</h3>
              <p>{{ meaningFor(entry) }}</p>
            </article>
          </div>

          <article class="panel">
            <h3>Mock interpretation</h3>
            <p style="white-space: pre-line">{{ reading.interpretations[0]?.content }}</p>
          </article>

          <NuxtLink :to="`/readings/${reading.id}`">Open saved reading</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Create readings list page**

Create `pages/readings/index.vue`:

```vue
<script setup lang="ts">
import type { Reading } from '~/types/tarot'

const { data: readings, refresh } = await useFetch<Reading[]>('/api/readings', {
  default: () => []
})

const error = ref('')

async function deleteReading(reading: Reading) {
  error.value = ''

  try {
    await $fetch(`/api/readings/${reading.id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (err: any) {
    error.value = err?.statusMessage || err?.data?.statusMessage || 'Unable to delete reading'
  }
}
</script>

<template>
  <section>
    <div class="section-header">
      <div>
        <h1>Reading History</h1>
        <p>Review saved tarot readings and their generated interpretation text.</p>
      </div>
      <NuxtLink to="/draw">
        <button class="primary" type="button">New reading</button>
      </NuxtLink>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="grid">
      <article v-for="reading in readings" :key="reading.id" class="panel">
        <div class="section-header">
          <div>
            <span class="badge">{{ reading.spreadType }} · {{ reading.status }}</span>
            <h2>{{ reading.question }}</h2>
            <p class="muted">{{ new Date(reading.createdAt).toLocaleString() }}</p>
          </div>
          <div class="actions">
            <NuxtLink :to="`/readings/${reading.id}`">
              <button type="button">Open</button>
            </NuxtLink>
            <button class="danger" type="button" @click="deleteReading(reading)">Delete</button>
          </div>
        </div>

        <p class="muted">
          {{ reading.cards.map((entry) => `${entry.position}: ${entry.card.name} (${entry.orientation})`).join(' · ') }}
        </p>
        <p>{{ reading.interpretations[0]?.content.slice(0, 180) }}...</p>
      </article>

      <p v-if="readings.length === 0" class="panel muted">No readings saved yet.</p>
    </div>
  </section>
</template>
```

- [ ] **Step 5: Create reading detail page**

Create `pages/readings/[id].vue`:

```vue
<script setup lang="ts">
import type { Reading } from '~/types/tarot'

const route = useRoute()
const id = route.params.id

const { data: reading, refresh, error: fetchError } = await useFetch<Reading>(`/api/readings/${id}`)

const question = ref('')
const status = ref('interpreted')
const saving = ref(false)
const saveError = ref('')

watchEffect(() => {
  if (reading.value) {
    question.value = reading.value.question
    status.value = reading.value.status
  }
})

function meaningFor(entry: Reading['cards'][number]) {
  return entry.orientation === 'upright'
    ? entry.card.uprightMeaning
    : entry.card.reversedMeaning
}

async function saveReading() {
  saveError.value = ''
  saving.value = true

  try {
    await $fetch(`/api/readings/${id}`, {
      method: 'PUT',
      body: {
        question: question.value,
        status: status.value
      }
    })
    await refresh()
  } catch (err: any) {
    saveError.value = err?.statusMessage || err?.data?.statusMessage || 'Unable to save reading'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section>
    <div class="section-header">
      <div>
        <h1>Reading Detail</h1>
        <p>Review the spread, cards, and saved interpretation.</p>
      </div>
      <NuxtLink to="/readings">
        <button type="button">Back to history</button>
      </NuxtLink>
    </div>

    <p v-if="fetchError" class="error">Reading not found.</p>

    <div v-else-if="reading" class="grid two">
      <form class="panel form-grid" @submit.prevent="saveReading">
        <div class="field">
          <label for="question">Question</label>
          <textarea id="question" v-model="question" required />
        </div>

        <div class="field">
          <label for="status">Status</label>
          <select id="status" v-model="status">
            <option value="draft">Draft</option>
            <option value="interpreted">Interpreted</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <p v-if="saveError" class="error">{{ saveError }}</p>

        <button class="primary" type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save reading' }}</button>
      </form>

      <div class="grid">
        <div class="card-grid">
          <article v-for="entry in reading.cards" :key="entry.id" class="tarot-card reading-card">
            <span class="badge">{{ entry.position }} · {{ entry.orientation }}</span>
            <h3>{{ entry.card.name }}</h3>
            <p>{{ meaningFor(entry) }}</p>
          </article>
        </div>

        <article class="panel">
          <h2>Interpretation</h2>
          <p style="white-space: pre-line">{{ reading.interpretations[0]?.content }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
```

## Task 7: Generate, Run, And Verify

**Files:**
- Modify if needed: any files that fail typecheck or runtime verification.

- [ ] **Step 1: Generate Nuxt and Prisma artifacts**

Run:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
```

Expected: dependencies install; Prisma client is generated; SQLite database is created and seeded.

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: command exits with status 0. If Nuxt 4 scaffold package versions change the generated TypeScript setup, update `package.json` and generated Nuxt config to the installed version's expected shape, then rerun.

- [ ] **Step 3: Start dev server**

Run:

```bash
pnpm dev
```

Expected: Nuxt starts on `http://localhost:3000`.

- [ ] **Step 4: Verify API behavior**

Run in another terminal:

```bash
curl -s http://localhost:3000/api/cards
curl -s -X POST http://localhost:3000/api/readings/draw -H 'content-type: application/json' -d '{"question":"What should I focus on today?","spreadType":"past_present_future"}'
curl -s http://localhost:3000/api/readings
```

Expected: cards list returns sample cards; draw returns a saved reading with three cards; readings list includes the saved reading.

- [ ] **Step 5: Verify frontend routes**

Open:

```text
http://localhost:3000/
http://localhost:3000/cards
http://localhost:3000/draw
http://localhost:3000/readings
```

Expected:

- Home links navigate to all feature pages.
- Cards page can create, edit, and delete unused cards.
- Draw page saves single-card and three-card readings.
- Readings page lists saved readings and deletes readings.
- Reading detail page edits the question and status.

- [ ] **Step 6: Verify protected delete behavior**

Use the frontend or API to try deleting a card that appears in a saved reading.

Expected: API returns status 409 with `Card is used by saved readings and cannot be deleted`, and the frontend shows that message.

## Self-Review

- Spec coverage: card library CRUD is covered by Tasks 2, 4, and 6; draw and reading history are covered by Tasks 5 and 6; local database is covered by Task 2; mock AI boundary is covered by Task 3; verification is covered by Task 7.
- Placeholder scan: no task depends on an unspecified future implementation.
- Type consistency: frontend `types/tarot.ts` matches Prisma include shapes used by reading APIs.
