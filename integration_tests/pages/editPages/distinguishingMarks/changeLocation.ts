import Page, { PageElement } from '../../page'

export default class ChangeLocation extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  get h1(): PageElement<HTMLHeadingElement> {
    return cy.get('h1')
  }

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  get form(): PageElement<HTMLFormElement> {
    return cy.get('form#mark-detail-form[enctype="multipart/form-data"]')
  }

  get bodyPartRadios(): PageElement<HTMLInputElement> {
    return cy.get('input[type=radio]')
  }

  get imageFields(): PageElement<HTMLInputElement> {
    return cy.get('input[type=file]')
  }

  get descriptionFields(): PageElement<HTMLTextAreaElement> {
    return cy.get('textarea')
  }

  get saveBtn(): PageElement<HTMLButtonElement> {
    return cy.get('button[type=submit]')
  }
}
