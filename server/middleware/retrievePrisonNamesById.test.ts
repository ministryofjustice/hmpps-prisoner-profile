import { Request, Response } from 'express'
import retrievePrisonNamesById from './retrievePrisonNamesById'
import PrisonService from '../services/prisonService'

jest.mock('../services/prisonService')

describe('retrievePrisonNamesById', () => {
  const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
  const requestHandler = retrievePrisonNamesById(prisonService)

  const token = 'a-system-token'

  const apiErrorCallback = jest.fn()
  const req = {
    middleware: { clientToken: token },
  } as unknown as Request
  const res = {
    render: jest.fn(),
    locals: { apiErrorCallback },
  } as unknown as Response
  const next = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should retrieve prisonNamesById and store on res.locals', async () => {
    // Given
    const prisonNamesById = {
      BXI: 'Brixton (HMP)',
      MDI: 'Moorland (HMP & YOI)',
    }
    prisonService.getAllPrisonNamesById.mockResolvedValue(prisonNamesById)

    // When
    await requestHandler(req, res, next)

    // Then
    expect(res.locals.prisonNamesById.isFulfilled()).toEqual(true)
    expect(res.locals.prisonNamesById.value).toEqual(prisonNamesById)
    expect(prisonService.getAllPrisonNamesById).toHaveBeenCalledWith(token)
    expect(next).toHaveBeenCalled()
    expect(apiErrorCallback).not.toHaveBeenCalled()
  })
})
