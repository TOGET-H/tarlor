<script setup lang="ts">
import type { Reading } from '~/types/tarot'
import {
  cardSummary,
  downloadReadingImage,
  formatReadingDate,
  latestInterpretation,
  meaningFor,
  normalizeSpread,
  orientationLabels,
  positionLabels,
  spreadOptions,
  type SpreadType
} from '~/utils/oracle'

type DrawStage = 'prepare' | 'shuffling' | 'reveal'

const route = useRoute()
const router = useRouter()

function firstQueryValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value
}

const question = ref(String(firstQueryValue(route.query.question) || ''))
const spreadType = ref<SpreadType>(normalizeSpread(firstQueryValue(route.query.spread)))
const reading = ref<Reading | null>(null)
const stage = ref<DrawStage>('prepare')
const revealedIds = ref<number[]>([])
const error = ref('')
const exportError = ref('')
const drawing = ref(false)
const exporting = ref(false)
const followUp = ref('我该如何行动？')
const readerNote = ref('')
const brokenImageIds = ref<number[]>([])

const followUpPrompts = [
  '我该如何行动？',
  '我需要避开什么？',
  '这件事真正的阻碍是什么？',
  '未来三天我该关注什么？'
]

const initialReadingId = firstQueryValue(route.query.reading)

if (initialReadingId) {
  const { data: savedReading, error: savedReadingError } = await useFetch<Reading>(
    `/api/readings/${initialReadingId}`
  )

  if (savedReading.value) {
    reading.value = savedReading.value
    question.value = savedReading.value.question
    spreadType.value = normalizeSpread(savedReading.value.spreadType)
    stage.value = 'reveal'
    revealedIds.value = []
  } else if (savedReadingError.value) {
    error.value = '没有找到这条抽牌记录'
  }
}

const selectedSpread = computed(() => {
  return spreadOptions.find((spread) => spread.value === spreadType.value) ?? spreadOptions[0]!
})

const revealedCount = computed(() => revealedIds.value.length)
const allRevealed = computed(() => {
  return Boolean(reading.value && revealedCount.value >= reading.value.cards.length)
})

