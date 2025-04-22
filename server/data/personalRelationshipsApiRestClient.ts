import RestClient from './restClient'
import config from '../config'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContactQueryParams,
  PersonalRelationshipsContactRequest,
  PersonalRelationshipsContactsDto,
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

  getReferenceDataCodes(
    domain: PersonalRelationshipsReferenceDataDomain,
  ): Promise<PersonalRelationshipsReferenceCode[]> {
    return this.restClient.get({ path: `/reference-codes/group/${domain}` })
  }

  createContact(contact: PersonalRelationshipsContactRequest): Promise<void> {
    return this.restClient.post({ path: '/contact', data: contact })
  }
}
