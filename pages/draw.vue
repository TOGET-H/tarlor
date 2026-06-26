<script setup lang="ts">
import type { Reading } from '~/types/tarot'

const question = ref('')
const spreadType = ref('single')
const reading = ref<Reading | null>(null)
const error = ref('')
const drawing = ref(false)

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
  } catch (err) {
    error.value = getErrorMessage(err, '抽牌失败')
  } finally {
    drawing.value = false
  }
}
</script>

<template>
  <section>
    <div class="section-header">
      <div>
        <h1>抽牌</h1>
        <p>输入你的问题，选择牌阵，系统会抽牌并保存一条带模拟解读的记录。</p>
      </div>
    </div>

    <div class="grid two">
      <form class="panel form-grid" @submit.prevent="drawCards">
        <div class="field">
          <label for="question">问题</label>
          <textarea id="question" v-model="question" required placeholder="我现在最需要理解什么？" />
        </div>

        <div class="field">
          <label for="spread">牌阵</label>
          <select id="spread" v-model="spreadType">
            <option value="single">单张牌</option>
            <option value="past_present_future">过去 / 现在 / 未来</option>
          </select>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="primary" type="submit" :disabled="drawing">
          {{ drawing ? '抽牌中...' : '抽牌并保存' }}
        </button>
      </form>

      <div class="panel">
        <h2>抽牌结果</h2>
        <p v-if="!reading" class="muted">保存后的抽牌结果会显示在这里。</p>

        <div v-else class="grid">
          <div class="card-grid">
            <article v-for="entry in reading.cards" :key="entry.id" class="tarot-card reading-card">
              <span class="badge">{{ positionLabels[entry.position] }} · {{ orientationLabels[entry.orientation] }}</span>
              <h3>{{ entry.card.name }}</h3>
              <p>{{ meaningFor(entry) }}</p>
            </article>
          </div>

          <article class="panel">
            <h3>模拟解读</h3>
            <p class="interpretation">{{ reading.interpretations[0]?.content }}</p>
          </article>

          <NuxtLink :to="`/readings/${reading.id}`">打开已保存记录</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
