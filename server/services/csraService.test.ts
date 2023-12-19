import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import CsraService from './csraService'
import csraAssessmentMock from '../data/localMockData/csraAssessmentMock'
import csraAssessmentSummaryMock from '../data/localMockData/csraAssessmentSummaryMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import AgencyMock from '../data/localMockData/agency'
import { CsraSummary } from '../mappers/csraAssessmentsToSummaryListMapper'

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
      prisonApiClientSpy.getCsraAssessmentsForPrisoner = jest.fn(async () => [csraAssessmentSummaryMock])
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.getCsraHistory('', '123456')

      expect(output).toEqual([csraAssessmentSummaryMock])
    })

    it('should filter out if no classification code', async () => {
      prisonApiClientSpy.getCsraAssessmentsForPrisoner = jest.fn(async () => [
        csraAssessmentSummaryMock,
        { ...csraAssessmentSummaryMock, classificationCode: undefined },
      ])
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.getCsraHistory('', '123456')

      expect(output).toEqual([csraAssessmentSummaryMock])
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

  describe('filterCsraAssessments', () => {
    it('should filter by csra if passed in', () => {
      const csraAssessments: CsraSummary[] = [
        { ...csraAssessmentMock, classificationCode: 'STANDARD', classification: 'Standard', location: 'Holme' },
        { ...csraAssessmentMock, classificationCode: 'MED', classification: 'Medium', location: 'Somewhere' },
      ]
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = csraService.filterCsraAssessments(csraAssessments, {
        csra: 'STANDARD' as CsraAssessment['classificationCode'],
      })

      expect(output).toEqual([csraAssessments[0]])
    })

    it('should filter by location if passed in', async () => {
      const csraAssessments: CsraSummary[] = [
        { ...csraAssessmentMock, classificationCode: 'STANDARD', classification: 'Standard', location: 'Holme' },
        {
          ...csraAssessmentMock,
          classificationCode: 'MED',
          classification: 'Medium',
          assessmentAgencyId: 'LEI',
          location: 'Somewhere',
        },
      ]
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.filterCsraAssessments(csraAssessments, { location: 'HLI' })

      expect(output).toEqual([csraAssessments[0]])
    })

    it('should filter by csra and location if both passed in', async () => {
      const csraAssessments: CsraSummary[] = [
        {
          ...csraAssessmentMock,
          classificationCode: 'STANDARD',
          classification: 'Standard',
          location: 'Holme',
          assessmentAgencyId: 'LEI',
        },
        {
          ...csraAssessmentMock,
          classificationCode: 'MED',
          classification: 'Medium',
          assessmentAgencyId: 'LEI',
          location: 'Somewhere',
        },
        {
          ...csraAssessmentMock,
          classificationCode: 'MED',
          classification: 'Medium',
          location: 'Somewhere',
          assessmentAgencyId: 'HLM',
        },
      ]
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.filterCsraAssessments(csraAssessments, {
        csra: 'MED',
        location: 'LEI',
      })

      expect(output).toEqual([csraAssessments[1]])
    })

    it('should filter by date from', async () => {
      const csraAssessments: CsraSummary[] = [
        { ...csraAssessmentMock, assessmentDate: '2020-03-12', classification: 'Standard', location: 'Holme' },
        {
          ...csraAssessmentMock,
          assessmentDate: '2020-03-13',
          classification: 'Medium',
          location: 'Somewhere',
        },
      ]
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.filterCsraAssessments(csraAssessments, { from: '13/03/2020' })

      expect(output).toEqual([csraAssessments[1]])
    })

    it('should filter by date to', async () => {
      const csraAssessments: CsraSummary[] = [
        { ...csraAssessmentMock, assessmentDate: '2020-03-12', classification: 'Standard', location: 'Holme' },
        {
          ...csraAssessmentMock,
          assessmentDate: '2020-03-13',
          classification: 'Medium',
          location: 'Somewhere',
        },
      ]
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.filterCsraAssessments(csraAssessments, { to: '12/03/2020' })

      expect(output).toEqual([csraAssessments[0]])
    })

    it('should combine filters', async () => {
      const csraAssessments: CsraSummary[] = [
        {
          ...csraAssessmentMock,
          assessmentDate: '2020-03-12',
          classificationCode: 'STANDARD',
          classification: 'Standard',
          location: 'Holme',
        },
        {
          ...csraAssessmentMock,
          assessmentDate: '2020-03-13',
          classificationCode: 'MED',
          classification: 'Medium',
          location: 'Somewhere',
        },
      ]
      csraService = new CsraService(() => prisonApiClientSpy)

      const output = await csraService.filterCsraAssessments(csraAssessments, { csra: 'MED', to: '12/03/2020' })

      expect(output).toEqual([])
    })
  })
})
