<template>
  <section>
    <div class="section-header">
      <div>
        <h1>塔罗日记</h1>
        <p>抽取塔罗牌、管理本地牌库，并保存解读记录，为后续接入 AI 自动解读预留完整链路。</p>
      </div>
    </div>

    <div class="card-grid">
      <NuxtLink class="tarot-card" to="/draw">
        <span class="badge">抽牌</span>
        <h3>开始一次解读</h3>
        <p class="muted">输入问题，选择单张牌或三张牌牌阵，并保存本次抽牌记录。</p>
      </NuxtLink>

      <NuxtLink class="tarot-card" to="/cards">
        <span class="badge">牌库</span>
        <h3>管理塔罗牌</h3>
        <p class="muted">新增、编辑、查看本地示例牌库，抽牌流程会从这里取牌。</p>
      </NuxtLink>

      <NuxtLink class="tarot-card" to="/readings">
        <span class="badge">历史</span>
        <h3>查看抽牌记录</h3>
        <p class="muted">回看已保存的问题、牌面、正逆位和解读内容。</p>
      </NuxtLink>
    </div>
  </section>
</template>
