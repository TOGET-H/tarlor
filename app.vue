<script setup lang="ts">
import { normalizeTheme, oracleThemes, useOracleTheme, type OracleTheme } from '~/utils/oracle'

const route = useRoute()
const router = useRouter()
const theme = useOracleTheme()
const themeCookie = useCookie<OracleTheme>('oracle-theme', { default: () => 'blue' })

theme.value = normalizeTheme(themeCookie.value)

function firstQueryValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value
}

watch(
  () => route.query.theme,
  (value) => {
    const queryTheme = firstQueryValue(value)

    if (queryTheme) {
      theme.value = normalizeTheme(queryTheme)
    }
  },
  { immediate: true }
)

watch(theme, (nextTheme) => {
  themeCookie.value = nextTheme
}, { immediate: true })

function selectTheme(nextTheme: OracleTheme) {
  theme.value = nextTheme

  if (route.query.theme) {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        theme: nextTheme
      }
    })
  }
}
</script>

<template>
  <div :class="['app-shell', `theme-${theme}`]">
    <header class="topbar">
      <NuxtLink class="brand" to="/">
        <span class="brand-mark" aria-hidden="true">O</span>
        <span>
          <small>Digital</small>
          Oracle
        </span>
      </NuxtLink>

      <nav class="nav-links" aria-label="主导航">
        <NuxtLink to="/">入口</NuxtLink>
        <NuxtLink to="/draw">抽牌</NuxtLink>
        <NuxtLink to="/readings">记录</NuxtLink>
        <NuxtLink to="/cards">牌库</NuxtLink>
      </nav>

      <div class="global-theme-switch" aria-label="全局主题">
        <button
          v-for="item in oracleThemes"
          :key="item.key"
          class="theme-swatch"
          :class="[item.key, { 'is-active': theme === item.key }]"
          type="button"
          :aria-label="`切换到${item.name}主题`"
          @click="selectTheme(item.key)"
        />
      </div>
    </header>

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>
