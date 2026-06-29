<script setup lang="ts">
import type { TarotCard } from '~/types/tarot'

const { data: cards } = await useFetch<TarotCard[]>('/api/cards', {
  default: () => []
})

const arcanaFilters = [
  { value: 'all', label: '全部' },
  { value: 'major', label: '大阿尔卡那' },
  { value: 'minor', label: '小阿尔卡那' }
] as const

const activeArcana = ref<(typeof arcanaFilters)[number]['value']>('all')
const brokenImageIds = ref<number[]>([])

const filteredCards = computed(() => {
  if (activeArcana.value === 'all') {
    return cards.value
  }

  return cards.value.filter((card) => card.arcana === activeArcana.value)
})

function arcanaLabel(value: string) {
  return value === 'major' ? '大阿尔卡那' : '小阿尔卡那'
}

function cardMeta(card: TarotCard) {
  return [
    arcanaLabel(card.arcana),
    card.suit,
    card.number
  ].filter(Boolean).join(' / ')
}

function hasCardImage(card: TarotCard) {
  return Boolean(card.imageUrl && !brokenImageIds.value.includes(card.id))
}

function markBrokenImage(cardId: number) {
  if (!brokenImageIds.value.includes(cardId)) {
    brokenImageIds.value = [...brokenImageIds.value, cardId]
  }
}
</script>

<template>
  <section class="oracle-page deck-page">
    <div class="section-header deck-header">
      <div>
        <p class="eyebrow">Deck Gallery</p>
        <h1>塔罗牌库</h1>
        <p>完整 78 张本地牌面。这里仅展示牌库，不再提供自定义新增和编辑。</p>
      </div>

      <div class="deck-filters" aria-label="牌库筛选">
        <button
          v-for="filter in arcanaFilters"
          :key="filter.value"
          type="button"
          :class="{ primary: activeArcana === filter.value }"
          @click="activeArcana = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div class="deck-gallery" aria-live="polite">
      <article v-for="card in filteredCards" :key="card.id" class="deck-card">
        <div class="deck-card-image">
          <img
            v-if="hasCardImage(card)"
            :src="card.imageUrl || ''"
            :alt="card.name"
            loading="lazy"
            @error="markBrokenImage(card.id)"
          >
          <div v-else class="deck-card-fallback">
            <strong>{{ card.name }}</strong>
          </div>
        </div>

        <div class="deck-card-copy">
          <span class="badge">{{ cardMeta(card) }}</span>
          <h2>{{ card.name }}</h2>
          <p>{{ card.uprightMeaning }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
