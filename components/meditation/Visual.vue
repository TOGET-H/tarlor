<script setup lang="ts">
import type { PracticeId } from '~/utils/meditation'
defineProps<{ visual: PracticeId; active: boolean; paused: boolean; bodyRegion: string }>()
const bodyParts = ['head', 'neck', 'torso', 'back', 'arm-left', 'arm-right', 'leg-left', 'leg-right', 'feet']
function bodyClasses(part: string) {
  return ['body-part', `body-${part}`, part.startsWith('arm-') ? 'body-arm' : '', part.startsWith('leg-') ? 'body-leg' : '']
}
</script>
<template>
  <div class="meditation-visual" :class="[`meditation-${visual === 'body-scan' ? 'body' : visual}-visual`, { 'is-active': active, 'is-paused': paused }]" :data-region="visual === 'body-scan' ? bodyRegion : undefined" aria-hidden="true">
    <template v-if="visual === 'breath'"><span class="meditation-breath-layer layer-outer" /><span class="meditation-breath-layer layer-middle" /><span class="meditation-breath-layer layer-inner" /><span class="meditation-breath-center" /></template>
    <template v-else-if="visual === 'mantra'"><span class="mantra-word mantra-now">此刻</span><span class="mantra-pause">，</span><span class="mantra-word mantra-here">我在这里</span></template>
    <template v-else-if="visual === 'focus'"><span class="focus-halo halo-outer" /><span class="focus-halo halo-inner" /><span class="focus-point" /></template>
    <template v-else-if="visual === 'body-scan'"><span class="body-scan-aura" /><span v-for="part in bodyParts" :key="part" :class="bodyClasses(part)" /></template>
    <template v-else><span class="thought-fragment thought-one">念头</span><span class="thought-fragment thought-two">感受</span><span class="thought-fragment thought-three">计划</span><span class="thought-anchor">此刻</span></template>
  </div>
</template>
