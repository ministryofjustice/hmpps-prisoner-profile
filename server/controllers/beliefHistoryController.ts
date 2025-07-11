import { Request, Response } from 'express'
import { apostrophe, formatName } from '../utils/utils'
import { AuditService, Page } from '../services/auditService'
import BeliefService from '../services/beliefService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import logger from '../../logger'
import { religionFieldData } from './personal/fieldData'

export default class BeliefHistoryController {
  constructor(
    private readonly beliefService: BeliefService,
    private readonly auditService: AuditService,
  ) {}

  public async displayBeliefHistory(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const { clientToken } = req.middleware

    const beliefs = (await this.beliefService.getBeliefHistory(clientToken, prisonerNumber)).map(belief => {
      const override = religionFieldData.referenceDataOverrides.find(o => o.id === belief.beliefCode)
      return {
        ...belief,
        beliefDescription: override?.description ?? belief.beliefDescription,
      }
    })

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
      pageHeading: `${apostrophe(formatName(firstName, '', lastName))} religion, faith or belief history`,
      beliefs,
      prisonerNumber,
      breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
    })
  }
}
