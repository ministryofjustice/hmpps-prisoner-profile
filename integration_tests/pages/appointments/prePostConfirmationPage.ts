import Page, { type PageElement } from '../page'
import { SummaryList } from '../pageElements/summaryList'

export class PrePostConfirmationPage extends Page {
  constructor() {
    super('The video link has been booked')
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
