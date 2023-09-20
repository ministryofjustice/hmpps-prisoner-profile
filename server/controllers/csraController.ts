import { NextFunction, Request, Response } from 'express'
import { formatName } from '../utils/utils'
import CsraService from '../services/csraService'
import { formatDate } from '../utils/dateHelpers'
import mapCsraReviewToSummaryList from '../mappers/csraReviewToSummaryListMapper'
import mapCsraQuestionsToSummaryList from '../mappers/csraQuestionsToSummaryListMapper'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import csraAssessmentsToSummaryListMapper from '../mappers/csraAssessmentsToSummaryListMapper'
import getFilterValuesFromAssessments from '../utils/getFilterValuesFromAssessments'
import validateDateRange from '../utils/validateDateRange'

export default class CsraController {
  constructor(private readonly csraService: CsraService) {}

  public async displayHistory(req: Request, res: Response, next: NextFunction) {
    const { firstName, lastName, middleNames, prisonerNumber } = req.middleware.prisonerData
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

    return res.render('pages/csra/prisonerCsraHistoryPage', {
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

    return res.render('pages/csra/csraReviewPage', {
      details: mapCsraReviewToSummaryList(csraAssessment, agencyDetails, staffDetails),
      reviewDate: formatDate(new Date(csraAssessment.assessmentDate).toISOString(), 'long'),
      reviewQuestions: mapCsraQuestionsToSummaryList(csraAssessment.questions),
      prisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName),
      prisonerNumber: prisonerData.prisonerNumber,
    })
  }
}
