import { Request, Response } from 'express'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { PrisonerLocationHistoryService } from '../services/prisonerLocationHistoryService'

export default class PrisonerLocationHistoryController {
  constructor(private readonly prisonerLocationHistoryService: PrisonerLocationHistoryService) {}

  public async displayPrisonerLocationHistory(req: Request, res: Response, prisonerData: Prisoner) {
    const { clientToken } = req.middleware
    const { agencyId, locationId, fromDate, toDate } = req.query

    const pageData = await this.prisonerLocationHistoryService(
      clientToken,
      prisonerData,
      agencyId as string,
      locationId as string,
      fromDate as string,
      toDate as string,
      res.locals.user.caseLoads,
    )

    return res.render('pages/prisonerLocationHistory.njk', pageData)
  }
}
