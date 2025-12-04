import Page, { type PageElement } from '../page'
import { SummaryList } from '../pageElements/summaryList'

export class ConfirmationPage extends Page {
  constructor(fullName: string) {
    super(`${fullName} appointment has been added`)
  }

  summaryListCommon = new SummaryList('[data-qa=appointment-details-list__common]')

  summaryListRecurring = new SummaryList('[data-qa=appointment-details-list__recurring]')

  summaryListProbation = new SummaryList('[data-qa=appointment-details-list__probation]')

  summaryListComments = new SummaryList('[data-qa=appointment-details-list__comments]')

  get movementSlipLink(): PageElement<HTMLAnchorElement> {
    return cy.get<HTMLAnchorElement>('a.govuk-link').contains('Print movement slip')
  }

  get addMoreLink(): PageElement<HTMLAnchorElement> {
    return cy.get<HTMLAnchorElement>('a.govuk-button').contains('Add more appointments')
  }
}

export default { ConfirmationPage }
