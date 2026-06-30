<template>
  <section class="ritual-home">
    <div class="title-section">
      <p class="eyebrow">Digital Oracle</p>
      <h1>选择你的仪式</h1>
      <p>
        先进入一种状态，再决定要追问牌面，还是安静地回到自己。
      </p>
    </div>

    <div class="card-wrapper" aria-label="仪式入口">
      <NuxtLink class="ritual-card card-oracle" to="/draw">
        <span class="card-preview" aria-hidden="true">
          <img src="/tarot/card-back-clock.png" alt="" />
        </span>
        <span class="card-label">Oracle Reading</span>
        <span class="ritual-title">占卜</span>
        <span class="card-desc">写下问题，选择牌阵，亲手翻开牌面并保存解读。</span>
        <span class="ritual-btn">进入抽牌</span>
      </NuxtLink>

      <button class="ritual-card card-meditation" type="button" aria-disabled="true">
        <span class="breath-ring" aria-hidden="true">
          <span class="ring-inner" />
        </span>
        <span class="card-label">Meditation</span>
        <span class="ritual-title">冥想</span>
        <span class="card-desc">为之后的呼吸、静心和每日仪式预留入口。</span>
        <span class="ritual-btn btn-disabled">即将开放</span>
      </button>
    </div>

    <div class="mini-links">
      <NuxtLink to="/readings">回看解读历史</NuxtLink>
      <NuxtLink to="/cards">浏览完整牌库</NuxtLink>
    </div>
  </section>
</template>
