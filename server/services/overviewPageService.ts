import { Response } from 'express'
import { PageService } from '.'
import { statuses, nonAssociationRows, personalDetails, staffContacts, schedule } from '../data/overviewPage'
import { miniSummaryParamGroupA, miniSummaryParamGroupB } from '../data/miniSummary/miniSummary'

export default function OverviewPageService(prisonerNumber: string, _res: Response) {
  const pageService = new PageService()
  pageService.renderPage(_res, prisonerNumber, 'pages/index', {
    miniSummaryParamGroupA,
    miniSummaryParamGroupB,
    statuses,
    nonAssociationRows,
    personalDetails,
    staffContacts,
    schedule,
  })
}
