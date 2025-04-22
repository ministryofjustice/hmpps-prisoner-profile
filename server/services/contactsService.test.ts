import { RestClientBuilder } from '../data'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipType,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import ContactsService from './contactsService'
import { personalRelationshipsSocialMock } from '../data/localMockData/personalRelationshipsApiMock'

describe('ContactsService', () => {
  let clientToken: string
  let prisonerNumber: string
  let personalRelationshipsApiClient: PersonalRelationshipsApiClient
  let contactsService: ContactsService

  beforeEach(() => {
    clientToken = 'CLIENT_TOKEN'
    prisonerNumber = 'A1234AA'

    personalRelationshipsApiClient = {
      getContacts: jest.fn(async () => personalRelationshipsSocialMock),
      getReferenceDataCodes: jest.fn(),
      createContact: jest.fn(),
    }

    const personalRelationshipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient> = jest
      .fn()
      .mockReturnValue(personalRelationshipsApiClient)

    contactsService = new ContactsService(personalRelationshipsApiClientBuilder)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getContactsCount', () => {
    it('should call the API client with the correct parameters', async () => {
      personalRelationshipsApiClient.getContacts = jest.fn(async () => personalRelationshipsSocialMock)
      const expected = {
        social: 1,
        official: 1,
      }

      const result = await contactsService.getExternalContactsCount(clientToken, prisonerNumber)

      expect(personalRelationshipsApiClient.getContacts).toHaveBeenCalledWith(prisonerNumber, {
        relationshipType: PersonalRelationshipType.Official,
        page: 0,
        size: 1,
      })
      expect(personalRelationshipsApiClient.getContacts).toHaveBeenCalledWith(prisonerNumber, {
        relationshipType: PersonalRelationshipType.Social,
        page: 0,
        size: 1,
      })
      expect(result).toEqual(expected)
    })
  })
})
