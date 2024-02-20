import { RestClientBuilder } from '../data'
import { IncentivesApiClient } from '../data/interfaces/incentivesApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { IncentiveDetailsDto, IncentiveReviewSummary } from '../interfaces/IncentivesApi/incentiveReviews'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'

export default class IncentivesService {
  constructor(
    private readonly incentivesApiClientBuilder: RestClientBuilder<IncentivesApiClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
  ) {}

  /**
   * Handle request for incentive review summary
   *
   */
  public async getIncentiveReviewSummary(
    token: string,
    bookingId: number,
    withDetails?: boolean,
  ): Promise<IncentiveDetailsDto> {
    const incentiveReviewSummary: IncentiveReviewSummary = await this.incentivesApiClientBuilder(
      token,
    ).getReviewSummary(bookingId, withDetails)

    const prisonApiClient = this.prisonApiClientBuilder(token)

    const uniqueAgencyIds = [...new Set(incentiveReviewSummary?.iepDetails?.map(review => review.agencyId))]
    const uniqueUsernames = [...new Set(incentiveReviewSummary?.iepDetails?.map(review => review.userId))]

    const [prisons, staff] = await Promise.all([
      await Promise.all(uniqueAgencyIds.map(agencyId => prisonApiClient.getAgencyDetails(agencyId))),
      await Promise.all(uniqueUsernames.map(username => prisonApiClient.getStaffDetails(username))),
    ])

    // Include user-friendly display name where INCENTIVES_API is the username logged as creating the record
    const incentivesSystemUser = {
      username: 'INCENTIVES_API',
      firstName: 'System',
      lastName: '',
    } as StaffDetails

    return {
      incentiveReviewSummary,
      prisons: prisons.filter(Boolean),
      staff: [...staff.filter(Boolean), incentivesSystemUser],
    }
  }
}
