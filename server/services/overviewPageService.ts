import { Response } from 'express-serve-static-core'
import { PageService } from '.'
import { statuses, nonAssociationRows, personalDetails, staffContacts, schedule } from '../data/overviewPage'
import { miniSummaryParamGroupA, miniSummaryParamGroupB } from '../data/miniSummary/miniSummary'

export default function OverviewPageService(
  prisonerNumber: string,
  _res: Response<object, Record<string, object>, number>,
) {
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
