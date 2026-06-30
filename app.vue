<script setup lang="ts">
import { normalizeTheme, oracleThemes, useOracleTheme, type OracleTheme } from '~/utils/oracle'

const theme = useOracleTheme()
const themeCookie = useCookie<OracleTheme>('oracle-theme', { default: () => 'blue' })
const shellRef = ref<HTMLElement | null>(null)
const themeGemClasses: Record<OracleTheme, string> = {
  blue: 'gem-white',
  ember: 'gem-pink',
  moss: 'gem-green',
  violet: 'gem-purple'
}

let revealFrame = 0
let revealX = 0
let revealY = 0

theme.value = normalizeTheme(themeCookie.value)

watch(theme, (nextTheme) => {
  themeCookie.value = nextTheme
}, { immediate: true })

function selectTheme(nextTheme: OracleTheme) {
  theme.value = nextTheme
}

function moveRevealWindow() {
  if (!shellRef.value) {
    revealFrame = 0
    return
  }

  shellRef.value.style.setProperty('--reveal-x', `${revealX}px`)
  shellRef.value.style.setProperty('--reveal-y', `${revealY}px`)
  revealFrame = 0
}

function handleShellPointer(event: PointerEvent) {
  revealX = event.clientX
  revealY = event.clientY

  if (!revealFrame) {
    revealFrame = window.requestAnimationFrame(moveRevealWindow)
  }
}

function resetShellPointer() {
  revealX = window.innerWidth * 0.5
  revealY = window.innerHeight * 0.44

  if (!revealFrame) {
    revealFrame = window.requestAnimationFrame(moveRevealWindow)
  }
}

onBeforeUnmount(() => {
  if (revealFrame) {
    window.cancelAnimationFrame(revealFrame)
  }
})
</script>

<template>
  <div
    ref="shellRef"
    :class="['app-shell', `theme-${theme}`]"
    @pointermove="handleShellPointer"
    @pointerleave="resetShellPointer"
  >
    <header class="nav-bar">
      <NuxtLink class="nav-logo" to="/">
        <span class="logo-icon" aria-hidden="true">O</span>
        <span class="logo-text">Digital Oracle</span>
      </NuxtLink>

      <nav class="nav-menu" aria-label="主导航">
        <NuxtLink class="nav-btn" to="/">入口</NuxtLink>
        <NuxtLink class="nav-btn" to="/draw">抽牌</NuxtLink>
        <NuxtLink class="nav-btn" to="/readings">记录</NuxtLink>
        <NuxtLink class="nav-btn" to="/cards">牌库</NuxtLink>
      </nav>

      <div class="theme-switcher" aria-label="全局主题">
        <button
          v-for="item in oracleThemes"
          :key="item.key"
          class="theme-gem"
          :class="[themeGemClasses[item.key], { active: theme === item.key }]"
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
