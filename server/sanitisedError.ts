import type { ResponseError } from 'superagent'

interface SanitisedError {
  endpoint: string
  text?: string
  status?: number
  headers?: unknown
  data?: unknown
  stack: string
  message: string
}

export type UnsanitisedError = ResponseError

export default function sanitise(error: UnsanitisedError, endpoint: string): SanitisedError {
  if (error.response) {
    return {
      endpoint,
      text: error.response.text,
      status: error.response.status,
      headers: error.response.headers,
      data: error.response.body,
      message: error.message,
      stack: error.stack,
    }
  }
  return {
    endpoint,
    message: error.message,
    stack: error.stack,
  }
}
