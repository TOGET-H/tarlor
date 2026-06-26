<script setup lang="ts">
import type { Reading } from '~/types/tarot'

const { data: readings, refresh } = await useFetch<Reading[]>('/api/readings', {
  default: () => []
})

const error = ref('')

const spreadLabels: Record<string, string> = {
  single: '单张牌',
  past_present_future: '过去 / 现在 / 未来'
}

const statusLabels: Record<string, string> = {
  draft: '草稿',
  interpreted: '已解读',
  archived: '已归档'
}

const positionLabels: Record<string, string> = {
  single: '核心提示',
  past: '过去',
  present: '现在',
  future: '未来'
}

const orientationLabels: Record<string, string> = {
  upright: '正位',
  reversed: '逆位'
}

function getErrorMessage(err: unknown, fallback: string) {
  const value = err as { statusMessage?: string, data?: { statusMessage?: string } }
  return value.statusMessage || value.data?.statusMessage || fallback
}

async function deleteReading(reading: Reading) {
  error.value = ''

  try {
    await $fetch(`/api/readings/${reading.id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (err) {
    error.value = getErrorMessage(err, '删除记录失败')
  }
}
</script>

<template>
  <section>
    <div class="section-header">
      <div>
        <h1>抽牌记录</h1>
        <p>查看已保存的塔罗抽牌记录和生成的解读文本。</p>
      </div>
      <NuxtLink to="/draw">
        <button class="primary" type="button">新建抽牌</button>
      </NuxtLink>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="grid">
      <article v-for="reading in readings" :key="reading.id" class="panel">
        <div class="section-header">
          <div>
            <span class="badge">{{ spreadLabels[reading.spreadType] }} · {{ statusLabels[reading.status] }}</span>
            <h2>{{ reading.question }}</h2>
            <p class="muted">{{ new Date(reading.createdAt).toLocaleString() }}</p>
          </div>
          <div class="actions">
            <NuxtLink :to="`/readings/${reading.id}`">
              <button type="button">打开</button>
            </NuxtLink>
            <button class="danger" type="button" @click="deleteReading(reading)">删除</button>
          </div>
        </div>

        <p class="muted">
          {{ reading.cards.map((entry) => `${positionLabels[entry.position]}：${entry.card.name}（${orientationLabels[entry.orientation]}）`).join(' · ') }}
        </p>
        <p>{{ reading.interpretations[0]?.content.slice(0, 180) }}...</p>
      </article>

      <p v-if="readings.length === 0" class="panel muted">还没有保存任何抽牌记录。</p>
    </div>
  </section>
</template>
