import { extractLocation, groupBy, isTemporaryLocation } from '../utils/utils'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import OffenderBooking from '../data/interfaces/prisonApi/OffenderBooking'
import LocationDetails, {
  LocationDetailsGroupedByPeriodAtAgency,
} from './interfaces/locationDetailsService/LocationDetails'
import { NomisSyncPrisonerMappingApiClient } from '../data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'
import NomisSyncLocation from '../data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncLocation'
import LocationsApiLocation from '../data/interfaces/locationsInsidePrisonApi/LocationsApiLocation'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'

export default class LocationDetailsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly nomisSyncPrisonMappingClientBuilder: RestClientBuilder<NomisSyncPrisonerMappingApiClient>,
    private readonly locationsInsidePrisonApiClientBuilder: RestClientBuilder<LocationsInsidePrisonApiClient>,
  ) {}

  getLocationMappingUsingNomisLocationId = (clientToken: string, locationId: number): Promise<NomisSyncLocation> => {
    return this.nomisSyncPrisonMappingClientBuilder(clientToken).getMappingUsingNomisLocationId(locationId)
  }

  getLocationMappingUsingDpsLocationId = (clientToken: string, locationId: string): Promise<NomisSyncLocation> => {
    return this.nomisSyncPrisonMappingClientBuilder(clientToken).getMappingUsingDpsLocationId(locationId)
  }

  public async getLocation(clientToken: string, locationId: string): Promise<LocationsApiLocation> {
    return this.locationsInsidePrisonApiClientBuilder(clientToken).getLocation(locationId)
  }

  getLocationByNomisLocationId = (clientToken: string, locationId: number): Promise<LocationsApiLocation> => {
    return this.getLocationMappingUsingNomisLocationId(clientToken, locationId).then(map =>
      this.getLocation(clientToken, map.dpsLocationId),
    )
  }

  public async getLocationsForAppointments(clientToken: string, prisonId: string): Promise<LocationsApiLocation[]> {
    return this.locationsInsidePrisonApiClientBuilder(clientToken).getLocationsForAppointments(prisonId)
  }

  getInmatesAtLocation = (clientToken: string, livingUnitId: number): Promise<OffenderBooking[]> => {
    return this.prisonApiClientBuilder(clientToken).getInmatesAtLocation(livingUnitId, {})
  }

  isReceptionFull = async (clientToken: string, prisonId: string): Promise<boolean> => {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    const receptionsWithCapacity = await prisonApiClient.getReceptionsWithCapacity(prisonId)
    return !receptionsWithCapacity.length
  }

  getLocationDetailsByLatestFirst = async (
    clientToken: string,
    prisonerNumber: string,
    bookingId: number,
  ): Promise<LocationDetails[]> => {
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
        prisonerNumber,
        agencyId,
        agencyName: agencyDescription,
        livingUnitId: cell.livingUnitId,
        location: extractLocation(cell.description, agencyId),
        isTemporaryLocation: isTemporaryLocation(cell.description),
        assignmentDateTime: cell.assignmentDateTime,
        assignmentEndDateTime: cell.assignmentEndDateTime,
        movementMadeByUsername: cell.movementMadeBy,
        movementMadeByStaffDetails: staffDetails,
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
        agencyName: locations[0].agencyName,
        fromDate: locations.slice(-1)[0].assignmentDateTime,
        toDate: locations[0].assignmentEndDateTime,
        locationDetails: locations.map(locationWithGroup => {
          const { agencyPeriodId, ...location } = locationWithGroup
          return location
        }),
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

interface LocationDetailsWithAgencyOrder extends LocationDetails {
  agencyPeriodId: number
}
