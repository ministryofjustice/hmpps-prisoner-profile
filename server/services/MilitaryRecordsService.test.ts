import MilitaryRecordsService from './militaryRecordsService'
import { RestClientBuilder } from '../data'
import {
  PersonIntegrationApiClient,
  ProxyReferenceDataDomain,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import ReferenceDataService from './referenceDataService'
import MetricsService from './metrics/metricsService'
import { PrisonUser } from '../interfaces/HmppsUser'
import BadRequestError from '../utils/badRequestError'
import {
  MilitaryBranchRefDataMock,
  MilitaryRankRefDataMock,
  MilitaryRecordsMock,
} from '../data/localMockData/personIntegrationReferenceDataMock'

jest.mock('../data')
jest.mock('./referenceDataService')
jest.mock('./metrics/metricsService')

describe('MilitaryRecordsService', () => {
  let militaryRecordsService: MilitaryRecordsService
  let personIntegrationApiClient: PersonIntegrationApiClient
  let referenceDataService: ReferenceDataService
  let metricsService: MetricsService
  let clientToken: string
  let prisonerNumber: string
  let militarySeq: number
  let user: PrisonUser

  beforeEach(() => {
    personIntegrationApiClient = {
      getMilitaryRecords: jest.fn(async () => MilitaryRecordsMock),
      createMilitaryRecord: jest.fn(),
      updateMilitaryRecord: jest.fn(),
    } as unknown as PersonIntegrationApiClient
    referenceDataService = {
      getActiveReferenceDataCodes: jest.fn(async (domain: string) => {
        if (domain === 'MLTY_BRANCH') return MilitaryBranchRefDataMock
        if (domain === 'MLTY_RANK') return MilitaryRankRefDataMock
        return []
      }),
    } as unknown as ReferenceDataService
    metricsService = {
      trackPersonIntegrationUpdate: jest.fn(),
    } as unknown as MetricsService

    const personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient> = jest.fn(
      () => personIntegrationApiClient,
    )

    militaryRecordsService = new MilitaryRecordsService(
      personIntegrationApiClientBuilder,
      referenceDataService,
      metricsService,
    )

    clientToken = 'test-token'
    prisonerNumber = 'A1234AA'
    militarySeq = 1
    user = { username: 'testuser' } as PrisonUser
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getMilitaryRecords', () => {
    it('should return military records', async () => {
      const result = await militaryRecordsService.getMilitaryRecords(clientToken, prisonerNumber)

      expect(personIntegrationApiClient.getMilitaryRecords).toHaveBeenCalledWith(prisonerNumber)
      expect(result).toEqual(MilitaryRecordsMock)
    })
  })

  describe('getReferenceData', () => {
    it('should return reference data codes', async () => {
      const domains = [ProxyReferenceDataDomain.militaryBranch, ProxyReferenceDataDomain.militaryRank]
      const result = await militaryRecordsService.getReferenceData(clientToken, domains)

      expect(referenceDataService.getActiveReferenceDataCodes).toHaveBeenCalledWith(
        ProxyReferenceDataDomain.militaryBranch,
        clientToken,
      )
      expect(referenceDataService.getActiveReferenceDataCodes).toHaveBeenCalledWith(
        ProxyReferenceDataDomain.militaryRank,
        clientToken,
      )
      expect(result).toEqual({ militaryBranch: MilitaryBranchRefDataMock, militaryRank: MilitaryRankRefDataMock })
    })
  })

  describe('updateMilitaryRecord', () => {
    it('should update military record', async () => {
      await militaryRecordsService.updateMilitaryRecord(
        clientToken,
        user,
        prisonerNumber,
        militarySeq,
        MilitaryRecordsMock[0],
      )

      expect(personIntegrationApiClient.getMilitaryRecords).toHaveBeenCalledWith(prisonerNumber)
      expect(personIntegrationApiClient.updateMilitaryRecord).toHaveBeenCalledWith(
        prisonerNumber,
        militarySeq,
        MilitaryRecordsMock[0],
      )
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['military-record'],
        prisonerNumber,
        user,
      })
    })

    it('should throw BadRequestError if military record not found', async () => {
      jest.spyOn(personIntegrationApiClient, 'getMilitaryRecords').mockResolvedValue([])

      await expect(
        militaryRecordsService.updateMilitaryRecord(
          clientToken,
          user,
          prisonerNumber,
          militarySeq,
          MilitaryRecordsMock[0],
        ),
      ).rejects.toThrow(BadRequestError)
    })
  })

  describe('createMilitaryRecord', () => {
    it('should create military record', async () => {
      await militaryRecordsService.createMilitaryRecord(clientToken, user, prisonerNumber, MilitaryRecordsMock[0])

      expect(personIntegrationApiClient.createMilitaryRecord).toHaveBeenCalledWith(
        prisonerNumber,
        MilitaryRecordsMock[0],
      )
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['military-record'],
        prisonerNumber,
        user,
      })
    })
  })
})
