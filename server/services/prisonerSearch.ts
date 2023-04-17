import PrisonerSearchClient from '../data/prisonerSearchClient'
import { Prisoner } from '../interfaces/prisoner'

export default class PrisonerSearchService {
  private prisonerSearchClient: PrisonerSearchClient

  constructor(clientToken: string) {
    this.prisonerSearchClient = new PrisonerSearchClient(clientToken)
  }

  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    return this.prisonerSearchClient.getPrisonerDetails(prisonerNumber)
  }
}
