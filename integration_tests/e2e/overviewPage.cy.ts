import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubNonAssociations', 'jdhf')
    cy.task('stubNonAssociations', '123')
  })

  it('Overview page is displayed', () => {
    cy.task('stubDpsOverviewPage')
    cy.signIn()
    Page.verifyOnPage(OverviewPage)
    cy.request('/prisoner/123').its('body').should('contain', 'Overview')
  })

  it('Mini summary list is displayed', () => {
    cy.task('stubDpsOverviewPage')
    cy.signIn()
    Page.verifyOnPage(OverviewPage)
    const overviewPage = Page.verifyOnPage(OverviewPage)
    overviewPage.miniSummaryListMacro().should('exist')
    overviewPage.miniSummaryGroupA().should('exist')
    overviewPage.miniSummaryGroupB().should('exist')
  })

  it('Mini summary Group A should display the macro header', () => {
    cy.task('stubDpsOverviewPage')
    cy.signIn()
    Page.verifyOnPage(OverviewPage)
    const overviewPage = Page.verifyOnPage(OverviewPage)
    overviewPage.miniSummaryGroupA_MacroHeader().should('exist')
  })

  it('Mini summary Group B should hide the macro header', () => {
    cy.task('stubDpsOverviewPage')
    cy.signIn()
    Page.verifyOnPage(OverviewPage)
    const overviewPage = Page.verifyOnPage(OverviewPage)
    overviewPage.miniSummaryGroupB_MacroHeader().should('not.exist')
  })

  it('Should hide the change location link', () => {
    cy.task('stubDpsOverviewPage')
    cy.signIn()
    Page.verifyOnPage(OverviewPage)
    const overviewPage = Page.verifyOnPage(OverviewPage)
    // The link text label is change location but the functionality is change caseload
    overviewPage.headerChangeLocation().should('not.exist')
  })

  context('Non-associations', () => {
    it('Displays the non associations on the page', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.nonAssociations().table().should('exist')
      overviewPage.nonAssociations().rows().should('have.length', 3)
      overviewPage.nonAssociations().row(1).prisonerName().should('have.text', 'John Doe')
      overviewPage.nonAssociations().row(1).prisonNumber().should('have.text', 'ABC123')
      overviewPage.nonAssociations().row(1).location().should('have.text', 'NMI-RECP')
      overviewPage.nonAssociations().row(1).reciprocalReason().should('have.text', 'Victim')
      overviewPage.nonAssociations().row(2).prisonerName().should('have.text', 'Guy Incognito')
      overviewPage.nonAssociations().row(2).prisonNumber().should('have.text', 'DEF321')
      overviewPage.nonAssociations().row(2).location().should('have.text', 'NMI-RECP')
      overviewPage.nonAssociations().row(2).reciprocalReason().should('have.text', 'Rival Gang')
    })
  })
})
