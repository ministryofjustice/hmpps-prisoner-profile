import { RestClientBuilder } from '../data'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipType,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import ContactsService from './contactsService'
import { personalRelationshipsMock } from '../data/localMockData/personalRelationshipsApiMock'

describe('ContactsService', () => {
  let clientToken: string
  let prisonerNumber: string
  let personalRelationshipsApiClient: PersonalRelationshipsApiClient
  let contactsService: ContactsService
  let apiErrorCallback: (error: Error) => void

  beforeEach(() => {
    clientToken = 'CLIENT_TOKEN'
    prisonerNumber = 'A1234AA'

    personalRelationshipsApiClient = {
      getContacts: jest.fn(async () => personalRelationshipsMock),
    }

    apiErrorCallback = jest.fn()

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
      personalRelationshipsApiClient.getContacts = jest.fn(async () => personalRelationshipsMock)

      const result = await contactsService.getContactsCount(clientToken, prisonerNumber, apiErrorCallback)

      expect(personalRelationshipsApiClient.getContacts).toHaveBeenCalledWith(
        prisonerNumber,
        PersonalRelationshipType.Official,
        1,
      )
      expect(personalRelationshipsApiClient.getContacts).toHaveBeenCalledWith(
        prisonerNumber,
        PersonalRelationshipType.Social,
        1,
      )
      expect(result.social.isFulfilled()).toBeTruthy()
      expect(result.social.getOrNull()).toEqual(1)
      expect(result.official.isFulfilled()).toBeTruthy()
      expect(result.official.getOrNull()).toEqual(1)
    })
  })

  it('should handle personal relationship API failure', async () => {
    const error = Error('some error')
    personalRelationshipsApiClient.getContacts = jest.fn(async () => Promise.reject(error))

    const result = await contactsService.getContactsCount(clientToken, prisonerNumber, apiErrorCallback)

    expect(personalRelationshipsApiClient.getContacts).toHaveBeenCalledWith(
      prisonerNumber,
      PersonalRelationshipType.Official,
      1,
    )
    expect(personalRelationshipsApiClient.getContacts).toHaveBeenCalledWith(
      prisonerNumber,
      PersonalRelationshipType.Social,
      1,
    )
    expect(result.social.isFulfilled()).toBeFalsy()
    expect(result.social.getOrHandle(e => e)).toEqual(error)
    expect(result.official.isFulfilled()).toBeFalsy()
    expect(result.official.getOrHandle(e => e)).toEqual(error)
  })
})
