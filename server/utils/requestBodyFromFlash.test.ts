import { Request } from 'express'
import { requestBodyFromFlash } from './requestBodyFromFlash'

describe('requestBodyFromFlash', () => {
  it('Returns a parsed JSON version of the request body when provided', () => {
    const req = { flash: jest.fn(() => [JSON.stringify({ example: 'string' })]) } as unknown as Request
    const res = requestBodyFromFlash(req)
    expect(res).toEqual({ example: 'string' })
  })

  it('Returns null when no request body', () => {
    const req = { flash: jest.fn((): string[] => []) } as unknown as Request
    const res = requestBodyFromFlash(req)
    expect(res).toEqual(null)
  })
})
