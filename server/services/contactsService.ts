import { RestClientBuilder } from '../data'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipType,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export interface ExternalContactsCount {
  official: number
  social: number
}

export default class ContactsService {
  constructor(
    private readonly personalRelationshipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
  ) {}

  async getExternalContactsCount(clientToken: string, prisonerNumber: string): Promise<ExternalContactsCount> {
    const firstPage = 0
    const minimalPageSize = 1
    const personalRelationshipsApi = this.personalRelationshipsApiClientBuilder(clientToken)

    const [officialContactInfo, socialContactInfo] = await Promise.all([
      personalRelationshipsApi.getContacts(prisonerNumber, {
        relationshipType: PersonalRelationshipType.Official,
        page: firstPage,
        size: minimalPageSize,
      }),
      personalRelationshipsApi.getContacts(prisonerNumber, {
        relationshipType: PersonalRelationshipType.Social,
        page: firstPage,
        size: minimalPageSize,
      }),
    ])
    return {
      official: officialContactInfo?.page?.totalElements ?? 0,
      social: socialContactInfo?.page?.totalElements ?? 0,
    }
  }
}
