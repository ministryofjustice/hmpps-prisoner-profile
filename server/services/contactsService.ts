import { RestClientBuilder } from '../data'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContactCount,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export default class ContactsService {
  constructor(
    private readonly personalRelationshipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
  ) {}

  async getExternalContactsCount(
    clientToken: string,
    prisonerNumber: string,
  ): Promise<PersonalRelationshipsContactCount> {
    const personalRelationshipsApi = this.personalRelationshipsApiClientBuilder(clientToken)

    const { social, official } = await personalRelationshipsApi.getContactCount(prisonerNumber)

    return {
      official,
      social,
    }
  }
}
