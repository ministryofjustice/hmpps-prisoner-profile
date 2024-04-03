import { differenceInYears } from 'date-fns'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { Visitor } from '../data/interfaces/prisonApi/VisitWithVisitors'
import { compareStrings, sortByDateTime } from '../utils/utils'
import { ReferenceCodeDomain } from '../data/interfaces/prisonApi/ReferenceCode'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { VisitsListQueryParams } from '../data/interfaces/prisonApi/PagedList'

export class VisitsService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public sortVisitors(visitors: Visitor[]): (Visitor & { ageInYearsOr18IfNoDob: number })[] {
    const sortFunc = (
      left: Visitor & { ageInYearsOr18IfNoDob: number },
      right: Visitor & { ageInYearsOr18IfNoDob: number },
    ): number => {
      if (right.leadVisitor && right.ageInYearsOr18IfNoDob >= 18) return 1
      if (left.leadVisitor && left.ageInYearsOr18IfNoDob >= 18) return -1

      // age set to 18 for people with no dob - assumed to be adults. Need to sort them above the children
      if (right.ageInYearsOr18IfNoDob - left.ageInYearsOr18IfNoDob !== 0)
        return right.ageInYearsOr18IfNoDob - left.ageInYearsOr18IfNoDob

      const dateOfBirthSort = sortByDateTime(left.dateOfBirth, right.dateOfBirth)
      const lastNameSort = dateOfBirthSort !== 0 ? dateOfBirthSort : compareStrings(left.lastName, right.lastName)
      return lastNameSort !== 0 ? lastNameSort : compareStrings(left.firstName, right.firstName)
    }

    return visitors
      .map(v => ({
        ...v,
        ageInYearsOr18IfNoDob: v.dateOfBirth ? differenceInYears(new Date(), new Date(v.dateOfBirth)) : 18,
      }))
      .sort(sortFunc)
  }

  public async getVisits(token: string, prisonerData: Prisoner, visitsQuery: VisitsListQueryParams) {
    const { bookingId } = prisonerData
    const apiParams = { ...visitsQuery }
    if (apiParams.page) apiParams.page = apiParams.page && +apiParams.page - 1 // Change page to zero based for API query

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const [completionReasons, cancellationReasons, prisons, visitsWithVisitors] = await Promise.all([
      prisonApiClient.getReferenceCodesByDomain(ReferenceCodeDomain.VisitCompletionReasons),
      prisonApiClient.getReferenceCodesByDomain(ReferenceCodeDomain.VisitCancellationReasons),
      prisonApiClient.getVisitsPrisons(bookingId),
      prisonApiClient.getVisitsForBookingWithVisitors(bookingId, apiParams),
    ])

    return {
      completionReasons,
      cancellationReasons,
      prisons,
      visitsWithPaginationInfo: visitsWithVisitors,
    }
  }
}
