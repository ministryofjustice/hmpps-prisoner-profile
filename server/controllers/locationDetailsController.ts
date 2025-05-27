import { Request, Response } from 'express'
import { isGranted, PrisonerBaseLocationPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { mapHeaderNoBannerData } from '../mappers/headerMappers'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import config from '../config'
import { AuditService, Page } from '../services/auditService'
import LocationDetailsPageData from '../services/interfaces/locationDetailsService/LocationDetailsPageData'
import LocationDetailsService from '../services/locationDetailsService'
import OffenderBooking from '../data/interfaces/prisonApi/OffenderBooking'
import logger from '../../logger'
import LocationDetailsConverter from './converters/locationDetailsConverter'

export default class LocationDetailsController {
  constructor(
    private readonly locationDetailsService: LocationDetailsService,
    private readonly auditService: AuditService,
    private readonly locationDetailsConverter: LocationDetailsConverter = new LocationDetailsConverter(
      () => new Date(),
    ),
  ) {}

  public async displayLocationDetails(req: Request, res: Response, prisonerData: Prisoner) {
    const { prisonerNumber, bookingId, firstName, middleNames, lastName, prisonId } = prisonerData
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })
    const profileUrl = `/prisoner/${prisonerNumber}`
    const { clientToken } = req.middleware
    const { prisonerPermissions } = res.locals

    const isTransfer = prisonId === 'TRN'
    const isReleased = prisonId === 'OUT'
    const isInactiveBooking = isTransfer || isReleased

    const locationDetailsLatestFirst = await this.locationDetailsService.getLocationDetailsByLatestFirst(
      clientToken,
      prisonerNumber,
      bookingId,
    )

    const currentLocation = !isInactiveBooking && locationDetailsLatestFirst[0]
    const previousLocations = isInactiveBooking ? locationDetailsLatestFirst : locationDetailsLatestFirst.slice(1)

    const canViewCellMoveButton = isGranted(PrisonerBaseLocationPermission.move_cell, prisonerPermissions)
    const canViewMoveToReceptionButton = canViewCellMoveButton && currentLocation?.location !== 'Reception'
    const receptionIsFull =
      canViewMoveToReceptionButton && (await this.locationDetailsService.isReceptionFull(clientToken, prisonId))
    const occupants: OffenderBooking[] = currentLocation
      ? await this.locationDetailsService.getInmatesAtLocation(clientToken, currentLocation.livingUnitId)
      : []

    this.auditService
      .sendPageView({
        user: res.locals.user,
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
        .map(this.locationDetailsConverter.convertGroupedLocationDetails),
      currentLocation: this.locationDetailsConverter.convertLocationDetails(currentLocation),
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
      changeCellLink: `${config.serviceUrls.changeSomeonesCell}/prisoner/${prisonerNumber}/cell-move/search-for-cell?returnToService=prisonerProfile`,
      moveToReceptionLink: receptionIsFull
        ? `${config.serviceUrls.changeSomeonesCell}/prisoner/${prisonerNumber}/reception-move/reception-full?returnToService=prisonerProfile`
        : `${config.serviceUrls.changeSomeonesCell}/prisoner/${prisonerNumber}/reception-move/consider-risks-reception?returnToService=prisonerProfile`,
      prisonerNumber,
      isTransfer,
      isReleased,
    }

    // Render page
    return res.render('pages/locationDetails', pageData)
  }
}
