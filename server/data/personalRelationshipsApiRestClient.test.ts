import nock from 'nock'
import config from '../config'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContactsDto,
  PersonalRelationshipType,
} from './interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import PersonalRelationshipsApiRestClient from './personalRelationshipsApiRestClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('personalRelationshipsApiRestClient', () => {
  let fakePersonalRelationshipsApi: nock.Scope
  let personalRelationshipsApiClient: PersonalRelationshipsApiClient

  beforeEach(() => {
    fakePersonalRelationshipsApi = nock(config.apis.personalRelationshipsApi.url)
    personalRelationshipsApiClient = new PersonalRelationshipsApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const prisonerNumber = 'A1234BC'

  const contactCount = { offical: 1, social: 1 }

  const contacts: PersonalRelationshipsContactsDto = {
    content: [
      {
        prisonerContactId: 1,
        contactId: 2,
        prisonerNumber,
        firstName: 'John',
        lastName: 'Smith',
        relationshipTypeCode: 'S',
        relationshipTypeDescription: 'Friend',
        relationshipToPrisonerCode: 'FRI',
        relationshipToPrisonerDescription: 'Friend',
        isApprovedVisitor: true,
        isEmergencyContact: false,
        isNextOfKin: false,
        isRelationshipActive: true,
        currentTerm: true,
        restrictionSummary: {
          active: [],
          totalActive: 0,
          totalExpired: 0,
        },
      },
    ],
    page: {
      size: 20,
      number: 0,
      totalPages: 1,
      totalElements: 1,
    },
  }

  describe('getContacts', () => {
    it('should return data from api', async () => {
      fakePersonalRelationshipsApi
        .get(`/prisoner/${prisonerNumber}/contact`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, contacts)

      const output = await personalRelationshipsApiClient.getContacts(prisonerNumber)
      expect(output).toEqual(contacts)
    })

    it.each([[PersonalRelationshipType.Social], [PersonalRelationshipType.Official]])(
      'should allow relationship type to be specified (%s)',
      async (relationshipType: PersonalRelationshipType) => {
        fakePersonalRelationshipsApi
          .get(`/prisoner/${prisonerNumber}/contact`)
          .matchHeader('authorization', `Bearer ${token.access_token}`)
          .query({ relationshipType })
          .reply(200, contacts)

        const output = await personalRelationshipsApiClient.getContacts(prisonerNumber, { relationshipType })
        expect(output).toEqual(contacts)
      },
    )

    it('should allow pagination control', async () => {
      const page = 1
      const size = 11
      fakePersonalRelationshipsApi
        .get(`/prisoner/${prisonerNumber}/contact`)
        .query({ page, size })
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, contacts)

      const output = await personalRelationshipsApiClient.getContacts(prisonerNumber, { page, size })
      expect(output).toEqual(contacts)
    })
  })

  describe('getContactCount', () => {
    it('should return data from api', async () => {
      fakePersonalRelationshipsApi
        .get(`/prisoner/${prisonerNumber}/contact/count`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, contactCount)

      const output = await personalRelationshipsApiClient.getContactCount(prisonerNumber)
      expect(output).toEqual(contactCount)
    })
  })
})
