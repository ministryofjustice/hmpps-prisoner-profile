import { Request, Response } from 'express'
import { Prisoner } from '../interfaces/prisoner'
import { PrisonerLocationHistoryService } from '../services/prisonerLocationHistoryService'

export default class PrisonerLocationHistoryController {
  constructor(private readonly prisonerLocationHistoryService: PrisonerLocationHistoryService) {}

  public async displayPrisonerLocationHistory(req: Request, res: Response, prisonerData: Prisoner) {
    const { clientToken } = res.locals
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
