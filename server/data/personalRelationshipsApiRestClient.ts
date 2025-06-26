import RestClient from './restClient'
import config from '../config'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContactCount,
  PersonalRelationshipsContactCreationResultDto,
  PersonalRelationshipsContactQueryParams,
  PersonalRelationshipsContactRequest,
  PersonalRelationshipsContactRequestAddress,
  PersonalRelationshipsContactsDto,
  PersonalRelationshipsDomesticStatusDto,
  PersonalRelationshipsDomesticStatusUpdateRequest,
  PersonalRelationshipsNumberOfChildrenDto,
  PersonalRelationshipsNumberOfChildrenUpdateRequest,
  PersonalRelationshipsReferenceCode,
  PersonalRelationshipsReferenceDataDomain,
} from './interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import { mapToQueryString } from '../utils/utils'

export default class PersonalRelationshipsApiRestClient implements PersonalRelationshipsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Personal Relationships API', config.apis.personalRelationshipsApi, token)
  }

  getContacts(
    prisonerNumber: string,
    queryParams?: PersonalRelationshipsContactQueryParams,
  ): Promise<PersonalRelationshipsContactsDto> {
    return this.restClient.get({ path: `/prisoner/${prisonerNumber}/contact`, query: mapToQueryString(queryParams) })
  }

  getContactCount(prisonerNumber: string): Promise<PersonalRelationshipsContactCount> {
    return this.restClient.get({ path: `/prisoner/${prisonerNumber}/contact/count` })
  }

  getNumberOfChildren(prisonerNumber: string): Promise<PersonalRelationshipsNumberOfChildrenDto> {
    return this.restClient.get({ path: `/prisoner/${prisonerNumber}/number-of-children`, ignore404: true })
  }

  updateNumberOfChildren(
    prisonerNumber: string,
    updateRequest: PersonalRelationshipsNumberOfChildrenUpdateRequest,
  ): Promise<PersonalRelationshipsNumberOfChildrenDto> {
    return this.restClient.put({ path: `/prisoner/${prisonerNumber}/number-of-children`, data: updateRequest })
  }

  getDomesticStatus(prisonerNumber: string): Promise<PersonalRelationshipsDomesticStatusDto> {
    return this.restClient.get({ path: `/prisoner/${prisonerNumber}/domestic-status`, ignore404: true })
  }

  updateDomesticStatus(
    prisonerNumber: string,
    updateRequest: PersonalRelationshipsDomesticStatusUpdateRequest,
  ): Promise<PersonalRelationshipsDomesticStatusDto> {
    return this.restClient.put({ path: `/prisoner/${prisonerNumber}/domestic-status`, data: updateRequest })
  }

  getReferenceDataCodes(
    domain: PersonalRelationshipsReferenceDataDomain,
  ): Promise<PersonalRelationshipsReferenceCode[]> {
    return this.restClient.get({ path: `/reference-codes/group/${domain}` })
  }

  createContact(contact: PersonalRelationshipsContactRequest): Promise<PersonalRelationshipsContactCreationResultDto> {
    return this.restClient.post({ path: '/contact', data: contact })
  }

  addContactAddress(contactId: number, address: PersonalRelationshipsContactRequestAddress): Promise<void> {
    return this.restClient.post({ path: `/contact/${contactId}/address`, data: address })
  }
}
