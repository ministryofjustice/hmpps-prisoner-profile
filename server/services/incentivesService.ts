import { differenceInDays, isAfter } from 'date-fns'
import { RestClientBuilder } from '../data'
import { formatDateISO } from '../utils/dateHelpers'
import { IncentivesApiClient } from '../data/interfaces/incentivesApi/incentivesApiClient'
import IncentiveSummary from './interfaces/incentivesService/IncentiveSummary'
import CaseNotesApiClient from '../data/interfaces/caseNotesApi/caseNotesApiClient'

export default class IncentivesService {
  constructor(
    private readonly caseNotesApiClientBuilder: RestClientBuilder<CaseNotesApiClient>,
    private readonly incentivesApiClientBuilder: RestClientBuilder<IncentivesApiClient>,
  ) {}

  async getIncentiveOverview(clientToken: string, prisonerNumber: string): Promise<IncentiveSummary | { error: true }> {
    const caseNotesApiClient = this.caseNotesApiClientBuilder(clientToken)
    const incentivesApiClient = this.incentivesApiClientBuilder(clientToken)

    // TODO use the RESULT type for this
    try {
      const incentiveReviews = await incentivesApiClient.getReviews(prisonerNumber)

      if (!incentiveReviews)
        return { positiveBehaviourCount: null, negativeBehaviourCount: null, nextReviewDate: null, daysOverdue: null }

      const { positiveBehaviourCount, negativeBehaviourCount } = await caseNotesApiClient.getIncentivesCaseNoteCount(
        prisonerNumber,
        incentiveReviews?.iepDate,
        formatDateISO(new Date()),
      )

      return {
        positiveBehaviourCount,
        negativeBehaviourCount,
        nextReviewDate: incentiveReviews?.nextReviewDate,
        daysOverdue: isAfter(new Date(), new Date(incentiveReviews?.nextReviewDate))
          ? differenceInDays(new Date(), new Date(incentiveReviews?.nextReviewDate))
          : undefined,
      }
    } catch (_error) {
      return { error: true }
    }
  }
}
