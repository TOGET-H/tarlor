import { createError } from 'h3'

export default defineEventHandler(() => {
  throw createError({
    statusCode: 405,
    statusMessage: '抽牌记录只保存在当前浏览器'
  })
})
