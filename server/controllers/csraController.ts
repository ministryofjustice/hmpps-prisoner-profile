import { NextFunction, Request, Response } from 'express'
import { formatName } from '../utils/utils'
import CsraService from '../services/csraService'
import { formatDate } from '../utils/dateHelpers'
import mapCsraReviewToSummaryList from '../mappers/csraReviewToSummaryListMapper'
import mapCsraQuestionsToSummaryList from '../mappers/csraQuestionsToSummaryListMapper'

export default class CsraController {
  constructor(private readonly csraService: CsraService) {}

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
