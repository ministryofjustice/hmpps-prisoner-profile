import { differenceInDays, isAfter } from 'date-fns'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { formatDateISO } from '../utils/dateHelpers'
import { IncentivesApiClient } from '../data/interfaces/incentivesApi/incentivesApiClient'
import { CaseNoteSubType, CaseNoteType } from '../data/enums/caseNoteType'
import IncentiveSummary from './interfaces/incentivesService/IncentiveSummary'

export default class IncentivesService {
  constructor(
    private readonly incentivesApiClientBuilder: RestClientBuilder<IncentivesApiClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
  ) {}

  async getIncentiveOverview(clientToken: string, prisonerNumber: string): Promise<IncentiveSummary | { error: true }> {
    const incentivesApiClient = this.incentivesApiClientBuilder(clientToken)
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)

    // TODO use the RESULT type for this
    try {
      const incentiveReviews = await incentivesApiClient.getReviews(prisonerNumber)

      if (!incentiveReviews)
        return { positiveBehaviourCount: null, negativeBehaviourCount: null, nextReviewDate: null, daysOverdue: null }

      const [positiveBehaviourCount, negativeBehaviourCount] = await Promise.all([
        prisonApiClient.getCaseNoteCount(
          incentiveReviews.bookingId,
          CaseNoteType.PositiveBehaviour,
          CaseNoteSubType.IncentiveEncouragement,
          incentiveReviews?.iepDate,
          formatDateISO(new Date()),
        ),
        prisonApiClient.getCaseNoteCount(
          incentiveReviews.bookingId,
          CaseNoteType.NegativeBehaviour,
          CaseNoteSubType.IncentiveWarning,
          incentiveReviews?.iepDate,
          formatDateISO(new Date()),
        ),
      ])

      return {
        positiveBehaviourCount: positiveBehaviourCount.count,
        negativeBehaviourCount: negativeBehaviourCount.count,
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
