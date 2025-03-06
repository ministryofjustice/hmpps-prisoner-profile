import Page, { PageElement } from '../../page'

export default class ChangePhoto extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  changeLink = (): PageElement => cy.get('[data-qa="change-photo-link"]')

  fileUploadButton = (): PageElement => cy.get('.mark-upload-control input')

  photoField = (): PageElement => cy.get('input[type=file]')

  saveBtn = (): PageElement => cy.get('button[type=submit]')
}
