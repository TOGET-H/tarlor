<script setup lang="ts">
import type { Reading } from '~/types/tarot'
import { deleteLocalReading, getLocalReadings } from '~/utils/localReadings'
import {
  cardSummary,
  formatReadingDate,
  latestInterpretation,
  orientationLabels,
  positionLabels,
  spreadOptions,
  statusLabels,
  tarotCardThumbnailUrl
} from '~/utils/oracle'

const readings = ref<Reading[]>([])
const error = ref('')

const spreadLabels = Object.fromEntries(
  spreadOptions.map((spread) => [spread.value, spread.label])
) as Record<string, string>

function refreshReadings() {
  readings.value = getLocalReadings()
}

onMounted(refreshReadings)

function deleteReading(reading: Reading) {
  error.value = ''

  const deleted = deleteLocalReading(reading.id)

  if (!deleted) {
    error.value = '删除记录失败，请确认这条记录仍存在于当前浏览器。'
    return
  }

  refreshReadings()
}
</script>

<template>
  <section class="oracle-page">
    <div class="section-header">
      <div>
        <p class="eyebrow">Archive</p>
        <h1>解读记录</h1>
        <p>每一次抽牌都会保存在当前浏览器。打开记录可以继续编辑问题、归档状态，或导出长图。</p>
      </div>
      <NuxtLink to="/draw">
        <button class="primary" type="button">新建抽牌</button>
      </NuxtLink>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="readings.length > 0" class="records-wall">
      <article v-for="reading in readings" :key="reading.id" class="record-card">
        <div class="record-meta">
          <span class="badge">
            {{ spreadLabels[reading.spreadType] ?? reading.spreadType }} · {{ statusLabels[reading.status] ?? reading.status }}
          </span>
          <span class="muted">{{ formatReadingDate(reading.createdAt) }}</span>
        </div>

        <h2>{{ reading.question }}</h2>

        <div class="record-card-list">
          <span v-for="entry in reading.cards" :key="entry.id">
            {{ positionLabels[entry.position] ?? entry.position }} /
            {{ entry.card.name }} /
            {{ orientationLabels[entry.orientation] ?? entry.orientation }}
          </span>
        </div>

        <div class="record-card-images" aria-label="本次抽到的牌面">
          <img
            v-for="entry in reading.cards"
            :key="entry.id"
            :src="tarotCardThumbnailUrl(entry.card.imageUrl) || entry.card.imageUrl || ''"
            :alt="entry.card.name"
            loading="lazy"
            decoding="async"
          >
        </div>

        <p class="record-summary">{{ cardSummary(reading) }}</p>
        <p class="record-interpretation">{{ latestInterpretation(reading) }}</p>

        <div class="actions record-actions">
          <NuxtLink :to="`/readings/${reading.id}`">
            <button class="primary" type="button">打开记录</button>
          </NuxtLink>
          <button class="danger" type="button" @click="deleteReading(reading)">删除</button>
        </div>
      </article>
    </div>

    <div v-else class="panel">
      <p class="eyebrow">Empty Archive</p>
      <h2>还没有保存任何解读</h2>
      <p class="muted">从一次抽牌开始，系统会自动把牌阵、牌面和解读内容保存到当前浏览器。</p>
      <NuxtLink to="/draw">
        <button class="primary" type="button">开始占卜</button>
      </NuxtLink>
    </div>
  </section>
</template>
