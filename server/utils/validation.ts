import { createError } from 'h3'

const fieldLabels: Record<string, string> = {
  id: 'ID',
  name: '牌名',
  arcana: '类型',
  uprightMeaning: '正位牌义',
  reversedMeaning: '逆位牌义',
  question: '问题',
  spreadType: '牌阵',
  status: '状态'
}

function fieldLabel(field: string) {
  return fieldLabels[field] ?? field
}

export function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldLabel(field)}不能为空`
    })
  }

  return value.trim()
}

export function optionalString(value: unknown) {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function validateArcana(value: unknown) {
  const arcana = requiredString(value, 'arcana')

  if (!['major', 'minor'].includes(arcana)) {
    throw createError({
      statusCode: 400,
      statusMessage: '类型必须是大阿尔卡那或小阿尔卡那'
    })
  }

  return arcana
}

export function validateSpreadType(value: unknown) {
  const spreadType = requiredString(value, 'spreadType')

  if (!['single', 'past_present_future'].includes(spreadType)) {
    throw createError({
      statusCode: 400,
      statusMessage: '牌阵必须是单张牌或过去 / 现在 / 未来'
    })
  }

  return spreadType
}

export function validateReadingStatus(value: unknown) {
  const status = requiredString(value, 'status')

  if (!['draft', 'interpreted', 'archived'].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: '状态必须是草稿、已解读或已归档'
    })
  }

  return status
}

export function parseId(value: string | undefined, label = 'id') {
  const id = Number(value)

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldLabel(label)}必须是正整数`
    })
  }

  return id
}
