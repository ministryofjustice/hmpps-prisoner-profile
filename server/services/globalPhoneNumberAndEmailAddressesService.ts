import { RestClientBuilder } from '../data'
import {
  ContactsResponseDto,
  CorePersonRecordReferenceDataDomain,
  PersonIntegrationApiClient,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { GlobalEmail, GlobalNumbersAndEmails, PhoneNumber } from './interfaces/personalPageService/PersonalPage'
import ReferenceDataService from './referenceData/referenceDataService'
import { transformPhones } from '../utils/transformPhones'
import MetricsService from './metrics/metricsService'
import { PrisonUser } from '../interfaces/HmppsUser'

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
    private readonly metricsService: MetricsService,
  ) {}

  async transformContacts(token: string, contacts: ContactsResponseDto[]): Promise<GlobalNumbersAndEmails> {
    const phoneTypes = await this.referenceDataService.getActiveReferenceDataCodes(
      CorePersonRecordReferenceDataDomain.phoneTypes,
      token,
    )
    return {
      phones: transformPhones(contacts, phoneTypes).sort((a, b) => b.id - a.id),
      emails: contacts
        .filter(c => c.contactType === 'EMAIL')
        .map(c => ({ id: c.contactId, email: c.contactValue }))
        .sort((a, b) => b.id - a.id),
    }
  }

  async getForPrisonerNumber(token: string, prisonerNumber: string): Promise<GlobalNumbersAndEmails> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const contacts = await apiClient.getContacts(prisonerNumber)
    return this.transformContacts(token, contacts)
  }

  async createEmailForPrisonerNumber(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    value: string,
  ): Promise<GlobalEmail> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const resp = await apiClient.createContact(prisonerNumber, {
      contactType: 'EMAIL',
      contactValue: value,
    })
    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['emailAddress'],
      prisonerNumber,
      user,
    })

    return { id: resp.contactId, email: resp.contactValue }
  }

  async updateEmailForPrisonerNumber(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    emailAddressId: string,
    value: string,
  ): Promise<GlobalEmail> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const resp = await apiClient.updateContact(prisonerNumber, emailAddressId, {
      contactType: 'EMAIL',
      contactValue: value,
    })
    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['emailAddress'],
      prisonerNumber,
      user,
    })

    return { id: resp.contactId, email: resp.contactValue }
  }

  async createPhoneNumberForPrisonerNumber(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    {
      phoneNumber,
      phoneNumberType,
      phoneExtension,
    }: { phoneNumber: string; phoneNumberType: string; phoneExtension: string },
  ): Promise<PhoneNumber> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const { contactId, contactType, contactValue, contactPhoneExtension } = await apiClient.createContact(
      prisonerNumber,
      {
        contactType: phoneNumberType,
        contactValue: phoneNumber,
        contactPhoneExtension: phoneExtension,
      },
    )
    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['phoneNumber'],
      prisonerNumber,
      user,
    })

    return {
      id: contactId,
      number: contactValue,
      type: contactType,
      typeDescription: '',
      extension: contactPhoneExtension,
    }
  }

  async updatePhoneNumberForPrisonerNumber(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    phoneNumberId: string,
    {
      phoneNumber,
      phoneNumberType,
      phoneExtension,
    }: { phoneNumber: string; phoneNumberType: string; phoneExtension: string },
  ): Promise<PhoneNumber> {
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
    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['phoneNumber'],
      prisonerNumber,
      user,
    })

    return {
      id: contactId,
      number: contactValue,
      type: contactType,
      typeDescription: '',
      extension: contactPhoneExtension,
    }
  }
}
