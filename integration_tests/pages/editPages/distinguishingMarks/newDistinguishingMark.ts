import Page, { PageElement } from '../../page'

export default class NewDistinguishingMark extends Page {
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

  get explanationText(): PageElement<HTMLParagraphElement> {
    return cy.get('[data-qa="explanation-text"]')
  }

  get bodyParts(): PageElement<SVGAElement> {
    return cy.get('#select-body-part .dps-body-part')
  }

  findBodyPart(label: string): PageElement<SVGAElement> {
    return this.bodyParts.filter(`[aria-label="${label}"]`)
  }

  get selectionDescription(): PageElement<HTMLParagraphElement> {
    return cy.get('#select-body-part__message')
  }

  formValue(name: string): PageElement<HTMLInputElement> {
    return cy.get(`input[name=${name}]`)
  }

  get continueBtn(): PageElement<HTMLButtonElement> {
    return cy.get('button[type=submit][value=continue]')
  }

  get saveAndReturnBtn(): PageElement<HTMLButtonElement> {
    return cy.get('button[type=submit][value=returnToProfile]')
  }

  get validationErrorBox(): PageElement<HTMLDivElement> {
    return cy.get('.govuk-error-summary')
  }
}
