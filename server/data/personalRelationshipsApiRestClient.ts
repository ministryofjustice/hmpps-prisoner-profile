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

export default class PersonalRelationshipsApiRestClient extends RestClient implements PersonalRelationshipsApiClient {
  constructor(token: string) {
    super('Personal Relationships API', config.apis.personalRelationshipsApi, token)
  }

  getContacts(
    prisonerNumber: string,
    queryParams?: PersonalRelationshipsContactQueryParams,
  ): Promise<PersonalRelationshipsContactsDto> {
    return this.get({ path: `/prisoner/${prisonerNumber}/contact`, query: mapToQueryString(queryParams) }, this.token)
  }

  getContactCount(prisonerNumber: string): Promise<PersonalRelationshipsContactCount> {
    return this.get({ path: `/prisoner/${prisonerNumber}/contact/count` }, this.token)
  }

  getNumberOfChildren(prisonerNumber: string): Promise<PersonalRelationshipsNumberOfChildrenDto | null> {
    return this.getAndIgnore404({ path: `/prisoner/${prisonerNumber}/number-of-children` })
  }

  updateNumberOfChildren(
    prisonerNumber: string,
    updateRequest: PersonalRelationshipsNumberOfChildrenUpdateRequest,
  ): Promise<PersonalRelationshipsNumberOfChildrenDto> {
    return this.put({ path: `/prisoner/${prisonerNumber}/number-of-children`, data: updateRequest }, this.token)
  }

  getDomesticStatus(prisonerNumber: string): Promise<PersonalRelationshipsDomesticStatusDto | null> {
    return this.getAndIgnore404({ path: `/prisoner/${prisonerNumber}/domestic-status` })
  }

  updateDomesticStatus(
    prisonerNumber: string,
    updateRequest: PersonalRelationshipsDomesticStatusUpdateRequest,
  ): Promise<PersonalRelationshipsDomesticStatusDto> {
    return this.put({ path: `/prisoner/${prisonerNumber}/domestic-status`, data: updateRequest }, this.token)
  }

  getReferenceDataCodes(
    domain: PersonalRelationshipsReferenceDataDomain,
  ): Promise<PersonalRelationshipsReferenceCode[]> {
    return this.get({ path: `/reference-codes/group/${domain}` }, this.token)
  }

  createContact(contact: PersonalRelationshipsContactRequest): Promise<PersonalRelationshipsContactCreationResultDto> {
    return this.post({ path: '/contact', data: contact }, this.token)
  }

  addContactAddress(contactId: number, address: PersonalRelationshipsContactRequestAddress): Promise<void> {
    return this.post({ path: `/contact/${contactId}/address`, data: address }, this.token)
  }
}
