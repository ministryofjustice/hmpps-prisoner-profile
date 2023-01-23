import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
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
})
