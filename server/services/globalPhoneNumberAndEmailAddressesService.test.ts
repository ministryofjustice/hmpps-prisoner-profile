import { personIntegrationApiClientMock } from '../../tests/mocks/personIntegrationApiClientMock'
import {
  ContactsResponseDto,
  PersonIntegrationApiClient,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ContactsResponseMock } from '../data/localMockData/personIntegrationApiReferenceDataMock'
import GlobalPhoneNumberAndEmailAddressesService from './globalPhoneNumberAndEmailAddressesService'
import { GlobalEmail, GlobalNumbersAndEmails, GlobalPhoneNumber } from './interfaces/personalPageService/PersonalPage'

describe('GlobalPhoneNumberAndEmailAddressesService', () => {
  let personIntegrationApiClient: PersonIntegrationApiClient
  let service: GlobalPhoneNumberAndEmailAddressesService

  const contact = (
    contactId: number,
    contactType: string,
    contactValue: string,
    contactPhoneExtension: string = null,
  ): ContactsResponseDto => ({
    contactId,
    contactType,
    contactValue,
    contactPhoneExtension,
  })

  const phone = (id: number, type: string, number: string, extension: string = null): GlobalPhoneNumber => ({
    id,
    type,
    number,
    extension,
  })

  const email = (id: number, emailAddress: string): GlobalEmail => ({ id, email: emailAddress })

  beforeEach(() => {
    personIntegrationApiClient = personIntegrationApiClientMock()
    service = new GlobalPhoneNumberAndEmailAddressesService(() => personIntegrationApiClient)
  })

  it.each([
    ['Empty response', [], { phones: [], emails: [] }],
    [
      'Only phones',
      [contact(1, 'BUS', '12345'), contact(2, 'HOME', '54321', '1')],
      { phones: [phone(1, 'BUS', '12345'), phone(2, 'HOME', '54321', '1')], emails: [] },
    ],
    [
      'Only Emails',
      [contact(1, 'EMAIL', 'foo@example.com'), contact(2, 'EMAIL', 'bar@example.com')],
      { phones: [], emails: [email(1, 'foo@example.com'), email(2, 'bar@example.com')] },
    ],
    [
      'Both phones and emails',
      [
        contact(1, 'BUS', '12345'),
        contact(2, 'EMAIL', 'foo@example.com'),
        contact(3, 'HOME', '54321', '1'),
        contact(4, 'EMAIL', 'bar@example.com'),
      ],
      {
        phones: [phone(1, 'BUS', '12345'), phone(3, 'HOME', '54321', '1')],
        emails: [email(2, 'foo@example.com'), email(4, 'bar@example.com')],
      },
    ],
  ])(
    'Gets contacts correctly - %s',
    async (_, contactsResponse: ContactsResponseDto[], expected: GlobalNumbersAndEmails) => {
      personIntegrationApiClient.getContacts = jest.fn(async () => contactsResponse)
      const result = await service.getForPrisonerNumber('token', 'ABC123')
      expect(result).toEqual(expected)
    },
  )

  it('Updates emails correctly', async () => {
    personIntegrationApiClient.updateContact = jest.fn(async () => ContactsResponseMock[1])
    const result = await service.updateEmailForPrisonerNumber('token', 'ABC123', '123', 'foo@example.com')

    expect(personIntegrationApiClient.updateContact).toHaveBeenCalledWith('ABC123', '123', {
      contactType: 'EMAIL',
      contactValue: 'foo@example.com',
    })
    expect(result).toEqual(email(ContactsResponseMock[1].contactId, ContactsResponseMock[1].contactValue))
  })
})
