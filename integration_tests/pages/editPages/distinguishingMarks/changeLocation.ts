import Page, { PageElement } from '../../page'

export default class ChangeLocation extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  form = (): PageElement => cy.get('form#mark-detail-form[enctype=multipart/form-data]')

  bodyPartRadios = (): PageElement => cy.get('input[type=radio]')

  imageFields = (): PageElement => cy.get('input[type=file]')

  descriptionFields = (): PageElement => cy.get('textarea')

  saveBtn = (): PageElement => cy.get('button[type=submit]')
}
