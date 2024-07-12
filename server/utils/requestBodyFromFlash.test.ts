import { requestBodyFromFlash } from './requestBodyFromFlash'

describe('requestBodyFromFlash', () => {
  it('Returns a parsed JSON version of the request body when provided', () => {
    const res = requestBodyFromFlash({ flash: jest.fn(() => [JSON.stringify({ example: 'string' })]) } as any)
    expect(res).toEqual({ example: 'string' })
  })

  it('Returns null when no request body', () => {
    const res = requestBodyFromFlash({ flash: jest.fn(() => []) } as any)
    expect(res).toEqual(null)
  })
})
