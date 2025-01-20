import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApi/whereaboutsApiClient'
import HistoryForLocationItem from '../data/interfaces/prisonApi/HistoryForLocationItem'
import { formatName } from '../utils/utils'
import { RestClientBuilder } from '../data'
import CaseNotesApiClient from '../data/interfaces/caseNotesApi/caseNotesApiClient'
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
    private readonly whereaboutsApiClientBuilder: RestClientBuilder<WhereaboutsApiClient>,
    private readonly caseNotesApiClientBuilder: RestClientBuilder<CaseNotesApiClient>,
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

    const fetchWhatHappened = async (
      bookingId: number,
      offenderNo: string,
      caseloadId: string,
      bedAssignmentHistorySequence: number,
      caseNotesApi: CaseNotesApiClient,
      whereaboutsApi: WhereaboutsApiClient,
    ) => {
      const cellMoveReason = await whereaboutsApi.getCellMoveReason(bookingId, bedAssignmentHistorySequence, true)
      if (cellMoveReason) {
        const caseNote = await caseNotesApi.getCaseNote(
          offenderNo,
          caseloadId,
          cellMoveReason.cellMoveReason?.caseNoteId.toString(),
          true,
        )

        if (caseNote) {
          return caseNote.text
        }
      }

      return null
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
    const whereaboutsApiClient = this.whereaboutsApiClientBuilder(token)
    const caseNotesApiClient = this.caseNotesApiClientBuilder(token)
    const locationsInsidePrisonApiClient = this.locationsInsidePrisonApiClientBuilder(token)
    const nomisSyncPrisonerMappingApiClient = this.nomisSyncPrisonerMappingApiClientBuilder(token)

    const { bookingId } = prisonerData

    const offenderNo = prisonerData.prisonerNumber

    const { dpsLocationId } = await nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId(
      parseInt(locationId, 10),
    )

    const [location, locationAtrbts, locationHistory, agencyDetails, cellMoveReasonTypes] = await Promise.all([
      locationsInsidePrisonApiClient.getLocation(dpsLocationId),
      locationsInsidePrisonApiClient.getLocationAttributes(dpsLocationId),
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
      fetchWhatHappened(
        bookingId,
        offenderNo,
        prisonerData.prisonId,
        bedAssignmentHistorySequence,
        caseNotesApiClient,
        whereaboutsApiClient,
      ),
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
