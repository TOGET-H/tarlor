<script setup lang="ts">
import MeditationPlayer from '~/components/meditation/Player.vue'
import { findPractice, normalizeDuration } from '~/utils/meditation'
const route = useRoute()
const practice = computed(() => findPractice(route.params.type))
const duration = computed(() => normalizeDuration(route.query.duration))
if (!practice.value) {
  await navigateTo({ path: '/meditation', query: { notice: '没有找到这个练习，请重新选择。' } }, { replace: true })
} else if (String(route.query.duration ?? '') !== String(duration.value)) {
  await navigateTo({ path: route.path, query: { ...route.query, duration: duration.value } }, { replace: true })
}
</script>
<template><MeditationPlayer v-if="practice" :key="`${practice.id}-${duration}`" :practice="practice" :duration="duration" /></template>
