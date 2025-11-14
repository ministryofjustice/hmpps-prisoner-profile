import { differenceInDays, isAfter } from 'date-fns'
import { RestClientBuilder } from '../data'
import { formatDateTimeISO } from '../utils/dateHelpers'
import { IncentivesApiClient } from '../data/interfaces/incentivesApi/incentivesApiClient'
import IncentiveSummary from './interfaces/incentivesService/IncentiveSummary'
import CaseNotesApiClient from '../data/interfaces/caseNotesApi/caseNotesApiClient'

export default class IncentivesService {
  constructor(
    private readonly caseNotesApiClientBuilder: RestClientBuilder<CaseNotesApiClient>,
    private readonly incentivesApiClientBuilder: RestClientBuilder<IncentivesApiClient>,
  ) {}

  async getIncentiveOverview(clientToken: string, prisonerNumber: string): Promise<IncentiveSummary> {
    const caseNotesApiClient = this.caseNotesApiClientBuilder(clientToken)
    const incentivesApiClient = this.incentivesApiClientBuilder(clientToken)
    const incentiveReviews = await incentivesApiClient.getReviews(prisonerNumber)

    if (!incentiveReviews)
      return { positiveBehaviourCount: null, negativeBehaviourCount: null, nextReviewDate: null, daysOverdue: null }

    const startDate = incentiveReviews?.iepDate
      ? formatDateTimeISO(new Date(incentiveReviews?.iepDate), { startOfDay: true })
      : undefined

    const { positiveBehaviourCount, negativeBehaviourCount } = await caseNotesApiClient.getIncentivesCaseNoteCount(
      prisonerNumber,
      startDate,
      formatDateTimeISO(new Date(), { endOfDay: true }),
    )

    return {
      positiveBehaviourCount,
      negativeBehaviourCount,
      nextReviewDate: incentiveReviews?.nextReviewDate,
      daysOverdue: isAfter(new Date(), new Date(incentiveReviews?.nextReviewDate))
        ? differenceInDays(new Date(), new Date(incentiveReviews?.nextReviewDate))
        : undefined,
    }
  }
}
