import { LocationDetails, LocationDetailsGroupedByPeriodAtAgency } from '../interfaces/pages/locationDetailsPageData'
import { extractLocation, formatName, groupBy, isTemporaryLocation } from '../utils/utils'
import { formatDate, formatDateTime } from '../utils/dateHelpers'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { OffenderBooking } from '../interfaces/prisonApi/offenderBooking'

interface LocationDetailsWithAgencyOrder extends LocationDetails {
  agencyPeriodId: number
}

export default class PrisonerLocationDetailsService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  getInmatesAtLocation(clientToken: string, livingUnitId: number): Promise<OffenderBooking[]> {
    return this.prisonApiClientBuilder(clientToken).getInmatesAtLocation(livingUnitId, {})
  }

  isReceptionFull = async (clientToken: string, prisonId: string): Promise<boolean> => {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    const receptionsWithCapacity = await prisonApiClient.getReceptionsWithCapacity(prisonId)
    return !receptionsWithCapacity.length
  }

  getLocationDetailsByLatestFirst = async (clientToken: string, bookingId: number): Promise<LocationDetails[]> => {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)

    const cells = await prisonApiClient.getOffenderCellHistory(bookingId, { page: 0, size: 10000 })
    if (!cells.content.length) return []

    const uniqueAgencyIds = [...new Set(cells.content.filter(cell => cell.agencyId).map(cell => cell.agencyId))]
    const uniqueUsernames = [...new Set(cells.content.map(cell => cell.movementMadeBy))]
    const [prisons, staff] = await Promise.all([
      await Promise.all(uniqueAgencyIds.map(agencyId => prisonApiClient.getAgencyDetails(agencyId))),
      await Promise.all(uniqueUsernames.map(username => prisonApiClient.getStaffDetails(username))),
    ])

    const locationDetails = cells.content.map<LocationDetails>(cell => {
      const staffDetails = staff.find(user => cell.movementMadeBy === user?.username)
      const { agencyId } = cell
      const agency = prisons.find(prison => cell.agencyId === prison.agencyId)
      const agencyDescription = agency?.description

      return {
        agencyId,
        establishment: agencyDescription,
        location: extractLocation(cell.description, agencyId),
        isTemporaryLocation: isTemporaryLocation(cell.description),
        movedIn: cell.assignmentDateTime && formatDateTime(cell.assignmentDateTime, 'short', ' - '),
        movedOut: cell.assignmentEndDateTime && formatDateTime(cell.assignmentEndDateTime, 'short', ' - '),
        assignmentDateTime: cell.assignmentDateTime,
        assignmentEndDateTime: cell.assignmentEndDateTime,
        livingUnitId: cell.livingUnitId,
        movedInBy: staffDetails ? formatName(staffDetails.firstName, '', staffDetails.lastName) : cell.movementMadeBy,
      }
    })

    return locationDetails.sort(
      (a, b) => new Date(b.assignmentDateTime).getTime() - new Date(a.assignmentDateTime).getTime(),
    )
  }

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
