import Page, { PageElement } from '../../page'

export default class ViewAllImagesForDistinguishingMark extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  summary = (): PageElement => cy.get('.mark-images__summary')

  images = (): PageElement => cy.get('.mark-images__image-display-container > img')

  prisonerProfileLink = (): PageElement => cy.get('a[data-qa="mark-images-back-link"]')

  printLink = (): PageElement => cy.get('a[data-qa="mark-images-print-link"]')
}
