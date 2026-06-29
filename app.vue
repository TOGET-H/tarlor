<template>
  <div class="app-shell">
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
    </header>

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>
