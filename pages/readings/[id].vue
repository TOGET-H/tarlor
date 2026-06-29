<script setup lang="ts">
import type { Reading } from '~/types/tarot'
import {
  downloadReadingImage,
  formatReadingDate,
  latestInterpretation,
  meaningFor,
  orientationLabels,
  positionLabels,
  spreadOptions,
  statusLabels
} from '~/utils/oracle'

const route = useRoute()
const id = route.params.id

const { data: reading, refresh, error: fetchError } = await useFetch<Reading>(`/api/readings/${id}`)

const question = ref('')
const status = ref('interpreted')
const saving = ref(false)
const exporting = ref(false)
const saveError = ref('')
const exportError = ref('')
const brokenImageIds = ref<number[]>([])

const spreadLabels = Object.fromEntries(
  spreadOptions.map((spread) => [spread.value, spread.label])
) as Record<string, string>

watchEffect(() => {
  if (reading.value) {
    question.value = reading.value.question
    status.value = reading.value.status
  }
})

function getErrorMessage(err: unknown, fallback: string) {
  const value = err as { statusMessage?: string, data?: { statusMessage?: string } }
  return value.statusMessage || value.data?.statusMessage || fallback
}

function hasCardImage(cardId: number, imageUrl: string | null) {
  return Boolean(imageUrl && !brokenImageIds.value.includes(cardId))
}

function markBrokenImage(cardId: number) {
  if (!brokenImageIds.value.includes(cardId)) {
    brokenImageIds.value = [...brokenImageIds.value, cardId]
  }
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
  } catch (err) {
    saveError.value = getErrorMessage(err, '保存记录失败')
  } finally {
    saving.value = false
  }
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
  <section class="oracle-page">
    <div class="section-header">
      <div>
        <p class="eyebrow">Saved Reading</p>
        <h1>记录详情</h1>
        <p>查看这次牌阵、牌面、正逆位和已保存的解读内容。</p>
      </div>
      <div class="actions">
        <NuxtLink to="/readings">
          <button type="button">返回记录</button>
        </NuxtLink>
        <NuxtLink to="/draw">
          <button class="primary" type="button">新建抽牌</button>
        </NuxtLink>
      </div>
    </div>

    <p v-if="fetchError" class="error">没有找到这条记录。</p>

    <div v-else-if="reading" class="detail-layout">
      <aside class="panel form-grid">
        <div>
          <p class="eyebrow">Metadata</p>
          <h2>编辑记录</h2>
          <p class="muted">
            {{ spreadLabels[reading.spreadType] ?? reading.spreadType }} ·
            {{ statusLabels[reading.status] ?? reading.status }} ·
            {{ formatReadingDate(reading.createdAt) }}
          </p>
        </div>

        <form class="form-grid" @submit.prevent="saveReading">
          <div class="field">
            <label for="question">问题</label>
            <textarea id="question" v-model="question" required />
          </div>

          <div class="field">
            <label for="status">状态</label>
            <select id="status" v-model="status">
              <option value="draft">草稿</option>
              <option value="interpreted">已解读</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <p v-if="saveError" class="error">{{ saveError }}</p>

          <button class="primary" type="submit" :disabled="saving">
            {{ saving ? '保存中...' : '保存记录' }}
          </button>
        </form>

        <div class="actions">
          <button type="button" :disabled="exporting" @click="exportReading">
            {{ exporting ? '生成中...' : '保存解读长图' }}
          </button>
        </div>
        <p v-if="exportError" class="export-error">{{ exportError }}</p>
      </aside>

      <div class="grid detail-main">
        <section class="draw-stage reveal-board">
          <div>
            <p class="eyebrow">Spread</p>
            <h2>{{ reading.question }}</h2>
          </div>

          <div class="saved-spread-grid">
            <article v-for="entry in reading.cards" :key="entry.id" class="saved-card">
              <div class="saved-card-art">
                <img
                  v-if="hasCardImage(entry.card.id, entry.card.imageUrl)"
                  :src="entry.card.imageUrl || ''"
                  :alt="entry.card.name"
                  loading="lazy"
                  @error="markBrokenImage(entry.card.id)"
                >
                <div v-else class="saved-card-fallback">
                  <span>{{ positionLabels[entry.position] ?? entry.position }}</span>
                  <strong>{{ entry.card.name }}</strong>
                  <span>{{ orientationLabels[entry.orientation] ?? entry.orientation }}</span>
                </div>
              </div>

              <div>
                <span class="badge">
                  {{ positionLabels[entry.position] ?? entry.position }} · {{ orientationLabels[entry.orientation] ?? entry.orientation }}
                </span>
                <h3>{{ entry.card.name }}</h3>
                <p>{{ meaningFor(entry) }}</p>
              </div>
            </article>
          </div>
        </section>

        <article class="report-panel">
          <p class="eyebrow">Interpretation</p>
          <h2>解读内容</h2>
          <p class="interpretation">{{ latestInterpretation(reading) }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
