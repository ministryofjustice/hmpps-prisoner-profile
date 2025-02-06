import Page, { PageElement } from './page'

export default class ConflictsPage extends Page {
  constructor() {
    super('What was the most recent conflict John Saunders served in?')
  }

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  warZoneRadioOptions = (): PageElement => cy.get(`input[name=warZoneCode]`)

  warZoneRadio = (): PageElement => cy.get(`input[name=warZoneCode][value=AFG]`)

  saveAndReturnButton = (): PageElement => cy.getDataQa('save-and-return-submit-button')

  cancelButton = (): PageElement => cy.getDataQa('cancel-button')
}
