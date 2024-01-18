import Page, { PageElement } from './page'

export default class BeliefHistoryPage extends Page {
  beliefHistoryList = (): PageElement => cy.get('.belief-history-list')

  activeBeliefCard = () => ({
    card: (): PageElement => cy.get('.belief-card').eq(0),
    description: (): PageElement => this.activeBeliefCard().card().find('h2'),
    activeTag: (): PageElement => this.activeBeliefCard().card().find('.govuk-tag'),
    comments: (): PageElement => this.activeBeliefCard().card().find('.belief-card__comments'),
    startDate: (): PageElement => this.activeBeliefCard().card().find('[data-qa=belief-start-date]'),
    endDate: (): PageElement => this.activeBeliefCard().card().find('[data-qa=belief-end-date]'),
    addedBy: (): PageElement => this.activeBeliefCard().card().find('[data-qa=belief-added-by]'),
    updatedBy: (): PageElement => this.activeBeliefCard().card().find('[data-qa=belief-updated-by]'),
  })

  previousBeliefCard = () => ({
    card: (): PageElement => cy.get('.belief-card').eq(1),
    description: (): PageElement => this.previousBeliefCard().card().find('h2'),
    activeTag: (): PageElement => this.previousBeliefCard().card().find('.govuk-tag'),
    comments: (): PageElement => this.previousBeliefCard().card().find('.belief-card__comments'),
    startDate: (): PageElement => this.previousBeliefCard().card().find('[data-qa=belief-start-date]'),
    endDate: (): PageElement => this.previousBeliefCard().card().find('[data-qa=belief-end-date]'),
    addedBy: (): PageElement => this.previousBeliefCard().card().find('[data-qa=belief-added-by]'),
    updatedBy: (): PageElement => this.previousBeliefCard().card().find('[data-qa=belief-updated-by]'),
  })
}
