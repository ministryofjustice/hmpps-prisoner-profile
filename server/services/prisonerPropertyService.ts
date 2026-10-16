import { RestClientBuilder } from '../data'
import type {
  PrisonerPropertyApiClient,
  PrisonerPropertySummary,
} from '../data/interfaces/prisonerPropertyApi/prisonerPropertyApiClient'

export default class PrisonerPropertyService {
  constructor(private readonly prisonerPropertyApiClientBuilder: RestClientBuilder<PrisonerPropertyApiClient>) {}

  async getPropertySummary(token: string, prisonerNumber: string): Promise<PrisonerPropertySummary> {
    return this.prisonerPropertyApiClientBuilder(token).getPrisonerPropertySummary(prisonerNumber)
  }
}
