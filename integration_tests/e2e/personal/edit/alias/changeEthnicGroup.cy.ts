import Page from '../../../../pages/page'
import { Role } from '../../../../../server/data/enums/role'
import NotFoundPage from '../../../../pages/notFoundPage'
import ChangeEthnicGroupPage from '../../../../pages/editPages/alias/changeEthnicGroupPage'
import { PseudonymResponseMock } from '../../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { ethnicityCodesMock } from '../../../../../server/data/localMockData/personIntegrationApi/referenceDataMocks'

const visitChangeEthnicGroupPage = (): ChangeEthnicGroupPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/ethnic-group' })
  return Page.verifyOnPageWithTitle(ChangeEthnicGroupPage, `What is John Saunders’ ethnic group?`)
}

context('Change ethnic group', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  let page: ChangeEthnicGroupPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.DpsApplicationDeveloper] })
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'ETHNICITY',
      referenceData: ethnicityCodesMock,
    })
    cy.task('stubGetPseudonyms', { prisonerNumber, response: [PseudonymResponseMock] })
    cy.task('stubUpdatePseudonym', {
      pseudonymId: PseudonymResponseMock.sourceSystemId,
      response: PseudonymResponseMock,
    })
    cy.task('stubAllPersonalCareNeeds')
  })

  context('Permissions', () => {
    it('Shows edit link on the personal page if they have permissions', () => {
      cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/personal' })
      cy.get(`a[href="personal/ethnic-group"]`).should('exist')
    })

    it('Doesnt show an edit link on the personal page if they dont have the permissions', () => {
      cy.setupUserAuth({ roles: [Role.PrisonUser] })

      cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/personal' })
      cy.get(`a[href="personal/ethnic-group"]`).should('not.exist')
    })

    it('Doesnt let the user access if they dont have the permissions', () => {
      cy.setupUserAuth({ roles: [Role.PrisonUser] })

      cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/ethnic-group', failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('Can select an ethnic group', () => {
    beforeEach(() => {
      page = visitChangeEthnicGroupPage()
    })

    it('should display the mini banner with prisoner details', () => {
      page.miniBanner().card().should('exist')
      page.miniBanner().name().should('contain.text', 'Saunders, John')
    })
    ;['white', 'mixed', 'asian', 'black', 'other'].forEach(group => {
      it(`should redirect to background page: ${group}`, () => {
        cy.get(`input[name=radioField][value=${group}]`).click()
        page.continueButton().click()

        cy.location('pathname').should('eq', `/prisoner/G6123VU/personal/${group}`)
      })
    })
  })

  context('Allows no ethnic group to be selected', () => {
    it('redirects back to personal page if nothing selected', () => {
      // Prepopulates with existing ethnicity:
      cy.task('stubGetPseudonyms', { prisonerNumber, response: [{ ...PseudonymResponseMock, ethnicity: undefined }] })

      page = visitChangeEthnicGroupPage()
      page.continueButton().click()

      cy.location('pathname').should('eq', `/prisoner/G6123VU/personal`)
    })
  })
})
