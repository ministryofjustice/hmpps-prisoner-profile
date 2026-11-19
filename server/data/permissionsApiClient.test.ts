import nock from 'nock'
import config from '../config'
import PermissionsApiRestClient, {
  type HighProfilePrisonerRequest,
  type HighProfilePrisonerResponse,
} from './permissionsApiClient'
import type { PermissionsApi } from './interfaces/permissionsApi'

const token = 'token-1'
const samplePrisonerNumber = 'G6123VU'

describe('permissionsApiClient', () => {
  let fakePermissionsApi: nock.Scope
  let permissionsApiRestClient: PermissionsApi

  beforeEach(() => {
    fakePermissionsApi = nock(config.apis.permissionsApi.url)
    permissionsApiRestClient = new PermissionsApiRestClient(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  afterAll(() => {
    nock.restore()
  })

  describe('checkHighProfilePrisonerStatus', () => {
    it('should return true when prisoner is found in list', () => {
      fakePermissionsApi
        .post('/api/high-profile-prisoners', {
          prisonerNumbersToCheck: [samplePrisonerNumber],
        } satisfies HighProfilePrisonerRequest)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { highProfilePrisoners: [samplePrisonerNumber] } satisfies HighProfilePrisonerResponse)

      return expect(permissionsApiRestClient.checkHighProfilePrisonerStatus(samplePrisonerNumber)).resolves.toBe(true)
    })

    it('should return false when prisoner is not found in list', () => {
      fakePermissionsApi
        .post('/api/high-profile-prisoners', {
          prisonerNumbersToCheck: [samplePrisonerNumber],
        } satisfies HighProfilePrisonerRequest)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { highProfilePrisoners: [] } satisfies HighProfilePrisonerResponse)

      return expect(permissionsApiRestClient.checkHighProfilePrisonerStatus(samplePrisonerNumber)).resolves.toBe(false)
    })

    it('should propagate error from api', () => {
      fakePermissionsApi.post('/api/high-profile-prisoners').reply(500)

      return expect(permissionsApiRestClient.checkHighProfilePrisonerStatus(samplePrisonerNumber)).rejects.toThrow(
        'Internal Server Error',
      )
    })
  })
})
