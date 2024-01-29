import { format } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Prisoner } from '../interfaces/prisoner'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApiClient'
import { CaseNotesApiClient } from '../data/interfaces/caseNotesApiClient'
import { HistoryForLocationItem } from '../interfaces/prisonApi/historyForLocation'
import { CellMoveReasonType } from '../interfaces/prisonApi/cellMoveReasonTypes'
import { CaseLoad } from '../interfaces/caseLoad'
import LocationHistoryPageData from '../interfaces/pages/locationHistoryPageData'
import { formatName, sortByDateTime, putLastNameFirst, hasLength, extractLocation } from '../utils/utils'
import { RestClientBuilder } from '../data'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

export type PrisonerLocationHistoryService = (
  token: string,
  prisonerData: Prisoner,
  agencyId: string,
  locationId: string,
  fromDate: string,
  toDate: string,
  userCaseLoads: CaseLoad[],
) => Promise<LocationHistoryPageData>

export default ({
  prisonApiClientBuilder,
  whereaboutsApiClientBuilder,
  caseNotesApiClientBuilder,
}: {
  prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>
  whereaboutsApiClientBuilder: RestClientBuilder<WhereaboutsApiClient>
  caseNotesApiClientBuilder: RestClientBuilder<CaseNotesApiClient>
}): PrisonerLocationHistoryService => {
  const fetchStaffName = async (staffId: string, prisonApi: PrisonApiClient) => {
    const staffDetails = await prisonApi.getStaffDetails(staffId)
    return formatName(staffDetails.firstName, '', staffDetails.lastName)
  }

  const fetchWhatHappened = async (
    bookingId: number,
    offenderNo: string,
    bedAssignmentHistorySequence: number,
    caseNotesApi: CaseNotesApiClient,
    whereaboutsApi: WhereaboutsApiClient,
  ) => {
    const cellMoveReason = await whereaboutsApi.getCellMoveReason(bookingId, bedAssignmentHistorySequence, true)
    if (cellMoveReason) {
      const caseNote = await caseNotesApi.getCaseNote(
        offenderNo,
        cellMoveReason.cellMoveReason?.caseNoteId.toString(),
        true,
      )

      if (caseNote) {
        return caseNote.text
      }
    }

    return null
  }

  const mapReasonToCellMoveReasonDescription = (cellMoveReasonTypes: CellMoveReasonType[], assignmentReason: string) =>
    cellMoveReasonTypes.find((type: CellMoveReasonType) => type.code === assignmentReason)?.description

  const getMovedOutText = (
    currentPrisonerDetails: HistoryForLocationItem,
    prisonerName: string,
    sharingOffenderEndTime: string,
  ) => {
    if (!currentPrisonerDetails.assignmentEndDateTime && !sharingOffenderEndTime) return 'Currently sharing'
    if (currentPrisonerDetails.assignmentEndDateTime && !sharingOffenderEndTime) return `${prisonerName} moved out`
    if (sharingOffenderEndTime) return format(new Date(sharingOffenderEndTime), 'dd/MM/yyyy - HH:mm')
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

  return async (token, prisonerData, agencyId, locationId, fromDate, toDate, userCaseLoads) => {
    const prisonApiClient = prisonApiClientBuilder(token)
    const whereaboutsApiClient = whereaboutsApiClientBuilder(token)
    const caseNotesApiClient = caseNotesApiClientBuilder(token)

    const { prisonerNumber, firstName, lastName, bookingId } = prisonerData
    const prisonerName = formatName(firstName, '', lastName)

    const offenderNo = prisonerData.prisonerNumber
    const userCaseLoadIds = userCaseLoads.map((caseLoad: CaseLoad) => caseLoad.caseLoadId)

    const [locationAttributes, locationHistory, agencyDetails, cellMoveReasonTypes] = await Promise.all([
      prisonApiClient.getAttributesForLocation(locationId.toString()),
      prisonApiClient.getHistoryForLocation(locationId as string, fromDate as string, toDate as string),
      prisonApiClient.getAgencyDetails(agencyId.toString()),
      prisonApiClient.getCellMoveReasonTypes(),
    ])

    const currentPrisonerDetails =
      locationHistory.find((record: HistoryForLocationItem) => record.bookingId.toString() === bookingId.toString()) ||
      ({} as HistoryForLocationItem)

    const { movementMadeBy, assignmentReason, bedAssignmentHistorySequence } = currentPrisonerDetails

    const movementMadeByName = await fetchStaffName(movementMadeBy, prisonApiClient)
    const whatHappenedDetails = await fetchWhatHappened(
      bookingId,
      offenderNo,
      bedAssignmentHistorySequence,
      caseNotesApiClient,
      whereaboutsApiClient,
    )

    const isDpsCellMove = Boolean(whatHappenedDetails)
    const assignmentReasonName =
      isDpsCellMove && mapReasonToCellMoveReasonDescription(cellMoveReasonTypes, assignmentReason)
    const locationHistoryWithPrisoner = await getLocationHistoryWithPrisoner(locationHistory, prisonApiClient)

    return {
      prisonerName,
      prisonerBreadcrumbName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
      prisonerNumber,
      locationName: extractLocation(locationAttributes.description, agencyId.toString()),

      locationDetails: {
        description: agencyDetails.description,
        movedIn:
          currentPrisonerDetails.assignmentDateTime &&
          format(new Date(currentPrisonerDetails.assignmentDateTime), 'dd/MM/yyyy - HH:mm'),
        movedOut: currentPrisonerDetails.assignmentEndDateTime
          ? format(new Date(currentPrisonerDetails.assignmentEndDateTime), 'dd/MM/yyyy - HH:mm')
          : 'Current cell',
        movedBy: movementMadeByName,
        reasonForMove: assignmentReasonName || 'Not entered',
        whatHappened: whatHappenedDetails || 'Not entered',
        attributes: locationAttributes.attributes,
      },

      locationSharingHistory: locationHistoryWithPrisoner
        .filter(prisoner => prisoner.bookingId.toString() !== bookingId.toString())
        .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))
        .map(prisoner => ({
          shouldLink: hasLength(userCaseLoadIds) && userCaseLoadIds.includes(prisoner.agencyId),
          name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
          number: prisoner.offenderNo,
          movedIn: prisoner.assignmentDateTime && format(new Date(prisoner.assignmentDateTime), 'dd/MM/yyyy - HH:mm'),
          movedOut: getMovedOutText(currentPrisonerDetails, prisonerName, prisoner.assignmentEndDateTime),
        })),
    }
  }
}
