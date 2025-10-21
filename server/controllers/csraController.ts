import { Request, Response } from 'express'
import CsraService from '../services/csraService'
import csraAssessmentsToSummaryListMapper from '../mappers/csraAssessmentsToSummaryListMapper'
import getFilterValuesFromAssessments from '../utils/getFilterValuesFromAssessments'
import validateDateRange from '../utils/validateDateRange'
import { AuditService, Page } from '../services/auditService'
import logger from '../../logger'

export default class CsraController {
  constructor(
    readonly csraService: CsraService,
    private readonly auditService: AuditService,
  ) {}

  public async displayHistory(req: Request, res: Response) {
    const { prisonerNumber, prisonId } = res.locals
    const { clientToken } = req.middleware

    const filterErrors = validateDateRange(req.query.from as string, req.query.to as string)

    const allCsraAssessments = await this.csraService.getCsraHistory(clientToken, prisonerNumber)
    const agencies = await this.csraService.getAgenciesForCsraAssessments(clientToken, allCsraAssessments)
    const allCsraSummaries = csraAssessmentsToSummaryListMapper(allCsraAssessments, agencies)
    const filterValues = getFilterValuesFromAssessments(allCsraSummaries, req.query)

    if (filterErrors.length)
      return res.render('pages/csra/prisonerCsraHistoryPage', {
        csraAssessments: [],
        filterValues,
        errors: filterErrors,
      })

    const filteredSummaries = this.csraService.filterCsraAssessments(allCsraSummaries, req.query)
    const filteredAssessments = await this.csraService.getDetailsForAssessments(clientToken, filteredSummaries)

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.CsraHistory,
      })
      .catch(error => logger.error(error))

    return res.render('pages/csra/prisonerCsraHistoryPage', {
      pageTitle: 'CSRA history',
      csraAssessments: filteredAssessments,
      filterValues,
      errors: undefined,
    })
  }

  public async displayReview(req: Request, res: Response) {
    const { prisonerData } = req.middleware
    const { assessmentSeq, bookingId } = req.query
    const { clientToken } = req.middleware

    const { csraAssessment, agencyDetails, staffDetails } = await this.csraService.getCsraAssessment(
      clientToken,
      +bookingId,
      +assessmentSeq,
    )
    const { prisonerNumber, prisonId } = res.locals

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.CsraReview,
      })
      .catch(error => logger.error(error))

    return res.render('pages/csra/csraReviewPage', {
      pageTitle: 'CSRA details',
      csraAssessment,
      agencyDetails,
      staffDetails,
      prisoner: prisonerData,
    })
  }
}
