import { Request, Response } from 'express'
import { formatName } from '../utils/utils'
import WorkAndSkillsPageService from '../services/workAndSkillsPageService'
import { AuditService, Page } from '../services/auditService'

export default class GoalsController {
  constructor(
    private readonly workAndSkillsPageService: WorkAndSkillsPageService,
    private readonly auditService: AuditService,
  ) {}

  public async displayGoals(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const prisonerData = req.middleware?.prisonerData

    const workAndSkillsPageData = await this.workAndSkillsPageService.get(
      req.middleware.clientToken,
      prisonerData,
      res.locals.apiErrorCallback,
    )

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.VirtualCampusGoals,
    })

    return res.render('pages/goals/vc2GoalsPage', {
      prisonerNumber,
      prisonerName: formatName(firstName, '', lastName),
      ...workAndSkillsPageData,
    })
  }
}
