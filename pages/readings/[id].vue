<script setup lang="ts">
import type { Reading } from '~/types/tarot'

const route = useRoute()
const id = route.params.id

const { data: reading, refresh, error: fetchError } = await useFetch<Reading>(`/api/readings/${id}`)

const question = ref('')
const status = ref('interpreted')
const saving = ref(false)
const saveError = ref('')

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
  } catch (err) {
    saveError.value = getErrorMessage(err, '保存记录失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section>
    <div class="section-header">
      <div>
        <h1>记录详情</h1>
        <p>查看本次牌阵、抽到的牌面和已保存的解读内容。</p>
      </div>
      <NuxtLink to="/readings">
        <button type="button">返回记录</button>
      </NuxtLink>
    </div>

    <p v-if="fetchError" class="error">没有找到这条记录。</p>

    <div v-else-if="reading" class="grid two">
      <form class="panel form-grid" @submit.prevent="saveReading">
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

      <div class="grid">
        <div class="card-grid">
          <article v-for="entry in reading.cards" :key="entry.id" class="tarot-card reading-card">
            <span class="badge">{{ positionLabels[entry.position] }} · {{ orientationLabels[entry.orientation] }}</span>
            <h3>{{ entry.card.name }}</h3>
            <p>{{ meaningFor(entry) }}</p>
          </article>
        </div>

        <article class="panel">
          <h2>解读内容</h2>
          <p class="interpretation">{{ reading.interpretations[0]?.content }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
