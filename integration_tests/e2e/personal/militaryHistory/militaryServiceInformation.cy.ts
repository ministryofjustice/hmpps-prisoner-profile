import {
  MilitaryBranchRefDataMock,
  MilitaryRankRefDataMock,
  MilitaryRecordsMock,
} from '../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import Page from '../../../pages/page'
import MilitaryServiceInformationPage from '../../../pages/militaryServiceInformationPage'

const visitCreateMilitaryServiceInformationPage = (): MilitaryServiceInformationPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/military-service-information' })
  return Page.verifyOnPageWithTitle(MilitaryServiceInformationPage, `John Saunders’ UK military service information`)
}
const visitUpdateMilitaryServiceInformationPage = (): MilitaryServiceInformationPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/military-service-information/1' })
  return Page.verifyOnPageWithTitle(MilitaryServiceInformationPage, `John Saunders’ UK military service information`)
}

context('Military Service Information Page', () => {
  let militaryServiceInformationPage: MilitaryServiceInformationPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.task('stubInmateDetail', { bookingId: 1102484 })
    cy.task('stubPrisonerDetail', 'G6123VU')
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'MLTY_BRANCH',
      referenceData: MilitaryBranchRefDataMock,
    })
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'MLTY_RANK',
      referenceData: MilitaryRankRefDataMock,
    })
    cy.task('stubPersonIntegrationGetMilitaryRecords', MilitaryRecordsMock)
    cy.task('stubPersonIntegrationUpdateMilitaryRecord')
    cy.task('stubPersonIntegrationCreateMilitaryRecord')
  })

  context('Creating a military service information', () => {
    beforeEach(() => {
      militaryServiceInformationPage = visitCreateMilitaryServiceInformationPage()
    })

    it('should show blank field values', () => {
      militaryServiceInformationPage.serviceNumberField().should('have.value', '')
      militaryServiceInformationPage.unitNumberField().should('have.value', '')
      militaryServiceInformationPage.enlistmentLocationField().should('have.value', '')
      militaryServiceInformationPage.descriptionField().should('have.value', '')
      militaryServiceInformationPage.startDateMonthField().should('have.value', '')
      militaryServiceInformationPage.startDateYearField().should('have.value', '')
    })

    it('should save successfully when valid data is entered', () => {
      militaryServiceInformationPage.serviceNumberField().type('123456', { delay: 0 })
      militaryServiceInformationPage.militaryBranchRadio().click()
      militaryServiceInformationPage.unitNumberField().type('Unit 1', { delay: 0 })
      militaryServiceInformationPage.enlistmentLocationField().type('Location 1', { delay: 0 })
      militaryServiceInformationPage.descriptionField().type('This is a test', { delay: 0 })
      militaryServiceInformationPage.startDateMonthField().type('10', { delay: 0 })
      militaryServiceInformationPage.startDateYearField().type('2021', { delay: 0 })
      militaryServiceInformationPage.saveAndReturnButton().click()
      cy.url().should('include', '/prisoner/G6123VU/personal#military-service-information')
    })

    it('should show validation messages when no data is entered', () => {
      militaryServiceInformationPage.saveAndReturnButton().click()
      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/military-service-information')
      militaryServiceInformationPage.errorSummary().should('exist')
      militaryServiceInformationPage.errorSummary().should('contain.text', 'Select a military branch')
      militaryServiceInformationPage
        .errorSummary()
        .should('contain.text', 'Enter the date they enlisted in the armed forces')
    })
  })

  context('Updating a military service information', () => {
    beforeEach(() => {
      militaryServiceInformationPage = visitUpdateMilitaryServiceInformationPage()
    })

    it('should show existing field values', () => {
      militaryServiceInformationPage.serviceNumberField().should('have.value', MilitaryRecordsMock[0].serviceNumber)
      militaryServiceInformationPage.unitNumberField().should('have.value', MilitaryRecordsMock[0].unitNumber)
      militaryServiceInformationPage
        .enlistmentLocationField()
        .should('have.value', MilitaryRecordsMock[0].enlistmentLocation)
      militaryServiceInformationPage.descriptionField().should('have.value', MilitaryRecordsMock[0].description)
      militaryServiceInformationPage.startDateMonthField().should('have.value', '01')
      militaryServiceInformationPage.startDateYearField().should('have.value', '2020')
    })

    it('should save successfully and redirect to personal page on "Save and return to profile"', () => {
      militaryServiceInformationPage.serviceNumberField().clear().type('654321', { delay: 0 })
      militaryServiceInformationPage.unitNumberField().clear().type('Unit 2', { delay: 0 })
      militaryServiceInformationPage.enlistmentLocationField().clear().type('Location 2', { delay: 0 })
      militaryServiceInformationPage.descriptionField().type('More info', { delay: 0 })
      militaryServiceInformationPage.saveAndReturnButton().click()
      cy.url().should('include', '/prisoner/G6123VU/personal#military-service-information')
    })

    it('should save successfully and redirect to conflicts page on "Save and continue to conflicts"', () => {
      militaryServiceInformationPage.serviceNumberField().clear().type('654321', { delay: 0 })
      militaryServiceInformationPage.unitNumberField().clear().type('Unit 2', { delay: 0 })
      militaryServiceInformationPage.enlistmentLocationField().clear().type('Location 2', { delay: 0 })
      militaryServiceInformationPage.descriptionField().type('More info', { delay: 0 })
      militaryServiceInformationPage.saveAndContinueButton().click()
      cy.url().should('include', '/prisoner/G6123VU/personal/conflicts/1')
    })

    it('should navigate back to personal page on cancel', () => {
      cy.get('a[data-qa="cancel-button"]').click()
      cy.url().should('include', `/prisoner/G6123VU/personal#military-service-information`)
    })

    it('should show validation message when enlistment date is cleared', () => {
      militaryServiceInformationPage.startDateMonthField().clear()
      militaryServiceInformationPage.startDateYearField().clear()
      militaryServiceInformationPage.saveAndReturnButton().click()
      cy.url().should('include', '/prisoner/G6123VU/personal/military-service-information/1')
      militaryServiceInformationPage.errorSummary().should('exist')
      militaryServiceInformationPage
        .errorSummary()
        .should('contain.text', 'Enter the date they enlisted in the armed forces')
    })
  })
})
