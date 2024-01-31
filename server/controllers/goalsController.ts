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

    const workAndSkillsPageData = await this.workAndSkillsPageService.get(res.locals.clientToken, prisonerData)

    await this.auditService.sendPageView({
      userId: res.locals.user.username,
      userCaseLoads: res.locals.user.caseLoads,
      userRoles: res.locals.user.userRoles,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.Goals,
    })

    return res.render('pages/goals/goalsPage', {
      prisonerNumber,
      prisonerName: formatName(firstName, '', lastName),
      ...workAndSkillsPageData,
    })
  }
}
