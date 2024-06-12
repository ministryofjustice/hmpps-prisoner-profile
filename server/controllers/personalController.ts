import { NextFunction, Request, Response } from 'express'
import { PrisonUser } from '../interfaces/HmppsUser'
import config from '../config'
import { mapHeaderData } from '../mappers/headerMappers'
import { AuditService, Page } from '../services/auditService'
import PersonalPageService from '../services/personalPageService'

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly auditService: AuditService,
  ) {}

  getPersonalPage() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertFlags = req.middleware?.alertSummaryData.alertFlags
      const user = res.locals.user as PrisonUser
      const { activeCaseLoadId } = user

      const enablePrisonPerson =
        config.featureToggles.prisonPersonApiEnabled &&
        config.featureToggles.prisonPersonApiEnabledPrisons.includes(activeCaseLoadId)
      const personalPageData = await this.personalPageService.get(
        req.middleware.clientToken,
        prisonerData,
        enablePrisonPerson,
      )

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Personal,
      })

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, alertFlags, res.locals.user, 'personal'),
        ...personalPageData,
      })
    }
  }
}
