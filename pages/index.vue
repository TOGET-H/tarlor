<script setup lang="ts">
import { oracleThemes, spreadOptions, useOracleTheme, type OracleTheme, type SpreadType } from '~/utils/oracle'

const router = useRouter()

const question = ref('')
const spreadType = ref<SpreadType>('single')
const theme = useOracleTheme()

function selectTheme(nextTheme: OracleTheme) {
  theme.value = nextTheme
}

function startReading() {
  router.push({
    path: '/draw',
    query: {
      question: question.value.trim(),
      spread: spreadType.value,
      theme: theme.value
    }
  })
}
</script>

<template>
  <section class="oracle-page">
    <div class="hero-oracle">
      <div class="oracle-entry">
        <div>
          <p class="eyebrow">Digital Oracle</p>
          <h1 class="hero-title">在静默中遇见答案</h1>
          <p class="hero-copy">
            写下问题，选择牌阵。<br>
            洗牌、翻牌与解读会保存成记录。
          </p>
        </div>

        <form class="intent-card" @submit.prevent="startReading">
          <div class="field">
            <label for="question">你的问题</label>
            <textarea
              id="question"
              v-model="question"
              required
              placeholder="例如：我现在应该如何面对这段关系？"
            />
          </div>

          <div class="field">
            <label>选择牌阵</label>
            <div class="spread-options">
              <button
                v-for="spread in spreadOptions"
                :key="spread.value"
                class="spread-option"
                :class="{ 'is-active': spreadType === spread.value }"
                type="button"
                @click="spreadType = spread.value"
              >
                <strong>{{ spread.label }}</strong>
                <span>{{ spread.description }}</span>
              </button>
            </div>
          </div>

          <div class="field">
            <label>四色设计</label>
            <div class="theme-dial">
              <button
                v-for="item in oracleThemes"
                :key="item.key"
                class="theme-dot"
                :class="[item.key, { 'is-active': theme === item.key }]"
                type="button"
                @click="selectTheme(item.key)"
              >
                {{ item.name }}
              </button>
            </div>
          </div>

          <div class="actions">
            <button class="primary" type="submit">开始占卜</button>
            <NuxtLink to="/readings">
              <button class="ghost" type="button">查看记录</button>
            </NuxtLink>
          </div>
        </form>

        <div class="mini-links">
          <NuxtLink to="/draw">直接进入抽牌</NuxtLink>
          <NuxtLink to="/cards">维护本地牌库</NuxtLink>
          <NuxtLink to="/readings">回看解读历史</NuxtLink>
        </div>
      </div>

      <div class="card-altar" aria-hidden="true">
        <div class="oracle-card-back large" />
      </div>
    </div>
  </section>
</template>
