import type { Request, Response } from 'express'
import logger from '../../logger'
import { apostrophe } from '../utils/utils'
import { AuditService, Page } from '../services/auditService'
import type { BeliefHistoryItem } from '../services/interfaces/beliefService/BeliefHistoryItem'
import type BeliefService from '../services/beliefService'
import { religionFieldData } from './personal/fieldData'

export default class BeliefHistoryController {
  constructor(
    readonly beliefService: BeliefService,
    private readonly auditService: AuditService,
  ) {}

  public async displayBeliefHistory(req: Request, res: Response) {
    const { prisonerNumber, prisonId } = req.middleware.prisonerData
    const { clientToken } = req.middleware

    const beliefs = (await this.beliefService.getBeliefHistory(clientToken, prisonerNumber)).map<BeliefHistoryItem>(
      belief => {
        const override = religionFieldData.referenceDataOverrides.find(o => o.id === belief.religionCode)
        return {
          ...belief,
          religionDescription: override?.description ?? belief.religionDescription,
        }
      },
    )

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.ReligionBeliefHistory,
      })
      .catch(error => logger.error(error))

    return res.render('pages/beliefHistory', {
      pageTitle: 'Religion, faith or belief history',
      pageHeading: `${apostrophe(res.locals.prisonerName?.firstLast)} religion, faith or belief history`,
      beliefs,
    })
  }
}
