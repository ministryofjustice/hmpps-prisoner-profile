import nock from 'nock'
import config from '../config'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContactRequest,
  PersonalRelationshipsContactsDto,
  PersonalRelationshipsReferenceDataDomain,
  PersonalRelationshipType,
} from './interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import PersonalRelationshipsApiRestClient from './personalRelationshipsApiRestClient'
import { personalRelationshipsSocialMock } from './localMockData/personalRelationshipsApiMock'

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

  describe('getReferenceDataCodes', () => {
    const domain = PersonalRelationshipsReferenceDataDomain.SocialRelationship
    const referenceCodes = personalRelationshipsSocialMock

    it('should return reference data codes from the API', async () => {
      fakePersonalRelationshipsApi
        .get(`/reference-codes/group/${domain}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, referenceCodes)

      const output = await personalRelationshipsApiClient.getReferenceDataCodes(domain)
      expect(output).toEqual(referenceCodes)
    })

    it('should return an empty array when no reference codes are found', async () => {
      fakePersonalRelationshipsApi
        .get(`/reference-codes/group/${domain}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [])

      const output = await personalRelationshipsApiClient.getReferenceDataCodes(domain)
      expect(output).toEqual([])
    })
  })

  describe('createContact', () => {
    const contactRequest: PersonalRelationshipsContactRequest = {
      lastName: 'Doe',
      firstName: 'Rick',
      isStaff: false,
      relationship: {
        prisonerNumber: 'G4790GH',
        relationshipTypeCode: 'S',
        relationshipToPrisonerCode: 'BRO',
        isNextOfKin: false,
        isEmergencyContact: true,
        isApprovedVisitor: false,
      },
      createdBy: 'JD000001',
    }

    it('should create a new contact successfully', async () => {
      fakePersonalRelationshipsApi
        .post('/contact')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(201)

      await personalRelationshipsApiClient.createContact(contactRequest)
      expect(fakePersonalRelationshipsApi.isDone()).toBe(true)
    })
  })
})
