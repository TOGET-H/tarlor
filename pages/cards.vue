<script setup lang="ts">
import type { TarotCard } from '~/types/tarot'
import { tarotCardThumbnailUrl } from '~/utils/oracle'

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

const majorArcanaOrder: Record<string, number> = {
  '0': 0,
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
  XIII: 13,
  XIV: 14,
  XV: 15,
  XVI: 16,
  XVII: 17,
  XVIII: 18,
  XIX: 19,
  XX: 20,
  XXI: 21
}

const minorSuitOrder: Record<string, number> = {
  wands: 0,
  cups: 1,
  swords: 2,
  pentacles: 3
}

const minorNumberOrder: Record<string, number> = {
  Ace: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
  Ten: 10,
  Page: 11,
  Knight: 12,
  Queen: 13,
  King: 14
}

type TarotCardOrderKey = [number, number, number]

const sortedCards = computed(() => {
  return [...cards.value].sort(compareTarotCards)
})

const filteredCards = computed(() => {
  if (activeArcana.value === 'all') {
    return sortedCards.value
  }

  return sortedCards.value.filter((card) => card.arcana === activeArcana.value)
})

function compareTarotCards(a: TarotCard, b: TarotCard) {
  const [aArcana, aSuit, aNumber] = tarotCardOrderKey(a)
  const [bArcana, bSuit, bNumber] = tarotCardOrderKey(b)

  return aArcana - bArcana
    || aSuit - bSuit
    || aNumber - bNumber
    || a.id - b.id
}

function tarotCardOrderKey(card: TarotCard): TarotCardOrderKey {
  if (card.arcana === 'major') {
    return [
      0,
      majorArcanaOrder[card.number ?? ''] ?? 999,
      0
    ]
  }

  if (card.arcana === 'minor') {
    return [
      1,
      minorSuitOrder[card.suit ?? ''] ?? 999,
      minorNumberOrder[card.number ?? ''] ?? 999
    ]
  }

  return [2, 999, 999]
}

function arcanaLabel(value: string) {
  return value === 'major' ? '大阿尔卡那' : '小阿尔卡那'
}

function cardMeta(card: TarotCard) {
  return [
    arcanaLabel(card.arcana),
    card.number
  ].filter(Boolean).join(' / ')
}

function hasCardImage(card: TarotCard) {
  return Boolean(card.imageUrl && !brokenImageIds.value.includes(card.id))
}

function cardPreviewImage(card: TarotCard) {
  return tarotCardThumbnailUrl(card.imageUrl) || card.imageUrl || ''
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
            :src="cardPreviewImage(card)"
            :alt="card.name"
            loading="lazy"
            decoding="async"
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
