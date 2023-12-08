import { NextFunction, Request, Response } from 'express'
import { formatName } from '../utils/utils'
import CsraService from '../services/csraService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import csraAssessmentsToSummaryListMapper from '../mappers/csraAssessmentsToSummaryListMapper'
import getFilterValuesFromAssessments from '../utils/getFilterValuesFromAssessments'
import validateDateRange from '../utils/validateDateRange'
import { AuditService, Page } from '../services/auditService'

export default class CsraController {
  constructor(
    private readonly csraService: CsraService,
    private readonly auditService: AuditService,
  ) {}

  public async displayHistory(req: Request, res: Response, next: NextFunction) {
    const { firstName, lastName, middleNames, prisonerNumber, prisonId } = req.middleware.prisonerData
    const { clientToken } = res.locals
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    const filterErrors = validateDateRange(req.query.from as string, req.query.to as string)

    const allCsraAssessments = await this.csraService.getCsraHistory(clientToken, prisonerNumber)
    const agencies = await this.csraService.getAgenciesForCsraAssessments(clientToken, allCsraAssessments)
    const allCsraSummaries = csraAssessmentsToSummaryListMapper(allCsraAssessments, agencies)
    const filterValues = getFilterValuesFromAssessments(allCsraSummaries, req.query)

    if (filterErrors.length)
      return res.render('pages/csra/prisonerCsraHistoryPage', {
        name,
        prisonerNumber,
        csraAssessments: [],
        filterValues,
        errors: filterErrors,
      })

    const filteredSummaries = this.csraService.filterCsraAssessments(allCsraSummaries, req.query)

    await this.auditService.sendPageView({
      userId: res.locals.user.username,
      userCaseLoads: res.locals.user.caseLoads,
      userRoles: res.locals.user.userRoles,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.CsraHistory,
    })

    return res.render('pages/csra/prisonerCsraHistoryPage', {
      pageTitle: 'CSRA history',
      name,
      prisonerNumber,
      csraAssessments: filteredSummaries,
      filterValues,
    })
  }

  public async displayReview(req: Request, res: Response, next: NextFunction) {
    const { prisonerData } = req.middleware
    const { assessmentSeq, bookingId } = req.query
    const { clientToken } = res.locals

    const { csraAssessment, agencyDetails, staffDetails } = await this.csraService.getCsraAssessment(
      clientToken,
      +bookingId,
      +assessmentSeq,
    )

    await this.auditService.sendPageView({
      userId: res.locals.user.username,
      userCaseLoads: res.locals.user.caseLoads,
      userRoles: res.locals.user.userRoles,
      prisonerNumber: prisonerData.prisonerNumber,
      prisonId: prisonerData.prisonId,
      correlationId: req.id,
      page: Page.CsraReview,
    })

    return res.render('pages/csra/csraReviewPage', {
      pageTitle: 'CSRA details',
      csraAssessment,
      agencyDetails,
      staffDetails,
      prisoner: prisonerData,
    })
  }
}
