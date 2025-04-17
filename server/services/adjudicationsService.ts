import { RestClientBuilder } from '../data'
import AdjudicationsApiClient from '../data/interfaces/adjudicationsApi/adjudicationsApiClient'
import AdjudicationsOverviewSummary from './interfaces/adjudicationsService/AdjudicationsOverviewSummary'

export default class AdjudicationsService {
  constructor(private readonly adjudicationsApiClientBuilder: RestClientBuilder<AdjudicationsApiClient>) {}

  async getAdjudicationsOverview(clientToken: string, bookingId: number): Promise<AdjudicationsOverviewSummary> {
    const adjudicationsApiClient = this.adjudicationsApiClientBuilder(clientToken)
    const adjudicationSummary = await adjudicationsApiClient.getAdjudications(bookingId)
    return {
      adjudicationCount: adjudicationSummary.adjudicationCount,
      activePunishments: adjudicationSummary.awards?.length,
    }
  }
}
