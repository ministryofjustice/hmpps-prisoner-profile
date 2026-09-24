import logger from '../../logger'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import HistoryForLocationItem from '../data/interfaces/prisonApi/HistoryForLocationItem'
import { errorHasStatus } from '../utils/errorHelpers'
import { formatName } from '../utils/utils'
import { RestClientBuilder } from '../data'
import { CellMovementsApiClient } from '../data/interfaces/cellMovementsApi'
import AttributesForLocation from '../data/interfaces/locationsInsidePrisonApi/AttributesForLocation'
import { AgencyDetails } from '../data/interfaces/prisonApi/Agency'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import CellMoveReasonType from '../data/interfaces/prisonApi/CellMoveReasonTypes'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'
import { NomisSyncPrisonerMappingApiClient } from '../data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'

type PrisonerLocationHistoryResponse = {
  agencyDetails: AgencyDetails
  cellMoveReasonTypes: CellMoveReasonType[]
  currentPrisonerDetails: HistoryForLocationItem
  locationAttributes: AttributesForLocation
  locationHistoryWithPrisoner: (HistoryForLocationItem & InmateDetail)[]
  movementMadeByName: string
  whatHappenedDetails: string
}
export default class PrisonerLocationHistoryService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly cellMovementsApiClientBuilder: RestClientBuilder<CellMovementsApiClient>,
    private readonly locationsInsidePrisonApiClientBuilder: RestClientBuilder<LocationsInsidePrisonApiClient>,
    private readonly nomisSyncPrisonerMappingApiClientBuilder: RestClientBuilder<NomisSyncPrisonerMappingApiClient>,
  ) {}

  public async getPrisonerLocationHistory(
    token: string,
    prisonerData: Prisoner,
    agencyId: string,
    locationId: string,
    fromDate: string,
    toDate: string,
  ): Promise<PrisonerLocationHistoryResponse> {
    const fetchStaffName = async (username: string, prisonApi: PrisonApiClient) => {
      const staffDetails = await prisonApi.getStaffDetails(username)
      return staffDetails ? formatName(staffDetails.firstName, '', staffDetails.lastName) : username
    }

    // One call to the cell movements API replaces the whereabouts + case-notes two-hop this made
    // before: commentText is the explanation the case note used to hold. 404 (nothing recorded
    // through DPS for this bed assignment) is the common case and returns null, as it always has.
    const fetchWhatHappened = async (
      bookingId: number,
      bedAssignmentHistorySequence: number,
      cellMovementsApi: CellMovementsApiClient,
    ) => {
      const reason = await cellMovementsApi.getCellMovementReason(bookingId, bedAssignmentHistorySequence, true)
      return reason?.commentText ?? null
    }

    const getLocationHistoryWithPrisoner = async (
      locationHistory: HistoryForLocationItem[],
      prisonApiClient: PrisonApiClient,
    ) => {
      return Promise.all(
        locationHistory.map(async (record: HistoryForLocationItem) => ({
          ...record,
          ...(await prisonApiClient.getInmateDetail(record.bookingId)),
        })),
      )
    }

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const cellMovementsApiClient = this.cellMovementsApiClientBuilder(token)
    const locationsInsidePrisonApiClient = this.locationsInsidePrisonApiClientBuilder(token)
    const nomisSyncPrisonerMappingApiClient = this.nomisSyncPrisonerMappingApiClientBuilder(token)

    const { bookingId } = prisonerData

    const { dpsLocationId } = await nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId(
      parseInt(locationId, 10),
    )

    const [location, locationAtrbts, locationHistory, agencyDetails, cellMoveReasonTypes] = await Promise.all([
      locationsInsidePrisonApiClient.getLocation(dpsLocationId),
      locationsInsidePrisonApiClient.getLocationAttributes(dpsLocationId).catch(error => {
        if (errorHasStatus(error, 404)) {
          // api returns 404 if location is not a cell
          logger.warn(error, 'Cannot get location attributes')
          return <never[]>[]
        }
        throw error
      }),
      prisonApiClient.getHistoryForLocation(locationId, fromDate as string, toDate as string),
      prisonApiClient.getAgencyDetails(agencyId.toString()),
      prisonApiClient.getCellMoveReasonTypes(),
    ])

    const locationAttributes = {
      attributes: locationAtrbts.map(attribute => ({ code: attribute.code, description: attribute.description })),
      description: location.key,
    }

    const currentPrisonerDetails =
      locationHistory.find((record: HistoryForLocationItem) => record.bookingId.toString() === bookingId.toString()) ||
      ({} as HistoryForLocationItem)

    const { movementMadeBy, bedAssignmentHistorySequence } = currentPrisonerDetails

    const [movementMadeByName, whatHappenedDetails, locationHistoryWithPrisoner] = await Promise.all([
      fetchStaffName(movementMadeBy, prisonApiClient),
      fetchWhatHappened(bookingId, bedAssignmentHistorySequence, cellMovementsApiClient),
      getLocationHistoryWithPrisoner(locationHistory, prisonApiClient),
    ])

    return {
      agencyDetails,
      cellMoveReasonTypes,
      currentPrisonerDetails,
      locationAttributes,
      locationHistoryWithPrisoner,
      movementMadeByName,
      whatHappenedDetails,
    }
  }
}
