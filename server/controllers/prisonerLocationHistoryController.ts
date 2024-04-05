import { Request, Response } from 'express'
import { format } from 'date-fns'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import PrisonerLocationHistoryService from '../services/prisonerLocationHistoryService'
import { extractLocation, formatName, hasLength, sortByDateTime } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import HistoryForLocationItem from '../data/interfaces/prisonApi/HistoryForLocationItem'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import CellMoveReasonType from '../data/interfaces/prisonApi/CellMoveReasonTypes'

export default class PrisonerLocationHistoryController {
  constructor(private readonly prisonerLocationHistoryService: PrisonerLocationHistoryService) {}

  public async displayPrisonerLocationHistory(req: Request, res: Response, prisonerData: Prisoner) {
    const { clientToken } = res.locals
    const { agencyId, locationId, fromDate, toDate } = req.query
    const { firstName, lastName, prisonerNumber, bookingId } = prisonerData
    const userCaseLoadIds = res.locals.user.caseLoads.map((caseLoad: CaseLoad) => caseLoad.caseLoadId)

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

    const mapReasonToCellMoveReasonDescription = (
      cellMoveReasonTypes: CellMoveReasonType[],
      assignmentReason: string,
    ) => cellMoveReasonTypes.find((type: CellMoveReasonType) => type.code === assignmentReason)?.description

    const {
      agencyDetails,
      locationAttributes,
      locationHistoryWithPrisoner,
      movementMadeByName,
      whatHappenedDetails,
      cellMoveReasonTypes,
      currentPrisonerDetails,
    } = await this.prisonerLocationHistoryService.getPrisonerLocationHistory(
      clientToken,
      prisonerData,
      agencyId as string,
      locationId as string,
      fromDate as string,
      toDate as string,
    )

    const prisonerName = formatName(firstName, '', lastName)

    return res.render('pages/prisonerLocationHistory.njk', {
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
        reasonForMove:
          (Boolean(whatHappenedDetails) &&
            mapReasonToCellMoveReasonDescription(cellMoveReasonTypes, currentPrisonerDetails.assignmentReason)) ||
          'Not entered',
        whatHappened: whatHappenedDetails || 'Not entered',
        attributes: locationAttributes.attributes,
      },

      locationSharingHistory: locationHistoryWithPrisoner
        .filter(prisoner => prisoner.bookingId.toString() !== bookingId.toString())
        .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))
        .map(prisoner => ({
          shouldLink: hasLength(userCaseLoadIds) && userCaseLoadIds.includes(prisoner.agencyId),
          name: formatName(prisoner.firstName, '', prisoner.lastName, { style: NameFormatStyle.lastCommaFirst }),
          number: prisoner.offenderNo,
          movedIn: prisoner.assignmentDateTime && format(new Date(prisoner.assignmentDateTime), 'dd/MM/yyyy - HH:mm'),
          movedOut: getMovedOutText(currentPrisonerDetails, prisonerName, prisoner.assignmentEndDateTime),
        })),
    })
  }
}
