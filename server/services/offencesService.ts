import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { mapNextCourtAppearanceSummary } from './mappers/courtAppearanceAndReleaseDateMappers'

export default class OffencesService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  async getNextCourtAppearanceSummary(token: string, bookingId: number) {
    const prisonApi = this.prisonApiClientBuilder(token)
    const response = await prisonApi.getNextCourtEvent(bookingId)
    return mapNextCourtAppearanceSummary(response)
  }
}
