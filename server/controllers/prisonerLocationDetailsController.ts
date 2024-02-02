import { Request, Response } from 'express'

import { mapHeaderNoBannerData } from '../mappers/headerMappers'
import { Prisoner } from '../interfaces/prisoner'
import { extractLocation, formatName, hasLength, isTemporaryLocation, userHasRoles } from '../utils/utils'
import { formatDateTime, formatDateTimeISO } from '../utils/dateHelpers'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import config from '../config'
import { AuditService, Page } from '../services/auditService'
import { LocationDetails, LocationDetailsPageData } from '../interfaces/pages/locationDetailsPageData'
import PrisonerLocationDetailsPageService from '../services/prisonerLocationDetailsPageService'

export default class PrisonerLocationDetailsController {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly prisonerLocationDetailsPageService: PrisonerLocationDetailsPageService,
    private readonly auditService: AuditService,
  ) {}

  public async displayPrisonerLocationDetails(req: Request, res: Response, prisonerData: Prisoner) {
    const offenderNo = prisonerData.prisonerNumber

    try {
      const { bookingId, firstName, middleNames, lastName, prisonId } = prisonerData
      const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

      const prisonApiClient = this.prisonApiClientBuilder(res.locals.clientToken)

      const [cells, receptions] = await Promise.all([
        prisonApiClient.getOffenderCellHistory(bookingId, { page: 0, size: 10000 }),
        prisonApiClient.getReceptionsWithCapacity(prisonId),
      ])

      const uniqueAgencyIds = [...new Set(cells.content.filter(cell => cell.agencyId).map(cell => cell.agencyId))]
      const prisons = await Promise.all(uniqueAgencyIds.map(agencyId => prisonApiClient.getAgencyDetails(agencyId)))

      const uniqueStaffIds = [...new Set(cells.content.map(cell => cell.movementMadeBy))]
      const staff = await Promise.all(uniqueStaffIds.map(staffId => prisonApiClient.getStaffDetails(staffId)))

      const cellData = cells.content.map<LocationDetails>(cell => {
        const staffDetails = staff.find(user => cell.movementMadeBy === user.username)
        const { agencyId } = cell
        const agency = prisons.find(prison => cell.agencyId === prison.agencyId)
        const agencyDescription = agency ? agency.description : null

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
          movedInBy: formatName(staffDetails.firstName, '', staffDetails.lastName),
        }
      })

      const locationDetailsLatestFirst = cellData.sort(
        (a, b) => new Date(b.assignmentDateTime).getTime() - new Date(a.assignmentDateTime).getTime(),
      )

      const currentLocation = locationDetailsLatestFirst[0]
      const canViewCellMoveButton = userHasRoles(['CELL_MOVE'], res.locals.user.userRoles)
      const canViewMoveToReceptionButton =
        config.featureToggles.moveToReceptionLinkEnabled &&
        canViewCellMoveButton &&
        currentLocation?.location !== 'Reception'
      const receptionIsFull = !receptions.length

      if (!currentLocation.assignmentEndDateTime) {
        currentLocation.assignmentEndDateTime = formatDateTimeISO(new Date())
      }
      const occupants =
        (currentLocation && (await prisonApiClient.getInmatesAtLocation(currentLocation.livingUnitId, {}))) || []

      const previousLocations = locationDetailsLatestFirst.slice(1)
      const prisonerProfileUrl = `/prisoner/${offenderNo}`

      await this.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.PrisonerCellHistory,
      })

      // TODO CDPS-373: Move into PrisonerLocationDetailsService
      const pageData: LocationDetailsPageData = {
        pageTitle: 'Location details',
        ...mapHeaderNoBannerData(prisonerData),
        name,
        locationDetailsGroupedByAgency: hasLength(previousLocations)
          ? this.prisonerLocationDetailsPageService.getLocationDetailsGroupedByPeriodAtAgency(previousLocations)
          : [],
        currentLocation,
        canViewCellMoveButton,
        canViewMoveToReceptionButton,
        occupants: occupants
          .filter(occupant => occupant.offenderNo !== offenderNo)
          .map(occupant => ({
            name: formatName(occupant.firstName, '', occupant.lastName, { style: NameFormatStyle.firstLast }),
            profileUrl: `/prisoner/${occupant.offenderNo}`,
          })),
        prisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
        profileUrl: `/prisoner/${offenderNo}`,
        breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }),
        changeCellLink: `${config.serviceUrls.digitalPrison}/prisoner/${offenderNo}/cell-move/search-for-cell?returnUrl=${prisonerProfileUrl}`,
        moveToReceptionLink: receptionIsFull
          ? `${config.serviceUrls.digitalPrison}/prisoner/${offenderNo}/reception-move/reception-full`
          : `${config.serviceUrls.digitalPrison}/prisoner/${offenderNo}/reception-move/consider-risks-reception`,
        prisonerNumber: offenderNo,
        dpsBaseUrl: `${config.serviceUrls.digitalPrison}/prisoner/${offenderNo}`,
      }

      // Render page
      return res.render('pages/prisonerLocationDetails', pageData)
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
}
