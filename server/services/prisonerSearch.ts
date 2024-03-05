import { RestClientBuilder } from '../data'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchApi/prisonerSearchClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'

export default class PrisonerSearchService {
  constructor(private readonly prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient>) {}

  getPrisonerDetails(clientToken: string, prisonerNumber: string): Promise<Prisoner> {
    return this.prisonerSearchClientBuilder(clientToken).getPrisonerDetails(prisonerNumber)
  }
}
