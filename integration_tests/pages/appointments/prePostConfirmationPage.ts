import Page, { type PageElement } from '../page'
import { SummaryList } from '../pageElements/summaryList'

export class PrePostConfirmationPage extends Page {
  constructor(action: 'add' | 'update' = 'add') {
    super(action === 'add' ? 'The video link has been booked' : 'The video link has been updated')
  }

  summaryListCommon = new SummaryList('[data-qa=appointment-details-list__common]')

  summaryListNotes = new SummaryList('[data-qa=appointment-details-list__notes]')

  summaryListPre = new SummaryList('[data-qa=appointment-details-list__pre]')

  summaryListPost = new SummaryList('[data-qa=appointment-details-list__post]')

  summaryListCourt = new SummaryList('[data-qa=appointment-details-list__court]')

  get movementSlipLink(): PageElement<HTMLAnchorElement> {
    return cy.get<HTMLAnchorElement>('a.govuk-link').contains('Print movement slip')
  }
}

export default { PrePostConfirmationPage }
