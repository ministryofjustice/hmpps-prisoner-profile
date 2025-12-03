import Page from '../page'
import { SummaryList } from '../pageElements/summaryList'

export class ConfirmationPage extends Page {
  constructor(fullName: string) {
    super(`${fullName} appointment has been added`)
  }

  summaryListCommon = new SummaryList('[data-qa=appointment-details-list__common]')

  summaryListRecurring = new SummaryList('[data-qa=appointment-details-list__recurring]')

  summaryListProbation = new SummaryList('[data-qa=appointment-details-list__probation]')

  summaryListComments = new SummaryList('[data-qa=appointment-details-list__comments]')
}

export default { ConfirmationPage }
