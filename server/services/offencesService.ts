import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import {
  mapLatestCalculationSummary,
  mapNextCourtAppearanceSummary,
} from './mappers/courtAppearanceAndReleaseDateMappers'
import CalculateReleaseDatesApiClient from '../data/interfaces/calculateReleaseDatesApi/calculateReleaseDatesApiClient'

export default class OffencesService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly calculateReleaseDatesApiClientBuilder: RestClientBuilder<CalculateReleaseDatesApiClient>,
  ) {}

  async getNextCourtHearingSummary(token: string, bookingId: number) {
    const prisonApi = this.prisonApiClientBuilder(token)
    const response = await prisonApi.getNextCourtEvent(bookingId)
    return mapNextCourtAppearanceSummary(response)
  }

  getActiveCourtCasesCount(token: string, bookingId: number) {
    const prisonApi = this.prisonApiClientBuilder(token)
    return prisonApi.getActiveCourtCasesCount(bookingId)
  }

  async getLatestReleaseCalculation(token: string, prisonNumber: string) {
    const releaseDatesApi = this.calculateReleaseDatesApiClientBuilder(token)
    const response = await releaseDatesApi.getLatestCalculation(prisonNumber)

    return mapLatestCalculationSummary(response)
  }

  async getOffencesOverview(token: string, bookingId: number, prisonerNumber: string) {
    const prisonApi = this.prisonApiClientBuilder(token)
    const [mainOffence, fullStatus] = await Promise.all([
      prisonApi.getMainOffence(bookingId),
      prisonApi.getFullStatus(prisonerNumber),
    ])

    return {
      mainOffenceDescription: mainOffence[0]?.offenceDescription,
      fullStatus,
    }
  }
}
