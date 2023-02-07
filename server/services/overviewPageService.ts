import { Response } from 'express'
import { PageService } from '.'
import { statuses, personalDetails, staffContacts, schedule } from '../data/overviewPage'
import { miniSummaryParamGroupA, miniSummaryParamGroupB } from '../data/miniSummary/miniSummary'
import { OverviewPage } from '../interfaces/overviewPage'
import PrisonApiClient from '../data/prisonApiClient'

export default async function OverviewPageService(prisonerNumber: string, _res: Response) {
  const pageService = new PageService()
  const prisonApiClient = new PrisonApiClient(_res.locals.user.token)
  const nonAssociations = await prisonApiClient.getNonAssociationDetails(prisonerNumber)
  const nonAssociationRows = nonAssociations.nonAssociations.map(nonAssocation => {
    const row = []
    const { offenderNonAssociation } = nonAssocation
    const nonAssociationName = `${offenderNonAssociation.firstName} ${offenderNonAssociation.lastName}`
    row.push({ text: nonAssociationName })
    row.push({ text: offenderNonAssociation.offenderNo })
    row.push({ text: offenderNonAssociation.assignedLivingUnitDescription })
    row.push({ text: offenderNonAssociation.reasonDescription })
    return row
  })

  pageService.renderPage<OverviewPage>(_res, prisonerNumber, 'pages/index', {
    miniSummaryParamGroupA,
    miniSummaryParamGroupB,
    statuses,
    nonAssociationRows,
    personalDetails,
    staffContacts,
    schedule,
  })
}
