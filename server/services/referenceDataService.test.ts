import ReferenceDataService from './referenceDataService'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { alertTypesMock } from '../data/localMockData/alertTypesMock'

jest.mock('../data/prisonApiClient')

describe('Reference Data Service', () => {
  let referenceDataService: ReferenceDataService
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    prisonApiClient = {
      ...prisonApiClientMock(),
      getAlertTypes: jest.fn(async () => alertTypesMock),
    }
    referenceDataService = new ReferenceDataService(() => prisonApiClient)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Get alert types', () => {
    it('should call Prison API tp get alert types', async () => {
      const types = await referenceDataService.getAlertTypes('TOKEN')

      expect(prisonApiClient.getAlertTypes).toHaveBeenCalled()
      expect(types).toEqual(alertTypesMock)
    })
  })
})
