import Page, { PageElement } from '../../page'

export default class ChangeDistinguishingMark extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  markDetails = () => {
    const summaryListValues = () => cy.get('.govuk-summary-list__value')
    return {
      bodyPart: () => summaryListValues().eq(0),
      location: () => summaryListValues().eq(1),
      description: () => summaryListValues().eq(2),
      photo: () => summaryListValues().eq(3),
    }
  }

  explanationText = (): PageElement => cy.get('[data-qa=explanation-text]')

  image = (): PageElement => cy.get('img[usemap=#body-part-map]')

  bodyParts = (): PageElement => cy.get('map[name=body-part-map] area')

  selectionDescription = (): PageElement => cy.get('#distinguishing-mark-selection-text')

  formValue = (name: string): PageElement => cy.get(`input[name=${name}]`)

  continueBtn = (): PageElement => cy.get('button[type=submit][value=continue]')

  saveAndReturnBtn = (): PageElement => cy.get('button[type=submit][value=returnToProfile]')

  validationErrorBox = (): PageElement => cy.get('.govuk-error-summary')
}
