import { RestClientBuilder } from '../data'
import { PersonalRelationshipsApiClient } from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import ContactsService from './contactsService'
import {
  PersonalRelationshipsNumberOfChildrenMock,
  personalRelationshipsSocialMock,
} from '../data/localMockData/personalRelationshipsApiMock'

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
      getContactCount: jest.fn(async () => ({
        official: 1,
        social: 1,
      })),
      getNumberOfChildren: jest.fn(async () => PersonalRelationshipsNumberOfChildrenMock),
      updateNumberOfChildren: jest.fn(async () => PersonalRelationshipsNumberOfChildrenMock),
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

      expect(personalRelationshipsApiClient.getContactCount).toHaveBeenCalledWith(prisonerNumber)
      expect(result).toEqual(expected)
    })
  })
})
