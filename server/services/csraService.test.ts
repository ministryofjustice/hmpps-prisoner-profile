import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import CsraService from './csraService'
import csraAssessmentMock from '../data/localMockData/csraAssessmentMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import AgenciesMock from '../data/localMockData/agenciesDetails'

jest.mock('../data/prisonApiClient')

describe('Csra Service', () => {
  let prisonApiClientSpy: PrisonApiClient
  let csraService: CsraService

  beforeEach(() => {
    prisonApiClientSpy = prisonApiClientMock()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getCsraAssessment', () => {
    it('should call Prison API to get csra, agency and staff details of the assessor', async () => {
      prisonApiClientSpy.getCsraAssessment = jest.fn(async () => csraAssessmentMock)
      prisonApiClientSpy.getAgencyDetails = jest.fn(async () => AgenciesMock)
      prisonApiClientSpy.getStaffDetails = jest.fn(async () => StaffDetailsMock)

      csraService = new CsraService(() => prisonApiClientSpy)
      const csraData = await csraService.getCsraAssessment('', 123456, 9)

      expect(prisonApiClientSpy.getCsraAssessment).toHaveBeenCalledWith(123456, 9)
      expect(prisonApiClientSpy.getAgencyDetails).toHaveBeenCalledWith(csraAssessmentMock.assessmentAgencyId)
      expect(prisonApiClientSpy.getStaffDetails).toHaveBeenCalledWith(csraAssessmentMock.assessorUser)

      expect(csraData).toEqual({
        csraAssessment: csraAssessmentMock,
        agencyDetails: AgenciesMock,
        staffDetails: StaffDetailsMock,
      })
    })

    it('should not get agency or staff detials if not in csra response', async () => {
      const csraResponse = {
        ...csraAssessmentMock,
        assessmentAgencyId: '',
        assessorUser: '',
      }
      prisonApiClientSpy.getCsraAssessment = jest.fn(async () => csraResponse)

      csraService = new CsraService(() => prisonApiClientSpy)
      const csraData = await csraService.getCsraAssessment('', 123456, 9)

      expect(prisonApiClientSpy.getCsraAssessment).toHaveBeenCalledWith(123456, 9)
      expect(prisonApiClientSpy.getAgencyDetails).toBeCalledTimes(0)
      expect(prisonApiClientSpy.getStaffDetails).toBeCalledTimes(0)

      expect(csraData).toEqual({
        csraAssessment: csraResponse,
        agencyDetails: null,
        staffDetails: null,
      })
    })
  })
})
