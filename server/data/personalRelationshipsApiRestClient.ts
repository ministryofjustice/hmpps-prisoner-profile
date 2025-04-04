import RestClient from './restClient'
import config from '../config'
import {
  ContactsDto,
  PersonalRelationshipsApiClient,
  PersonalRelationshipType,
} from './interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export default class PersonalRelationshipsApiRestClient implements PersonalRelationshipsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Personal Relationships API', config.apis.personalRelationshipsApi, token)
  }

  getContacts(
    prisonerNumber: string,
    relationshipType?: PersonalRelationshipType,
    page?: number,
    size?: number,
  ): Promise<ContactsDto> {
    return this.restClient.get({
      path: `/prisoner/${prisonerNumber}/contact`,
      query: {
        relationshipType,
        page,
        size,
      },
    })
  }
}
