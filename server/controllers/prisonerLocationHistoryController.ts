import moment from 'moment'
import { notEnteredMessage } from '../data/constants/common-messages'

import {
  formatName,
  formatTimestampToDateTime,
  sortByDateTime,
  putLastNameFirst,
  hasLength,
  extractLocation,
} from '../utils/utils'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { RestClientBuilder } from '../data'
import { Prisoner } from '../interfaces/prisoner'
import { Request, Response} from 'express'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApiClient'
import { CaseNotesApiClient } from '../data/interfaces/caseNotesApiClient'

export default class PrisonerLocationHistoryController {
    private prisonApiClient: PrisonApiClient
    private whereaboutsApiClient: WhereaboutsApiClient
    private caseNotesApiClient: CaseNotesApiClient
  
    constructor(
        private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
        private readonly whereAboutsClientBuilder: RestClientBuilder<WhereaboutsApiClient>,
        private readonly caseNotesApiClientBuilder: RestClientBuilder<CaseNotesApiClient>
        ) {}
  
    public async displayPrisonerLocationHistory(req: Request, res: Response, prisonerData: Prisoner) {

        const { clientToken } = res.locals
        this.prisonApiClient = this.prisonApiClientBuilder(clientToken)
        this.whereaboutsApiClient = this.whereAboutsClientBuilder(clientToken)
        this.caseNotesApiClient = this.caseNotesApiClientBuilder(clientToken)
        
        const fetchStaffName = (staffId: string, prisonApi: PrisonApiClient) =>
        prisonApi.getStaffDetails(staffId).then((staff: any) => formatName(staff.firstName, "", staff.lastName))



        const fetchWhatHappened = async (
        offenderNo: string,
        bookingId: number,
        bedAssignmentHistorySequence: number,
        caseNotesApi: CaseNotesApiClient,
        whereaboutsApi: WhereaboutsApiClient
        ) => {
            try {
                return await whereaboutsApi
                .getCellMoveReason(bookingId, bedAssignmentHistorySequence)
                .then((cellMoveReason: any) => caseNotesApi.getCaseNote(offenderNo, cellMoveReason?.cellMoveReason?.caseNoteId))
                .then((caseNote: any) => caseNote.text)
            } catch (err) {
                if (err?.response?.status === 404) return null
                throw err
            }
        }

        const mapReasonToCellMoveReasonDescription = ({ cellMoveReasonTypes, assignmentReason }: any) =>
        cellMoveReasonTypes.find((type: any) => type.code === assignmentReason)?.description

// // export default ({ prisonApi, whereaboutsApi, caseNotesApi }: any) =>
// //   async (req: any, res: any) => {
    const offenderNo = prisonerData.prisonerNumber
    const { agencyId, locationId, fromDate, toDate = moment().format('YYYY-MM-DD') } = req.query

    try {
      const [prisonerDetails, locationAttributes, locationHistory, agencyDetails, userCaseLoads] = await Promise.all([
        this.prisonApiClient.getDetails(offenderNo, false),
        this.prisonApiClient.getAttributesForLocation(locationId.toString()),
        this.prisonApiClient.getHistoryForLocation( locationId.toString(), fromDate.toString(), toDate.toString() ),
        this.prisonApiClient.getAgencyDetails(agencyId.toString()),
        this.prisonApiClient.getUserCaseLoads(),
      ])

    //   console.log(prisonerDetails)
    //   console.log(locationAttributes)
    //   console.log(locationHistory)
    //   console.log(agencyDetails)
    //   console.log(userCaseLoads)

      const userCaseLoadIds = userCaseLoads.map((caseLoad: any) => caseLoad.caseLoadId)
      const { bookingId, firstName, lastName } = prisonerDetails
      const currentPrisonerDetails = locationHistory.find((record: any) => record.bookingId === bookingId) || {}
      const { movementMadeBy, assignmentReason, bedAssignmentHistorySequence } = currentPrisonerDetails

      const movementMadeByName = await fetchStaffName(movementMadeBy, this.prisonApiClient)

      
      const whatHappenedDetails = await fetchWhatHappened(
        offenderNo,
        bookingId,
        bedAssignmentHistorySequence,
        this.caseNotesApiClient,
        this.whereaboutsApiClient
      )

      const isDpsCellMove = Boolean(whatHappenedDetails)

      const assignmentReasonName =
        isDpsCellMove &&
        mapReasonToCellMoveReasonDescription({
          cellMoveReasonTypes: await this.prisonApiClient.getCellMoveReasonTypes(),
          assignmentReason,
        })

      const locationHistoryWithPrisoner =
        hasLength(locationHistory) &&
        (await Promise.all(
          locationHistory.map(async (record: any) => ({
            ...record,
            ...(await this.prisonApiClient.getPrisonerDetail(record.bookingId)),
          }))
        ))

      const prisonerName = formatName(firstName, "", lastName )
      const getMovedOutText = (sharingOffenderEndTime: any) => {
        if (!currentPrisonerDetails.assignmentEndDateTime && !sharingOffenderEndTime) return 'Currently sharing'
        if (currentPrisonerDetails.assignmentEndDateTime && !sharingOffenderEndTime) return `${prisonerName} moved out`
        if (sharingOffenderEndTime) return formatTimestampToDateTime(sharingOffenderEndTime)
        return null
      }

      console.log(getMovedOutText)

      return res.render('pages/prisonerLocationHistory.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        locationDetails: {
          description: agencyDetails.description,
          movedIn:
            currentPrisonerDetails.assignmentDateTime &&
            formatTimestampToDateTime(currentPrisonerDetails.assignmentDateTime),
          movedOut: currentPrisonerDetails.assignmentEndDateTime
            ? formatTimestampToDateTime(currentPrisonerDetails.assignmentEndDateTime)
            : 'Current cell',
          movedBy: movementMadeByName,
          reasonForMove: assignmentReasonName || notEnteredMessage,
          whatHappened: whatHappenedDetails || notEnteredMessage,
          attributes: locationAttributes.attributes,
        },
        locationSharingHistory:
          hasLength(locationHistoryWithPrisoner) &&
          locationHistoryWithPrisoner
            .filter((prisoner) => prisoner.bookingId !== bookingId)
            .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))
            .map((prisoner) => ({
              shouldLink: hasLength(userCaseLoadIds) && userCaseLoadIds.includes(prisoner.agencyId),
              name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
              number: prisoner.offenderNo,
              movedIn: prisoner.assignmentDateTime && formatTimestampToDateTime(prisoner.assignmentDateTime),
              movedOut: getMovedOutText(prisoner.assignmentEndDateTime),
            })),
        profileUrl: `/prisoner/${offenderNo}`,
        prisonerName,
        locationName: extractLocation(locationAttributes.description, agencyId.toString()),
        prisonerNumber: offenderNo
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
}
