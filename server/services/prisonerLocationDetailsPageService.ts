import { LocationDetails, LocationDetailsGroupedByPeriodAtAgency } from '../interfaces/pages/locationDetailsPageData'
import { groupBy } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'

interface LocationDetailsWithAgencyOrder extends LocationDetails {
  agencyPeriodId: number
}

export default class PrisonerLocationDetailsPageService {
  constructor() {}

  getLocationDetailsGroupedByPeriodAtAgency = (
    locationDetails: LocationDetails[],
  ): LocationDetailsGroupedByPeriodAtAgency[] => {
    const locationsWithGroups = this.addGroupingIdForPeriodAtAgency(locationDetails)
    return Object.values(groupBy(locationsWithGroups, 'agencyPeriodId')).map(locations => {
      return {
        name: locations[0].establishment,
        fromDateString: formatDate(locations.slice(-1)[0].assignmentDateTime, 'short'),
        toDateString: formatDate(locations[0].assignmentEndDateTime, 'short') || 'Unknown',
        locationDetails: locations.map(locationWithGroup => {
          const { agencyPeriodId, ...location } = locationWithGroup
          return location
        }),
        isValidAgency: !!locations[0].establishment,
      }
    })
  }

  /**
   * This function assists with grouping locations together by consecutive periods spent within an agency. Whenever the
   * agency changes between two consecutive locations, a new 'agencyPeriodId' is assigned.
   */
  private addGroupingIdForPeriodAtAgency = (locations: LocationDetails[]): LocationDetailsWithAgencyOrder[] => {
    const addAgencyPeriodId = (
      prev: LocationDetailsWithAgencyOrder | null,
      location: LocationDetails,
    ): LocationDetailsWithAgencyOrder => {
      if (!prev) return { ...location, agencyPeriodId: 0 }
      return {
        ...location,
        agencyPeriodId: prev.agencyId === location.agencyId ? prev.agencyPeriodId : prev.agencyPeriodId + 1,
      }
    }

    return locations.reduce<LocationDetailsWithAgencyOrder[]>((result, location) => {
      const prevLocation = result[result.length - 1] || null
      return [...result, addAgencyPeriodId(prevLocation, location)]
    }, [])
  }
}
