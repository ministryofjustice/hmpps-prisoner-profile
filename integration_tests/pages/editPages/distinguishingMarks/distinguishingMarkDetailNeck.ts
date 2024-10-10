import Page, { PageElement } from '../../page'

export default class DistinguishingMarkDetailNeck extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  form = (): PageElement => cy.get('form#mark-detail-form[enctype=multipart/form-data]')

  imageField = (): PageElement => cy.get('input[type=file][name=file-neck]')

  descriptionField = (): PageElement => cy.get('textarea[name=description-neck]')

  saveAndExitBtn = (): PageElement => cy.get('button[type=submit][value=returnToProfile][name=action]')

  saveAndAddMore = (): PageElement => cy.get('button[type=submit][value=addMore][name=action]')
}
