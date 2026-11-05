import { NotFound } from 'http-errors'
import logger from '../../logger'
import config from '../config'
import type { ManageUsersApiClient } from '../data/interfaces/manageUsersApi'
import type { PersonApiClient } from '../data/interfaces/personApi'
import type { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { mockPersonRecordWithReligionHistory } from '../data/localMockData/personApi/personRecordMock'
import { beliefHistoryMock } from '../data/localMockData/beliefHistoryMock'
import { beliefServiceMock } from './mocks/beliefServiceMocks'
import { withPersonApi, withoutPersonApi } from '../../tests/utils/withPersonApiFeature'
import { manageUsersApiClientMock } from '../../tests/mocks/manageUsersApiClientMock'
import { personApiClientMock } from '../../tests/mocks/personApiClientMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import BeliefService from './beliefService'

jest.mock('../../logger')

const token = 'token5'
const prisonerNumber = 'A1234AA'

let usePersonApiFeatureDefaults: typeof config.featureToggles.usePersonApi
beforeAll(() => {
  usePersonApiFeatureDefaults = { ...config.featureToggles.usePersonApi }
})

describe('beliefService', () => {
  let manageUsersApiClient: jest.Mocked<ManageUsersApiClient>
  let personApiClient: jest.Mocked<PersonApiClient>
  let prisonApiClient: jest.Mocked<PrisonApiClient>
  let service: BeliefService

  beforeAll(() => {
    manageUsersApiClient = manageUsersApiClientMock()
    personApiClient = personApiClientMock()
    prisonApiClient = prisonApiClientMock()
    service = new BeliefService(
      () => prisonApiClient,
      () => personApiClient,
      () => manageUsersApiClient,
    )
  })

  beforeEach(() => {
    config.featureToggles.usePersonApi = { ...usePersonApiFeatureDefaults }
    jest.resetAllMocks()
  })

  describe('getBeliefHistory', () => {
    withoutPersonApi(() => {
      it('should return a list of offender beliefs from prison-api', async () => {
        prisonApiClient.getBeliefHistory.mockResolvedValue(beliefHistoryMock)

        const response = await service.getBeliefHistory(token, prisonerNumber)

        expect(response).toEqual(beliefServiceMock)
        expect(prisonApiClient.getBeliefHistory).toHaveBeenCalledWith(prisonerNumber)
        expect(manageUsersApiClient.getPrisonUser).not.toHaveBeenCalled()
        expect(personApiClient.getRecord).not.toHaveBeenCalled()
      })
    })

    withPersonApi(() => {
      it('should return a list of offender beliefs from person api', async () => {
        personApiClient.getRecord.mockResolvedValue(mockPersonRecordWithReligionHistory)
        manageUsersApiClient.getPrisonUser.mockImplementation(async username => {
          if (username === 'jlpic') {
            return { username, firstName: 'Jean-Luc', lastName: 'Picard' }
          }
          throw new NotFound()
        })

        const response = await service.getBeliefHistory(token, prisonerNumber)

        expect(response).toEqual([
          {
            current: true,
            religionCode: 'TPRNTS',
            religionDescription: 'They prefer not to say',
            startDate: '2026-10-28',
            endDate: null,
            changeReasonKnown: true,
            comments: 'They do not want others to know',
            createUserFirstName: 'Jean-Luc',
            createUserLastName: 'Picard',
            modifyUserFirstName: null,
            modifyUserLastName: '',
            modifyDate: null,
          },
          {
            current: false,
            religionCode: 'CCOG',
            religionDescription: 'Celestial Church of God',
            startDate: '2022-01-01',
            endDate: '2026-10-28',
            changeReasonKnown: false,
            comments: null,
            createUserFirstName: 'jkirk',
            createUserLastName: '',
            modifyUserFirstName: 'Jean-Luc',
            modifyUserLastName: 'Picard',
            modifyDate: '2026-10-28',
          },
        ])
        expect(prisonApiClient.getBeliefHistory).not.toHaveBeenCalled()
        expect(manageUsersApiClient.getPrisonUser).toHaveBeenCalledWith('jlpic')
        expect(manageUsersApiClient.getPrisonUser).toHaveBeenCalledWith('jkirk')
        expect(personApiClient.getRecord).toHaveBeenCalledWith(prisonerNumber, true)
        expect(logger.warn).toHaveBeenCalledWith('Unknown usernames in religion history: jkirk')
      })
    })
  })
})