function getErrorMessage(err: unknown, fallback: string) {
  const value = err as { statusMessage?: string, data?: { statusMessage?: string } }
  return value.statusMessage || value.data?.statusMessage || fallback
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function drawCards() {
  error.value = ''
  exportError.value = ''
  reading.value = null
  revealedIds.value = []
  drawing.value = true
  stage.value = 'shuffling'

  try {
    const [result] = await Promise.all([
      $fetch<Reading>('/api/readings/draw', {
        method: 'POST',
        body: {
          question: question.value,
          spreadType: spreadType.value
        }
      }),
      delay(1300)
    ])

    reading.value = result
    stage.value = 'reveal'
    router.replace({
      path: '/draw',
      query: {
        reading: result.id
      }
    })
  } catch (err) {
    error.value = getErrorMessage(err, '抽牌失败')
    stage.value = 'prepare'
  } finally {
    drawing.value = false
  }
}

function revealCard(id: number) {
  if (!revealedIds.value.includes(id)) {
    revealedIds.value = [...revealedIds.value, id]
  }
}

function hasCardImage(cardId: number, imageUrl: string | null) {
  return Boolean(imageUrl && !brokenImageIds.value.includes(cardId))
}

function markBrokenImage(cardId: number) {
  if (!brokenImageIds.value.includes(cardId)) {
    brokenImageIds.value = [...brokenImageIds.value, cardId]
  }
}

function revealAll() {
  if (reading.value) {
    revealedIds.value = reading.value.cards.map((entry) => entry.id)
  }
}

function resetReading() {
  reading.value = null
  revealedIds.value = []
  stage.value = 'prepare'
  exportError.value = ''
  router.replace({
    path: '/draw'
  })
}

async function exportReading() {
  if (!reading.value) {
    return
  }

  exportError.value = ''
  exporting.value = true

  try {
    await downloadReadingImage(reading.value)
  } catch (err) {
    exportError.value = getErrorMessage(err, '导出长图失败')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="oracle-page draw-page">
    <div class="section-header">
      <div>
        <p class="eyebrow">Oracle Reading</p>
        <h1>抽牌仪式</h1>
        <p>写下问题，等待洗牌，亲手揭开牌面，再把这次解读保存为记录或长图。</p>
      </div>
    </div>

    <div class="draw-shell">
      <div v-if="stage === 'prepare'" class="draw-stage draw-prep">
        <form class="intent-card" @submit.prevent="drawCards">
          <div>
            <p class="eyebrow">Step 01</p>
            <h2>把问题交给牌面</h2>
            <p class="muted">问题越具体，解读越容易落到行动。当前牌阵：{{ selectedSpread.label }}。</p>
          </div>

          <div class="field">
            <label for="question">你的问题</label>
            <textarea id="question" v-model="question" required placeholder="我现在最需要看见什么？" />
          </div>

          <div class="field">
            <label>牌阵</label>
            <div class="spread-options">
              <button
                v-for="spread in spreadOptions"
                :key="spread.value"
                class="spread-option"
                :class="{ 'is-active': spreadType === spread.value }"
                type="button"
                @click="spreadType = spread.value"
              >
                <strong>{{ spread.shortLabel }}</strong>
                <span>{{ spread.description }}</span>
              </button>
            </div>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <div class="actions">
            <button class="primary" type="submit" :disabled="drawing">
              {{ drawing ? '洗牌中...' : '开始占卜' }}
            </button>
            <NuxtLink to="/readings">
              <button class="ghost" type="button">查看记录</button>
            </NuxtLink>
          </div>
        </form>

        <div class="card-altar" aria-hidden="true">
          <div class="oracle-card-back large" />
        </div>
      </div>

      <div v-else-if="stage === 'shuffling'" class="draw-stage shuffle-scene">
        <div>
          <p class="eyebrow">Oracle Reading</p>
          <h2>洗牌</h2>
          <p class="muted">感受牌在指间流动，问题正在沉入静默。</p>
          <div class="shuffle-deck" aria-hidden="true">
            <div class="shuffle-card oracle-card-back" />
            <div class="shuffle-card oracle-card-back" />
            <div class="shuffle-card oracle-card-back" />
          </div>
        </div>
      </div>

      <div v-else-if="reading" class="draw-stage reveal-board">
        <div class="section-header">
          <div>
            <p class="eyebrow">Step 02</p>
            <h2>揭示牌面</h2>
            <p class="muted">
              已保存于 {{ formatReadingDate(reading.createdAt) }}。请依次翻开 {{ reading.cards.length }} 张牌。
            </p>
          </div>
          <div class="actions">
            <button type="button" @click="revealAll">全部翻开</button>
            <button type="button" @click="resetReading">重新提问</button>
          </div>
        </div>

        <div class="reveal-grid">
          <article v-for="entry in reading.cards" :key="entry.id" class="reveal-card">
            <button
              class="flip-card"
              :class="{ 'is-revealed': revealedIds.includes(entry.id) }"
              type="button"
              :aria-label="`翻开${positionLabels[entry.position] ?? entry.position}`"
              @click="revealCard(entry.id)"
            >
              <span class="flip-inner">
                <span class="flip-face">
                  <span class="oracle-card-back" />
                </span>
                <span class="flip-face flip-front">
                  <span class="card-face-art card-face-image">
                    <img
                      v-if="hasCardImage(entry.card.id, entry.card.imageUrl)"
                      :src="entry.card.imageUrl || ''"
                      :alt="entry.card.name"
                      loading="lazy"
                      @error="markBrokenImage(entry.card.id)"
                    >
                    <span v-else class="card-face-fallback">
                      <span>{{ positionLabels[entry.position] ?? entry.position }}</span>
                      <strong>{{ entry.card.name }}</strong>
                      <span>{{ orientationLabels[entry.orientation] ?? entry.orientation }}</span>
                    </span>
                  </span>
                </span>
              </span>
            </button>

            <div class="reveal-card-copy">
              <span class="badge">
                {{ positionLabels[entry.position] ?? entry.position }} · {{ orientationLabels[entry.orientation] ?? entry.orientation }}
              </span>
              <h3>{{ revealedIds.includes(entry.id) ? entry.card.name : '等待揭示' }}</h3>
              <p>{{ revealedIds.includes(entry.id) ? meaningFor(entry) : '点击牌背翻开这一张牌。' }}</p>
            </div>
          </article>
        </div>

        <div class="report-grid">
          <article class="report-panel">
            <p class="eyebrow">Interpretation</p>
            <h2>解读报告</h2>
            <p v-if="!allRevealed" class="muted">翻开所有牌后，报告会完整呈现。你也可以直接全部翻开。</p>
            <p v-else class="interpretation">{{ latestInterpretation(reading) }}</p>
          </article>

          <aside class="report-panel followup-card">
            <p class="eyebrow">Follow Up</p>
            <h3>帮助我们做得更好</h3>
            <p class="muted">选择一个追问方向，或者写下你想补充的背景。当前版本仅用于整理思路，不会写入保存记录。</p>

            <div class="prompt-chips">
              <button
                v-for="prompt in followUpPrompts"
                :key="prompt"
                type="button"
                :class="{ primary: followUp === prompt }"
                @click="followUp = prompt"
              >
                {{ prompt }}
              </button>
            </div>

            <div class="field">
              <label for="reader-note">补充说明</label>
              <textarea id="reader-note" v-model="readerNote" placeholder="例如：我更想知道这件事接下来怎么行动。" />
            </div>

            <p class="muted">{{ cardSummary(reading) }}</p>

            <div class="saved-actions">
              <NuxtLink :to="`/readings/${reading.id}`">
                <button class="primary" type="button">打开保存记录</button>
              </NuxtLink>
              <button type="button" :disabled="exporting" @click="exportReading">
                {{ exporting ? '生成中...' : '保存解读长图' }}
              </button>
            </div>
            <p v-if="exportError" class="export-error">{{ exportError }}</p>
          </aside>
        </div>
      </div>
    </div>
  </section>
</template>
