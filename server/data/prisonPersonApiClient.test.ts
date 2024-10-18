import nock from 'nock'
import config from '../config'
import PrisonPersonApiRestClient from './prisonPersonApiClient'
import { PrisonPerson } from './interfaces/prisonPersonApi/prisonPersonApiClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonPersonApiClient', () => {
  let fakePrisonerSearchApi: nock.Scope
  let prisonPersonApiClient: PrisonPersonApiRestClient

  beforeEach(() => {
    fakePrisonerSearchApi = nock(config.apis.prisonerSearchApi.url)
    prisonPersonApiClient = new PrisonPersonApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getPrisonPerson', () => {
    it('should return data from api', async () => {
      const prisonPerson: PrisonPerson = {
        prisonerNumber: 'A8469DY',
        physicalAttributes: {
          height: {
            value: 100,
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          weight: {
            value: 100,
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          hair: {
            value: { id: 'BLONDE', description: 'Blonde' },
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          facialHair: {
            value: { id: 'MOUSTACHE', description: 'Moustache' },
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          face: {
            value: { id: 'OVAL', description: 'Oval' },
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          build: {
            value: { id: 'THIN', description: 'Thin' },
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          leftEyeColour: {
            value: { id: 'BLUE', description: 'Blue' },
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          rightEyeColour: {
            value: { id: 'GREEN', description: 'Green' },
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          shoeSize: {
            value: '11',
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
        },
        health: {
          smokerOrVaper: {
            value: {
              id: 'SMOKER_SMOKE',
              description: '',
              isActive: true,
              listSequence: 0,
            },
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          foodAllergies: [{ id: 'FOOD_ALLERGY_EGG', description: 'Egg', isActive: true, listSequence: 0 }],
          medicalDietaryRequirements: [
            {
              id: 'MEDICAL_DIET_LOW_FAT',
              description: 'Low fat',
              isActive: true,
              listSequence: 0,
            },
          ],
        },
      }
      fakePrisonerSearchApi
        .get('/prisoners/A8469DY')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, prisonPerson)

      const output = await prisonPersonApiClient.getPrisonPerson('A8469DY')
      expect(output).toEqual(prisonPerson)
    })
  })
})
