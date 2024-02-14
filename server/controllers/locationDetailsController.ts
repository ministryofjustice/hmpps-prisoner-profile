import { Request, Response } from 'express'
import { mapHeaderNoBannerData } from '../mappers/headerMappers'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, userHasRoles } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import config from '../config'
import { AuditService, Page } from '../services/auditService'
import { LocationDetailsPageData } from '../interfaces/pages/locationDetailsPageData'
import LocationDetailsService from '../services/locationDetailsService'
import { OffenderBooking } from '../interfaces/prisonApi/offenderBooking'
import logger from '../../logger'
import { convertGroupedLocationDetails, convertLocationDetails } from './converters/locationDetailsConverter'

export default class LocationDetailsController {
  constructor(
    private readonly locationDetailsService: LocationDetailsService,
    private readonly auditService: AuditService,
  ) {}

  public async displayLocationDetails(req: Request, res: Response, prisonerData: Prisoner) {
    const { prisonerNumber, bookingId, firstName, middleNames, lastName, prisonId } = prisonerData
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })
    const profileUrl = `/prisoner/${prisonerNumber}`
    const { clientToken } = res.locals

    const isTransfer = prisonId === 'TRN'
    const isReleased = prisonId === 'OUT'
    const isInactiveBooking = isTransfer || isReleased

    const locationDetailsLatestFirst = await this.locationDetailsService.getLocationDetailsByLatestFirst(
      clientToken,
      bookingId,
    )

    const currentLocation = !isInactiveBooking && locationDetailsLatestFirst[0]
    const previousLocations = isInactiveBooking ? locationDetailsLatestFirst : locationDetailsLatestFirst.slice(1)

    const canViewCellMoveButton = userHasRoles(['CELL_MOVE'], res.locals.user.userRoles)
    const canViewMoveToReceptionButton =
      config.featureToggles.moveToReceptionLinkEnabled &&
      canViewCellMoveButton &&
      currentLocation?.location !== 'Reception'
    const receptionIsFull =
      canViewMoveToReceptionButton && (await this.locationDetailsService.isReceptionFull(clientToken, prisonId))
    const occupants: OffenderBooking[] = currentLocation
      ? await this.locationDetailsService.getInmatesAtLocation(clientToken, currentLocation.livingUnitId)
      : []

    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.PrisonerCellHistory,
      })
      .catch(error => logger.error(error))

    const pageData: LocationDetailsPageData = {
      pageTitle: 'Location details',
      ...mapHeaderNoBannerData(prisonerData),
      name,
      locationDetailsGroupedByAgency: this.locationDetailsService
        .getLocationDetailsGroupedByPeriodAtAgency(previousLocations)
        .map(convertGroupedLocationDetails),
      currentLocation: convertLocationDetails(currentLocation),
      canViewCellMoveButton,
      canViewMoveToReceptionButton,
      occupants: occupants
        .filter(occupant => occupant.offenderNo !== prisonerNumber)
        .map(occupant => ({
          name: formatName(occupant.firstName, '', occupant.lastName, { style: NameFormatStyle.firstLast }),
          profileUrl: `/prisoner/${occupant.offenderNo}`,
        })),
      prisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
      profileUrl,
      breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }),
      changeCellLink: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/cell-move/search-for-cell?returnUrl=${profileUrl}`,
      moveToReceptionLink: receptionIsFull
        ? `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/reception-move/reception-full`
        : `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/reception-move/consider-risks-reception`,
      prisonerNumber,
      dpsBaseUrl: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}`,
      isTransfer,
      isReleased,
    }

    // Render page
    return res.render('pages/locationDetails', pageData)
  }
}
