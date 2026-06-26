<script setup lang="ts">
import type { TarotCard } from '~/types/tarot'

const emptyForm = {
  name: '',
  arcana: 'major',
  suit: '',
  number: '',
  uprightMeaning: '',
  reversedMeaning: '',
  description: '',
  imageUrl: ''
}

const { data: cards, refresh } = await useFetch<TarotCard[]>('/api/cards', {
  default: () => []
})

const form = reactive({ ...emptyForm })
const editingId = ref<number | null>(null)
const error = ref('')
const saving = ref(false)

function arcanaLabel(value: string) {
  return value === 'major' ? '大阿尔卡那' : '小阿尔卡那'
}

function editCard(card: TarotCard) {
  editingId.value = card.id
  Object.assign(form, {
    name: card.name,
    arcana: card.arcana,
    suit: card.suit ?? '',
    number: card.number ?? '',
    uprightMeaning: card.uprightMeaning,
    reversedMeaning: card.reversedMeaning,
    description: card.description ?? '',
    imageUrl: card.imageUrl ?? ''
  })
}

function resetForm() {
  editingId.value = null
  error.value = ''
  Object.assign(form, emptyForm)
}

function getErrorMessage(err: unknown, fallback: string) {
  const value = err as { statusMessage?: string, data?: { statusMessage?: string } }
  return value.statusMessage || value.data?.statusMessage || fallback
}

async function saveCard() {
  error.value = ''
  saving.value = true

  try {
    if (editingId.value) {
      await $fetch(`/api/cards/${editingId.value}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/cards', {
        method: 'POST',
        body: form
      })
    }

    await refresh()
    resetForm()
  } catch (err) {
    error.value = getErrorMessage(err, '保存牌面失败')
  } finally {
    saving.value = false
  }
}

async function deleteCard(card: TarotCard) {
  error.value = ''

  try {
    await $fetch(`/api/cards/${card.id}`, {
      method: 'DELETE'
    })
    await refresh()
    if (editingId.value === card.id) {
      resetForm()
    }
  } catch (err) {
    error.value = getErrorMessage(err, '删除牌面失败')
  }
}
</script>

<template>
  <section>
    <div class="section-header">
      <div>
        <h1>塔罗牌库</h1>
        <p>管理抽牌流程使用的本地塔罗牌数据。</p>
      </div>
    </div>

    <div class="grid two">
      <form class="panel form-grid" @submit.prevent="saveCard">
        <h2>{{ editingId ? '编辑牌面' : '新增牌面' }}</h2>
        <p v-if="error" class="error">{{ error }}</p>

        <div class="field">
          <label for="name">牌名</label>
          <input id="name" v-model="form.name" required>
        </div>

        <div class="field">
          <label for="arcana">类型</label>
          <select id="arcana" v-model="form.arcana">
            <option value="major">大阿尔卡那</option>
            <option value="minor">小阿尔卡那</option>
          </select>
        </div>

        <div class="field">
          <label for="suit">花色</label>
          <input id="suit" v-model="form.suit" placeholder="cups、swords、pentacles、wands">
        </div>

        <div class="field">
          <label for="number">编号或等级</label>
          <input id="number" v-model="form.number">
        </div>

        <div class="field">
          <label for="upright">正位牌义</label>
          <textarea id="upright" v-model="form.uprightMeaning" required />
        </div>

        <div class="field">
          <label for="reversed">逆位牌义</label>
          <textarea id="reversed" v-model="form.reversedMeaning" required />
        </div>

        <div class="field">
          <label for="description">描述</label>
          <textarea id="description" v-model="form.description" />
        </div>

        <div class="actions">
          <button class="primary" type="submit" :disabled="saving">
            {{ saving ? '保存中...' : '保存牌面' }}
          </button>
          <button type="button" @click="resetForm">清空</button>
        </div>
      </form>

      <div class="panel table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>牌面</th>
              <th>类型</th>
              <th>牌义</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="card in cards" :key="card.id">
              <td>
                <strong>{{ card.name }}</strong>
                <div class="muted">{{ card.number || '暂无编号' }}</div>
              </td>
              <td>{{ arcanaLabel(card.arcana) }}</td>
              <td>{{ card.uprightMeaning }}</td>
              <td>
                <div class="actions">
                  <button type="button" @click="editCard(card)">编辑</button>
                  <button class="danger" type="button" @click="deleteCard(card)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
