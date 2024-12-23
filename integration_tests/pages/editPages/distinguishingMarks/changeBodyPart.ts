import Page, { PageElement } from '../../page'

export default class ChangeBodyPart extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  explanationText = (): PageElement => cy.get('[data-qa=explanation-text]')

  image = (): PageElement => cy.get('img[usemap=#body-part-map]')

  bodyParts = (): PageElement => cy.get('map[name=body-part-map] area')

  selectionDescription = (): PageElement => cy.get('#distinguishing-mark-selection-text')

  formValue = (name: string): PageElement => cy.get(`input[name=${name}]`)

  continueBtn = (): PageElement => cy.get('button[type=submit]')

  validationErrorBox = (): PageElement => cy.get('.govuk-error-summary')
}
