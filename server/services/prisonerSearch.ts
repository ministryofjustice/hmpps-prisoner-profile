import PrisonerSearchClient from '../data/prisonerSearchClient'
import { Prisoner } from '../interfaces/prisoner'

export default class PrisonerSearchService {
  constructor(private readonly prisonerSearchClient: PrisonerSearchClient) {}

  getPrisonerDetails(token: string, prisonerNumber: string): Promise<Prisoner> {
    return this.prisonerSearchClient.getPrisonerDetails(token, prisonerNumber)
  }
}
