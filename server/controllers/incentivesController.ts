import { NextFunction, Request, RequestHandler, Response } from 'express'
import { differenceInDays, isAfter, isBefore, isEqual, parseISO } from 'date-fns'
import { AuditService, SearchAction } from '../services/auditService'
import logger from '../../logger'
import { formatName, userHasRoles } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { Role } from '../data/enums/role'
import { IncentiveReviewDetail } from '../interfaces/IncentivesApi/incentiveReviews'
import IncentivesService from '../services/incentivesService'
import { formatDate, formatDateTime, isRealDate, parseDate } from '../utils/dateHelpers'
import { AgencyDetails } from '../interfaces/prisonApi/agencies'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'
import { HmppsError } from '../interfaces/hmppsError'

/**
 * Parse requests for incentives routes and orchestrate response
 */
export default class IncentivesController {
  constructor(
    private readonly incentiveService: IncentivesService,
    private readonly auditService: AuditService,
  ) {}

  public displayIncentiveLevel(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const {
        clientToken,
        user: { username, userRoles, caseLoads },
      } = res.locals
      const {
        prisonerData: { firstName, middleNames, lastName, prisonerNumber, prisonId, bookingId },
      } = req.middleware

      const prisonerName = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })
      const breadcrumbPrisonerName = formatName(firstName, middleNames, lastName, {
        style: NameFormatStyle.lastCommaFirst,
      })

      const canMaintainIEP = userHasRoles([Role.MaintainIEP], userRoles)

      const formValues = {
        agencyId: req.query.agencyId as string,
        incentiveLevel: req.query.incentiveLevel as string,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
      }

      const errors = this.validateFilters(formValues)

      const { incentiveReviewSummary, prisons, staff } = await this.incentiveService.getIncentiveReviewSummary(
        clientToken,
        bookingId,
        true,
      )

      const currentIncentiveLevel = incentiveReviewSummary?.iepLevel || 'Not entered'
      const nextReviewDueBy = incentiveReviewSummary?.nextReviewDate
        ? formatDate(incentiveReviewSummary.nextReviewDate)
        : 'Not entered'

      const levels = Array.from(new Set(incentiveReviewSummary?.iepDetails?.map(details => details.iepLevel)))
        .sort()
        .map(detail => ({ value: detail, text: detail }))

      const reviews = incentiveReviewSummary?.iepDetails?.length
        ? incentiveReviewSummary.iepDetails
            .filter(review => this.filterReviews(review, formValues))
            .map(review => this.mapReviewToTableRow(review, prisons, staff))
        : null

      const daysOverdue = differenceInDays(new Date(), parseISO(incentiveReviewSummary?.nextReviewDate))

      const noReviewsMessage = incentiveReviewSummary?.iepDetails?.length
        ? 'There is no incentive level history for the selections you have made'
        : `${formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })} has no incentive level history`

      this.auditService
        .sendSearch({
          userId: username,
          userCaseLoads: caseLoads,
          userRoles,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          searchPage: SearchAction.IncentiveLevels,
          details: { formValues },
        })
        .catch(error => logger.error(error))

      // Render page
      return res.render('pages/incentives/incentiveLevelDetails', {
        pageTitle: 'Incentive details',
        prisonerName,
        breadcrumbPrisonerName,
        prisonerNumber,
        canMaintainIEP,
        prisons,
        levels,
        formValues,
        currentIncentiveLevel,
        nextReviewDueBy,
        reviews,
        daysOverdue,
        noReviewsMessage,
        recordIncentiveLevelLink: `/prisoner/${prisonerNumber}/incentive-level-details/change-incentive-level`,
        errors,
      })
    }
  }

  private filterReviews(review: IncentiveReviewDetail, formValues: Record<string, string>) {
    return (
      (!formValues.agencyId || review.agencyId === formValues.agencyId) &&
      (!formValues.incentiveLevel || review.iepLevel === formValues.incentiveLevel) &&
      (!formValues.fromDate ||
        isEqual(parseISO(review.iepDate), parseDate(formValues.fromDate)) ||
        isAfter(parseISO(review.iepDate), parseDate(formValues.fromDate))) &&
      (!formValues.toDate ||
        isEqual(parseISO(review.iepDate), parseDate(formValues.toDate)) ||
        isBefore(parseISO(review.iepDate), parseDate(formValues.toDate)))
    )
  }

  private mapReviewToTableRow(review: IncentiveReviewDetail, prisons: AgencyDetails[], staff: StaffDetails[]) {
    const staffDetails = staff.filter(Boolean).find(s => s.username === review.userId)
    const prison = prisons.filter(Boolean).find(p => p.agencyId === review.agencyId)

    return [
      { text: formatDateTime(review.iepTime, 'short', ' - ') },
      { text: review.iepLevel },
      {
        text: review.comments ? review.comments : 'Not entered',
      },
      { text: prison?.description || 'Not entered' },
      { text: staffDetails ? formatName(staffDetails.firstName, '', staffDetails.lastName) : 'Not entered' },
    ]
  }

  private validateFilters(formValues: Record<string, string>): HmppsError[] {
    const errors: HmppsError[] = []

    let invalidDate = false

    if (formValues.fromDate && !isRealDate(formValues.fromDate)) {
      invalidDate = true
      errors.push({
        href: '#fromDate',
        text: 'Enter a real date in the format DD/MM/YYYY - for example, 21/01/2024',
      })
    }
    if (formValues.toDate && !isRealDate(formValues.toDate)) {
      invalidDate = true
      errors.push({
        href: '#toDate',
        text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2024',
      })
    }
    if (
      !invalidDate &&
      formValues.fromDate &&
      formValues.toDate &&
      isBefore(parseDate(formValues.toDate), parseDate(formValues.fromDate))
    ) {
      errors.push({
        href: '#toDate',
        text: `'Date to' must be after or the same as 'Date from'`,
      })
    }
    return errors
  }
}
