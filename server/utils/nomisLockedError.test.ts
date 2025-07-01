import { handleNomisLockedError, NomisLockedError } from './nomisLockedError'

describe('handleNomisLockedError', () => {
  it('should return result if apiClientFunction resolves successfully', async () => {
    const mockApiCall = jest.fn().mockResolvedValue('success')

    const result = await handleNomisLockedError(mockApiCall)

    expect(result).toBe('success')
    expect(mockApiCall).toHaveBeenCalled()
  })

  it('should throw NomisLockedError if apiClientFunction throws error with status 423', async () => {
    const error = { status: 423, message: 'some locked message' }
    const mockApiCall = jest.fn().mockRejectedValue(error)

    await expect(handleNomisLockedError(mockApiCall)).rejects.toThrow(NomisLockedError)
    await expect(handleNomisLockedError(mockApiCall)).rejects.toThrow('some locked message')
  })

  it('should rethrow error if status is not 423', async () => {
    const error = { status: 500, message: 'Server error' }
    const mockApiCall = jest.fn().mockRejectedValue(error)

    await expect(handleNomisLockedError(mockApiCall)).rejects.toBe(error)
  })

  it('should rethrow error if error has no status field', async () => {
    const error = new Error('Unknown error')
    const mockApiCall = jest.fn().mockRejectedValue(error)

    await expect(handleNomisLockedError(mockApiCall)).rejects.toBe(error)
  })
})
