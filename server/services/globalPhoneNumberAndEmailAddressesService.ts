import { RestClientBuilder } from '../data'
import { PersonIntegrationApiClient } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { GlobalEmail, GlobalNumbersAndEmails, GlobalPhoneNumber } from './interfaces/personalPageService/PersonalPage'

/*
 * Service for getting a prisoners "global" numbers and email addresess.
 *
 * "Global" is a NOMIS term and refers to phones/emails that are tied to the person
 * rather than any specific address and is used here to maintain that distinction.
 */
export default class GlobalPhoneNumberAndEmailAddressesService {
  constructor(private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>) {}

  async getForPrisonerNumber(token: string, prisonerNumber: string): Promise<GlobalNumbersAndEmails> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const contacts = await apiClient.getContacts(prisonerNumber)

    return {
      phones: contacts
        .filter(c => c.contactType !== 'EMAIL')
        .map(c => ({
          id: c.contactId,
          type: c.contactType,
          extension: c.contactPhoneExtension,
          number: c.contactValue,
        })),
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
