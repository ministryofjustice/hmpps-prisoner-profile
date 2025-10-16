import { personIntegrationApiClientMock } from '../../tests/mocks/personIntegrationApiClientMock'
import { referenceDataServiceMock } from '../../tests/mocks/referenceDataServiceMock'
import {
  ContactsResponseDto,
  PersonIntegrationApiClient,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ContactsResponseMock } from '../data/localMockData/personIntegrationApiReferenceDataMock'
import GlobalPhoneNumberAndEmailAddressesService from './globalPhoneNumberAndEmailAddressesService'
import { GlobalEmail, GlobalNumbersAndEmails, PhoneNumber } from './interfaces/personalPageService/PersonalPage'
import MetricsService from './metrics/metricsService'
import { PrisonUser } from '../interfaces/HmppsUser'
import { metricsServiceMock } from '../../tests/mocks/metricsServiceMock'

describe('GlobalPhoneNumberAndEmailAddressesService', () => {
  let personIntegrationApiClient: PersonIntegrationApiClient
  let service: GlobalPhoneNumberAndEmailAddressesService
  let metricsService: MetricsService
  let user: PrisonUser

  const prisonerNumber = 'A1234BC'

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

  const phone = (
    id: number,
    type: string,
    typeDescription: string,
    number: string,
    extension: string = null,
  ): PhoneNumber => ({
    id,
    type,
    typeDescription,
    number,
    extension,
  })

  const email = (id: number, emailAddress: string): GlobalEmail => ({ id, email: emailAddress })

  beforeEach(() => {
    personIntegrationApiClient = personIntegrationApiClientMock()
    metricsService = metricsServiceMock()
    service = new GlobalPhoneNumberAndEmailAddressesService(
      () => personIntegrationApiClient,
      referenceDataServiceMock(),
      metricsService,
    )
    user = { username: 'testuser' } as PrisonUser
  })

  it.each([
    ['Empty response', [], { phones: [], emails: [] }],
    [
      'Only phones',
      [contact(1, 'BUS', '12345'), contact(2, 'HOME', '54321', '1')],
      {
        phones: [phone(2, 'HOME', 'Home', '54321', '1'), phone(1, 'BUS', 'Business', '12345')],
        emails: [],
      },
    ],
    [
      'Only Emails',
      [contact(1, 'EMAIL', 'foo@example.com'), contact(2, 'EMAIL', 'bar@example.com')],
      { phones: [], emails: [email(2, 'bar@example.com'), email(1, 'foo@example.com')] },
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
        phones: [phone(3, 'HOME', 'Home', '54321', '1'), phone(1, 'BUS', 'Business', '12345')],
        emails: [email(4, 'bar@example.com'), email(2, 'foo@example.com')],
      },
    ],
  ])(
    'Gets contacts correctly - %s',
    async (_, contactsResponse: ContactsResponseDto[], expected: GlobalNumbersAndEmails) => {
      personIntegrationApiClient.getContacts = jest.fn(async () => contactsResponse)
      const result = await service.getForPrisonerNumber('token', prisonerNumber)
      expect(result).toEqual(expected)
    },
  )

  it('Creates emails correctly', async () => {
    personIntegrationApiClient.createContact = jest.fn(async () => ContactsResponseMock[1])
    const result = await service.createEmailForPrisonerNumber('token', user, prisonerNumber, 'foo@example.com')

    expect(personIntegrationApiClient.createContact).toHaveBeenCalledWith(prisonerNumber, {
      contactType: 'EMAIL',
      contactValue: 'foo@example.com',
    })
    expect(result).toEqual(email(ContactsResponseMock[1].contactId, ContactsResponseMock[1].contactValue))

    expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
      fieldsUpdated: ['emailAddress'],
      prisonerNumber,
      user,
    })
  })

  it('Updates emails correctly', async () => {
    personIntegrationApiClient.updateContact = jest.fn(async () => ContactsResponseMock[1])
    const result = await service.updateEmailForPrisonerNumber('token', user, prisonerNumber, '123', 'foo@example.com')

    expect(personIntegrationApiClient.updateContact).toHaveBeenCalledWith(prisonerNumber, '123', {
      contactType: 'EMAIL',
      contactValue: 'foo@example.com',
    })
    expect(result).toEqual(email(ContactsResponseMock[1].contactId, ContactsResponseMock[1].contactValue))

    expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
      fieldsUpdated: ['emailAddress'],
      prisonerNumber,
      user,
    })
  })

  it('Creates phones correctly', async () => {
    personIntegrationApiClient.createContact = jest.fn(async () => ContactsResponseMock[0])
    const result = await service.createPhoneNumberForPrisonerNumber('token', user, prisonerNumber, {
      phoneNumber: '123',
      phoneNumberType: 'MOB',
      phoneExtension: '1234',
    })

    expect(personIntegrationApiClient.createContact).toHaveBeenCalledWith(prisonerNumber, {
      contactType: 'MOB',
      contactValue: '123',
      contactPhoneExtension: '1234',
    })
    expect(result).toEqual(
      phone(
        ContactsResponseMock[0].contactId,
        ContactsResponseMock[0].contactType,
        '',
        ContactsResponseMock[0].contactValue,
        ContactsResponseMock[0].contactPhoneExtension,
      ),
    )

    expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
      fieldsUpdated: ['phoneNumber'],
      prisonerNumber,
      user,
    })
  })

  it('Updates phones correctly', async () => {
    personIntegrationApiClient.updateContact = jest.fn(async () => ContactsResponseMock[0])
    const result = await service.updatePhoneNumberForPrisonerNumber('token', user, prisonerNumber, '123', {
      phoneNumber: '123',
      phoneNumberType: 'MOB',
      phoneExtension: '1234',
    })

    expect(personIntegrationApiClient.updateContact).toHaveBeenCalledWith(prisonerNumber, '123', {
      contactType: 'MOB',
      contactValue: '123',
      contactPhoneExtension: '1234',
    })
    expect(result).toEqual(
      phone(
        ContactsResponseMock[0].contactId,
        ContactsResponseMock[0].contactType,
        '',
        ContactsResponseMock[0].contactValue,
        ContactsResponseMock[0].contactPhoneExtension,
      ),
    )

    expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
      fieldsUpdated: ['phoneNumber'],
      prisonerNumber,
      user,
    })
  })
})
