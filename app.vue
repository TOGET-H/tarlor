<template>
  <div class="app-shell">
    <header class="topbar">
      <NuxtLink class="brand" to="/">
        <span class="brand-mark" aria-hidden="true">T</span>
        <span>塔罗日记</span>
      </NuxtLink>

      <nav class="nav-links" aria-label="主导航">
        <NuxtLink to="/draw">抽牌</NuxtLink>
        <NuxtLink to="/cards">牌库</NuxtLink>
        <NuxtLink to="/readings">记录</NuxtLink>
      </nav>
    </header>

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>
