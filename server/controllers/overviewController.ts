import { Response } from 'express'
import { HeaderData } from '../mappers/headerMappers'
import type OverviewPageService from '../services/overviewPageService'
import { Prisoner } from '../interfaces/prisoner'
import { HmppsAction } from '../interfaces/hmppsAction'
import { OverviewPage } from '../interfaces/overviewPage'

export interface OverviewViewModel extends HeaderData, OverviewPage {
  pageTitle: string
  overviewActions: HmppsAction[]
  overviewInfoLinks: { text: string; url: string; dataQA: string }[]
  canView: boolean
  canAdd: boolean
}
/**
 * Parse request for overview page and orchestrate response
 */
export default class OverviewController {
  constructor(private readonly overviewPageService: OverviewPageService) {}

  public async displayOverview(res: Response, prisonerData: Prisoner) {
    const { clientToken } = res.locals

    const overviewPageData = await this.overviewPageService.get(clientToken, prisonerData, res.locals.user)

    res.render('pages/overviewPage', overviewPageData)
  }
}
