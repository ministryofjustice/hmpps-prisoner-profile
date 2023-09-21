import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import CsraService from './csraService'
import csraAssessmentMock from '../data/localMockData/csraAssessmentMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import AgencyMock from '../data/localMockData/agency'

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

  describe('getCsraHistory', () => {
    it('should call Prison API to get csra history for prisoner', async () => {
      prisonApiClientSpy.getCsraAssessmentsForPrisoner = jest.fn(async () => [csraAssessmentMock])
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.getCsraHistory('', '123456')

      expect(output).toEqual([csraAssessmentMock])
    })

    it('should filter out if no classification code', async () => {
      prisonApiClientSpy.getCsraAssessmentsForPrisoner = jest.fn(async () => [
        csraAssessmentMock,
        { ...csraAssessmentMock, classificationCode: undefined },
      ])
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.getCsraHistory('', '123456')

      expect(output).toEqual([csraAssessmentMock])
    })

    it('should filter by csra if passed in', async () => {
      prisonApiClientSpy.getCsraAssessmentsForPrisoner = jest.fn(async () => [
        csraAssessmentMock,
        { ...csraAssessmentMock, classificationCode: 'LOW' as CsraAssessment['classificationCode'] },
      ])
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.getCsraHistory('', '123456', {
        csra: 'STANDARD' as CsraAssessment['classificationCode'],
      })

      expect(output).toEqual([csraAssessmentMock])
    })

    it('should filter by location if passed in', async () => {
      prisonApiClientSpy.getCsraAssessmentsForPrisoner = jest.fn(async () => [
        csraAssessmentMock,
        { ...csraAssessmentMock, assessmentAgencyId: 'SOMEWHERE' },
      ])
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.getCsraHistory('', '123456', { location: 'HLI' })

      expect(output).toEqual([csraAssessmentMock])
    })

    it('should filter by csra and location if both passed in', async () => {
      prisonApiClientSpy.getCsraAssessmentsForPrisoner = jest.fn(async () => [
        csraAssessmentMock,
        {
          ...csraAssessmentMock,
          assessmentAgencyId: 'SOMEWHERE',
          classificationCode: 'LOW' as CsraAssessment['classificationCode'],
        },
        { ...csraAssessmentMock, assessmentAgencyId: 'SOMEWHERE' },
        { ...csraAssessmentMock, classificationCode: 'LOW' as CsraAssessment['classificationCode'] },
      ])
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.getCsraHistory('', '123456', {
        location: csraAssessmentMock.assessmentAgencyId,
        csra: csraAssessmentMock.classificationCode,
      })

      expect(output).toEqual([csraAssessmentMock])
    })
  })

  describe('getAgenciesForCsraAssessments', () => {
    it('should get all location details for the csras passed in', async () => {
      prisonApiClientSpy.getAgencyDetails = jest
        .fn()
        .mockResolvedValueOnce(AgencyMock)
        .mockResolvedValueOnce(AgencyMock)
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.getAgenciesForCsraAssessments('', [
        csraAssessmentMock,
        { ...csraAssessmentMock, assessmentAgencyId: 'LEI' },
      ])

      expect(prisonApiClientSpy.getAgencyDetails).toBeCalledTimes(2)
      expect(output).toEqual([AgencyMock, AgencyMock])
    })

    it('should not call api for same agency multiple times', async () => {
      prisonApiClientSpy.getAgencyDetails = jest
        .fn()
        .mockResolvedValueOnce(AgencyMock)
        .mockResolvedValueOnce(AgencyMock)
      csraService = new CsraService(() => prisonApiClientSpy)

      await csraService.getAgenciesForCsraAssessments('', [csraAssessmentMock, csraAssessmentMock])

      expect(prisonApiClientSpy.getAgencyDetails).toBeCalledTimes(1)
    })
  })
})
