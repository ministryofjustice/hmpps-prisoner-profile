import { RestClientBuilder } from '../data'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipType,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import { Result } from '../utils/result/result'

interface ContactsCount {
  official: Result<number>
  social: Result<number>
}

export default class ContactsService {
  constructor(
    private readonly personalRelationshipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
  ) {}

  async getContactsCount(
    clientToken: string,
    prisonerNumber: string,
    apiErrorCallback: (error: Error) => void = () => null,
  ): Promise<ContactsCount> {
    const minimalPageSize = 1
    const personalRelationshipsApi = this.personalRelationshipsApiClientBuilder(clientToken)

    const [officialContactInfo, socialContactInfo] = await Promise.all([
      Result.wrap(
        personalRelationshipsApi.getContacts(prisonerNumber, PersonalRelationshipType.Official, minimalPageSize),
        apiErrorCallback,
      ),
      Result.wrap(
        personalRelationshipsApi.getContacts(prisonerNumber, PersonalRelationshipType.Social, minimalPageSize),
        apiErrorCallback,
      ),
    ])
    return {
      official: officialContactInfo.map(info => info.page.totalElements ?? 0),
      social: socialContactInfo.map(info => info.page.totalElements ?? 0),
    }
  }
}
