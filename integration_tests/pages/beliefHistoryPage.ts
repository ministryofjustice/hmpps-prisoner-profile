import Page from './page'

export default class BeliefHistoryPage extends Page {
  get beliefHistoryList() {
    return cy.get('.belief-history-list').children()
  }

  getBeliefCard(index: number) {
    const getCard = () => cy.get('.belief-card').eq(index)
    return {
      get description() {
        return getCard().find('h2')
      },
      get activeTag() {
        return getCard().find('.govuk-tag')
      },
      get comments() {
        return getCard().find('.belief-card__comments')
      },
      get startDate() {
        return getCard().find('[data-qa=belief-start-date]')
      },
      get endDate() {
        return getCard().find('[data-qa=belief-end-date]')
      },
      get created() {
        return getCard().find('[data-qa=belief-added-by]')
      },
      get modified() {
        return getCard().find('[data-qa=belief-updated-by]')
      },
    }
  }
}
