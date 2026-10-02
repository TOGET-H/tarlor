<script setup lang="ts">
import { durations, findPractice, goals, practices, type Duration, type Goal, type PracticeId } from '~/utils/meditation'
const route = useRoute()
const selectedGoal = ref<Goal>('concentrate')
const selectedId = ref<PracticeId>('breath')
const duration = ref<Duration>(5)
const selected = computed(() => findPractice(selectedId.value) ?? practices[0]!)
const recommended = computed(() => practices.filter(item => item.goals.includes(selectedGoal.value)))
const categories = [
  { id: 'focus', english: 'Focused Attention', label: '专注类冥想', description: '把注意力固定在一个对象上' },
  { id: 'awareness', english: 'Open Awareness', label: '觉察 / 正念', description: '看见念头和身体感受，不急着评判' }
]
const notice = computed(() => typeof route.query.notice === 'string' ? route.query.notice : '')
</script>

<template>
  <section class="meditation-page">
    <header class="meditation-intro">
      <div><p class="eyebrow">Meditation Practice</p><h1>此刻，回到自己</h1></div>
      <p>从一个清晰对象开始，或只是看见此刻正在发生什么。选择练习和时长，不需要登录，也不会保存记录。</p>
    </header>
    <p v-if="notice" class="meditation-notice" role="status">{{ notice }}</p>
    <section class="meditation-goal-section" aria-labelledby="meditation-goal-title">
      <div class="meditation-section-heading"><p id="meditation-goal-title">你现在需要什么？</p><span>先按目标找到入口，也可以浏览下方全部练习</span></div>
      <div class="meditation-goals" aria-label="当前目标">
        <button v-for="goal in goals" :key="goal.value" class="meditation-goal" :class="{ 'is-active': selectedGoal === goal.value }" type="button" :aria-pressed="selectedGoal === goal.value" @click="selectedGoal = goal.value">
          <strong>{{ goal.label }}</strong><span>{{ goal.description }}</span>
        </button>
      </div>
      <div class="meditation-recommendations" aria-live="polite"><span>适合此刻</span>
        <button v-for="item in recommended" :key="item.id" type="button" :class="{ 'is-active': selectedId === item.id }" @click="selectedId = item.id">{{ item.label }}</button>
      </div>
    </section>
    <div class="meditation-browser">
      <div class="meditation-catalog" aria-label="全部冥想练习">
        <section v-for="category in categories" :key="category.id" class="meditation-category" :aria-labelledby="`${category.id}-category-title`">
          <div class="meditation-category-heading"><div><p class="eyebrow">{{ category.english }}</p><h2 :id="`${category.id}-category-title`">{{ category.label }}</h2></div><span>{{ category.description }}</span></div>
          <div class="meditation-practice-list">
            <button v-for="(item, index) in practices.filter(item => item.category === category.id)" :key="item.id" class="meditation-practice-row" :class="{ 'is-active': selectedId === item.id }" type="button" :aria-pressed="selectedId === item.id" @click="selectedId = item.id">
              <span class="meditation-practice-index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span><span class="meditation-row-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>
      <aside class="meditation-detail" aria-live="polite">
        <div class="meditation-detail-orbit" :class="`visual-${selected.visual}`" aria-hidden="true"><span /><span /><span /></div>
        <div class="meditation-detail-copy"><p class="eyebrow">{{ selected.englishLabel }}</p><h2>{{ selected.label }}</h2><p>{{ selected.description }}</p></div>
        <div class="meditation-preparation"><span>开始前</span><p>{{ selected.preparation }}</p></div>
        <fieldset class="meditation-duration-field"><legend>练习时长</legend><div class="meditation-duration-options">
          <button v-for="minutes in durations" :key="minutes" type="button" :class="{ 'is-active': duration === minutes }" :aria-pressed="duration === minutes" @click="duration = minutes"><strong>{{ minutes }}</strong><span>分钟</span></button>
        </div></fieldset>
        <NuxtLink class="primary meditation-start-link" :to="{ path: `/meditation/${selected.id}`, query: { duration } }">开始练习 <span aria-hidden="true">→</span></NuxtLink>
      </aside>
    </div>
  </section>
</template>
