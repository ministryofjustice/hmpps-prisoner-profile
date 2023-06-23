import { RestClientBuilder } from '../data'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import { Prisoner } from '../interfaces/prisoner'

export default class PrisonerSearchService {
  constructor(private readonly prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient>) {}

  getPrisonerDetails(clientToken: string, prisonerNumber: string): Promise<Prisoner> {
    return this.prisonerSearchClientBuilder(clientToken).getPrisonerDetails(prisonerNumber)
  }
}
