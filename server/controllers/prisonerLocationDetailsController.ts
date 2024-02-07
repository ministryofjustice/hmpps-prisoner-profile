import { Request, Response } from 'express'

import { mapHeaderNoBannerData } from '../mappers/headerMappers'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, hasLength, userHasRoles } from '../utils/utils'
import { formatDateTimeISO } from '../utils/dateHelpers'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import config from '../config'
import { AuditService, Page } from '../services/auditService'
import { LocationDetailsPageData } from '../interfaces/pages/locationDetailsPageData'
import PrisonerLocationDetailsPageService from '../services/prisonerLocationDetailsPageService'
import logger from '../../logger'

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
      const { clientToken } = res.locals
      const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

      const prisonApiClient = this.prisonApiClientBuilder(res.locals.clientToken)

      const locationDetailsLatestFirst = await this.prisonerLocationDetailsPageService.getLocationDetailsByLatestFirst(
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
        canViewMoveToReceptionButton &&
        (await this.prisonerLocationDetailsPageService.isReceptionFull(clientToken, prisonId))

      if (!currentLocation.assignmentEndDateTime) {
        currentLocation.assignmentEndDateTime = formatDateTimeISO(new Date())
      }
      const occupants =
        (currentLocation && (await prisonApiClient.getInmatesAtLocation(currentLocation.livingUnitId, {}))) || []

      const previousLocations = locationDetailsLatestFirst.slice(1)
      const prisonerProfileUrl = `/prisoner/${offenderNo}`

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

      // TODO CDPS-373: Move into PrisonerLocationDetailsService?
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
