import { Request, Response } from 'express'
import { mapHeaderNoBannerData } from '../mappers/headerMappers'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, userHasRoles } from '../utils/utils'
import { formatDateTimeISO } from '../utils/dateHelpers'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import config from '../config'
import { AuditService, Page } from '../services/auditService'
import { LocationDetailsPageData } from '../interfaces/pages/locationDetailsPageData'
import PrisonerLocationDetailsService from '../services/prisonerLocationDetailsService'
import { OffenderBooking } from '../interfaces/prisonApi/offenderBooking'
import logger from '../../logger'

export default class PrisonerLocationDetailsController {
  constructor(
    private readonly locationDetailsService: PrisonerLocationDetailsService,
    private readonly auditService: AuditService,
  ) {}

  public async displayPrisonerLocationDetails(req: Request, res: Response, prisonerData: Prisoner) {
    const { prisonerNumber, bookingId, firstName, middleNames, lastName, prisonId } = prisonerData
    const { clientToken } = res.locals
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    const locationDetailsLatestFirst = await this.locationDetailsService.getLocationDetailsByLatestFirst(
      clientToken,
      bookingId,
    )

    const currentLocation = locationDetailsLatestFirst[0]
    const canViewCellMoveButton = userHasRoles(['CELL_MOVE'], res.locals.user.userRoles)
    const canViewMoveToReceptionButton =
      config.featureToggles.moveToReceptionLinkEnabled &&
      canViewCellMoveButton &&
      currentLocation?.location !== 'Reception'
    const receptionIsFull =
      canViewMoveToReceptionButton && (await this.locationDetailsService.isReceptionFull(clientToken, prisonId))

    if (!currentLocation.assignmentEndDateTime) {
      currentLocation.assignmentEndDateTime = formatDateTimeISO(new Date())
    }

    const occupants: OffenderBooking[] = currentLocation
      ? await this.locationDetailsService.getInmatesAtLocation(clientToken, currentLocation.livingUnitId)
      : []

    const previousLocations = locationDetailsLatestFirst.slice(1)
    const prisonerProfileUrl = `/prisoner/${prisonerNumber}`

    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.PrisonerCellHistory,
      })
      .catch(error => logger.error(error))

    const pageData: LocationDetailsPageData = {
      pageTitle: 'Location details',
      ...mapHeaderNoBannerData(prisonerData),
      name,
      locationDetailsGroupedByAgency:
        this.locationDetailsService.getLocationDetailsGroupedByPeriodAtAgency(previousLocations),
      currentLocation,
      canViewCellMoveButton,
      canViewMoveToReceptionButton,
      occupants: occupants
        .filter(occupant => occupant.offenderNo !== prisonerNumber)
        .map(occupant => ({
          name: formatName(occupant.firstName, '', occupant.lastName, { style: NameFormatStyle.firstLast }),
          profileUrl: `/prisoner/${occupant.offenderNo}`,
        })),
      prisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
      profileUrl: `/prisoner/${prisonerNumber}`,
      breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }),
      changeCellLink: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/cell-move/search-for-cell?returnUrl=${prisonerProfileUrl}`,
      moveToReceptionLink: receptionIsFull
        ? `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/reception-move/reception-full`
        : `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/reception-move/consider-risks-reception`,
      prisonerNumber,
      dpsBaseUrl: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}`,
    }

    // Render page
    return res.render('pages/prisonerLocationDetails', pageData)
  }
}
