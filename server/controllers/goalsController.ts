import { Request, Response } from 'express'
import { formatName } from '../utils/utils'
import WorkAndSkillsPageService from '../services/workAndSkillsPageService'

export default class GoalsController {
  constructor(private readonly workAndSkillsPageService: WorkAndSkillsPageService) {}

  public async displayGoals(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber } = req.middleware.prisonerData
    const prisonerData = req.middleware?.prisonerData

    const workAndSkillsPageData = await this.workAndSkillsPageService.get(res.locals.clientToken, prisonerData)

    return res.render('pages/goals/goalsPage', {
      prisonerNumber,
      prisonerName: formatName(firstName, '', lastName),
      ...workAndSkillsPageData,
    })
  }
}
