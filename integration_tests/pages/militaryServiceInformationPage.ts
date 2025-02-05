import Page, { PageElement } from './page'

export default class MilitaryServiceInformationPage extends Page {
  constructor() {
    super('John Saunders’ UK military service information')
  }

  serviceNumberField = (): PageElement => cy.get('#serviceNumber')

  militaryBranchRadio = (): PageElement => cy.get(`input[name=militaryBranchCode][value=ARM]`)

  unitNumberField = (): PageElement => cy.get('#unitNumber')

  enlistmentLocationField = (): PageElement => cy.get('#enlistmentLocation')

  descriptionField = (): PageElement => cy.get('#description')

  startDateMonthField = (): PageElement => cy.get('#startDate-month')

  startDateYearField = (): PageElement => cy.get('#startDate-year')

  saveAndReturnButton = (): PageElement => cy.getDataQa('save-and-return-submit-button')

  errorSummary = (): PageElement => cy.get('.govuk-error-summary')
}
