import { RestClientBuilder } from '../data'
import {
  ContactsResponseDto,
  CorePersonRecordReferenceDataDomain,
  PersonIntegrationApiClient,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'
import { GlobalEmail, GlobalNumbersAndEmails, GlobalPhoneNumber } from './interfaces/personalPageService/PersonalPage'
import ReferenceDataService from './referenceData/referenceDataService'

/*
 * Service for getting a prisoners "global" numbers and email addresess.
 *
 * "Global" is a NOMIS term and refers to phones/emails that are tied to the person
 * rather than any specific address and is used here to maintain that distinction.
 */
export default class GlobalPhoneNumberAndEmailAddressesService {
  constructor(
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  private transformPhones(contacts: ContactsResponseDto[], phoneTypes: ReferenceDataCodeDto[]): GlobalPhoneNumber[] {
    return contacts
      .filter(c => c.contactType !== 'EMAIL')
      .map(c => ({
        id: c.contactId,
        type: phoneTypes.find(t => t.code === c.contactType).description,
        extension: c.contactPhoneExtension,
        number: c.contactValue,
      }))
  }

  async getForPrisonerNumber(token: string, prisonerNumber: string): Promise<GlobalNumbersAndEmails> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const [contacts, phoneTypes] = await Promise.all([
      apiClient.getContacts(prisonerNumber),
      this.referenceDataService.getActiveReferenceDataCodes(CorePersonRecordReferenceDataDomain.phoneTypes, token),
    ])

    return {
      phones: this.transformPhones(contacts, phoneTypes),
      emails: contacts.filter(c => c.contactType === 'EMAIL').map(c => ({ id: c.contactId, email: c.contactValue })),
    }
  }

  async createEmailForPrisonerNumber(token: string, prisonerNumber: string, value: string): Promise<GlobalEmail> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const resp = await apiClient.createContact(prisonerNumber, {
      contactType: 'EMAIL',
      contactValue: value,
    })

    return { id: resp.contactId, email: resp.contactValue }
  }

  async updateEmailForPrisonerNumber(
    token: string,
    prisonerNumber: string,
    emailAddressId: string,
    value: string,
  ): Promise<GlobalEmail> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const resp = await apiClient.updateContact(prisonerNumber, emailAddressId, {
      contactType: 'EMAIL',
      contactValue: value,
    })

    return { id: resp.contactId, email: resp.contactValue }
  }

  async createPhoneNumberForPrisonerNumber(
    token: string,
    prisonerNumber: string,
    {
      phoneNumber,
      phoneNumberType,
      phoneExtension,
    }: { phoneNumber: string; phoneNumberType: string; phoneExtension: string },
  ): Promise<GlobalPhoneNumber> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const { contactId, contactType, contactValue, contactPhoneExtension } = await apiClient.createContact(
      prisonerNumber,
      {
        contactType: phoneNumberType,
        contactValue: phoneNumber,
        contactPhoneExtension: phoneExtension,
      },
    )

    return { id: contactId, number: contactValue, type: contactType, extension: contactPhoneExtension }
  }

  async updatePhoneNumberForPrisonerNumber(
    token: string,
    prisonerNumber: string,
    phoneNumberId: string,
    {
      phoneNumber,
      phoneNumberType,
      phoneExtension,
    }: { phoneNumber: string; phoneNumberType: string; phoneExtension: string },
  ): Promise<GlobalPhoneNumber> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const { contactId, contactType, contactValue, contactPhoneExtension } = await apiClient.updateContact(
      prisonerNumber,
      phoneNumberId,
      {
        contactType: phoneNumberType,
        contactValue: phoneNumber,
        contactPhoneExtension: phoneExtension,
      },
    )

    return { id: contactId, number: contactValue, type: contactType, extension: contactPhoneExtension }
  }
}
