import process from 'node:process'
import { createError } from 'h3'
import type { H3Event } from 'h3'
import { resolveAiConfig } from '../ai/config'
import { AiError } from '../ai/errors'
import { createAiGateway } from '../ai/gateway'

export function useAiGateway(event: H3Event) {
  try {
    return createAiGateway(resolveAiConfig(useRuntimeConfig(event), process.env))
  } catch (error) {
    if (error instanceof AiError) throw aiHttpError(error)
    throw error
  }
}

export function aiHttpError(error: AiError) {
  return createError({ statusCode: error.statusCode, statusMessage: 'AI request failed',
    message: error.message, data: { code: error.code, message: error.message } })
}
