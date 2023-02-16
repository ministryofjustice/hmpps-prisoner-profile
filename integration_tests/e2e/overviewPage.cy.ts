import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'

const visitOverviewPage = (): OverviewPage => {
  cy.task('stubDpsOverviewPage')
  cy.signIn()
  return Page.verifyOnPage(OverviewPage)
}

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubNonAssociations', 'G6123VU')
    cy.task('stubPrisonerData', 'G6123VU')
    cy.task('stubAccountBalances', '1102484')
    cy.task('stubAdjudications', '1102484')
    cy.task('stubVisitSummary', '1102484')
    cy.task('stubVisitBalances', 'G6123VU')
    cy.task('stubAssessments', '1102484')
    cy.task('stubEventsForToday', '1102484')
  })

  it('Overview page is displayed', () => {
    cy.task('stubDpsOverviewPage')
    cy.signIn()
    Page.verifyOnPage(OverviewPage)
    cy.request('/prisoner/G6123VU').its('body').should('contain', 'Overview')
  })

  context('Mini Summary A', () => {
    it('Mini summary list is displayed', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.miniSummaryGroupA().should('exist')
    })

    it('Mini summary Group A should display the macro header', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.miniSummaryGroupA_MacroHeader().should('exist')
    })

    it('Mini summary Group A should contain Money card with correct data', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.moneyCard().contains('h2', 'Money')
      overviewPage.moneyCard().contains('p', 'Spends')
      overviewPage.moneyCard().contains('p', '£240.51')
      overviewPage.moneyCard().contains('p', 'Cash')
      overviewPage.moneyCard().contains('p', '£0.00')
      overviewPage.moneyCard().contains('a', 'Transactions and savings')
    })

    it('Mini summary Group A should contain Adjudications card with correct data', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.adjudicationsCard().contains('h2', 'Adjudications')
      overviewPage.adjudicationsCard().contains('p', 'Proven in last 3 months')
      overviewPage.adjudicationsCard().contains('p', '4')
      overviewPage.adjudicationsCard().contains('p', 'Active')
      overviewPage.adjudicationsCard().contains('p', 'No active awards')
      overviewPage.adjudicationsCard().contains('a', 'Adjudications history')
    })

    it('Mini summary Group A should contain Visits card with correct data', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.visitsCard().contains('h2', 'Visits')
      overviewPage.visitsCard().contains('p', 'Next visit date')
      overviewPage.visitsCard().contains('p', '15/09/2023')
      overviewPage.visitsCard().contains('p', 'Remaining visits')
      overviewPage.visitsCard().contains('p', '6')
      overviewPage.visitsCard().contains('p', 'Including 2 privileged visits')
      overviewPage.visitsCard().contains('a', 'Visits details')
    })
  })

  context('Mini Summary B', () => {
    it('Mini summary list is displayed', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.miniSummaryGroupB().should('exist')
    })

    it('Mini summary Group B should hide the macro header', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.miniSummaryGroupB_MacroHeader().should('not.exist')
    })

    it('Mini summary Group B should contain Category card with correct data', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.categoryCard().contains('p', 'Category')
      overviewPage.categoryCard().contains('p', 'B')
      overviewPage.categoryCard().contains('p', 'Next review: 19/02/2023')
      overviewPage.categoryCard().contains('a', 'Manage category')
    })

    it('Mini summary Group B should contain Incentives card with correct data', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.incentivesCard().contains('p', 'Incentive level')
      overviewPage.incentivesCard().contains('p', 'Standard')
      overviewPage.incentivesCard().contains('p', 'Next review: 30/01/2024')
      overviewPage.incentivesCard().contains('a', 'Incentive level details')
    })

    it('Mini summary Group B should contain CSRA card with correct data', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.csraCard().contains('p', 'CSRA')
      overviewPage.csraCard().contains('p', 'Standard')
      overviewPage.csraCard().contains('p', 'Last review: 19/02/2021')
      overviewPage.csraCard().contains('a', 'CSRA history')
    })
  })

  it('Should hide the change location link', () => {
    cy.task('stubDpsOverviewPage')
    cy.signIn()
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

  context('Personal details', () => {
    it('Displays the prisoner presonal details', () => {
      cy.task('stubDpsOverviewPage')
      cy.signIn()
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.personalDetails().should('exist')
    })
  })
  context('Schedule', () => {
    it('Displays the schedule on the page', () => {
      const overviewPage = visitOverviewPage()
      overviewPage.schedule().morning().column().should('exist')
      overviewPage.schedule().afternoon().column().should('exist')
      overviewPage.schedule().evening().column().should('exist')

      overviewPage.schedule().morning().item(0).should('include.text', 'Joinery AM')
      overviewPage.schedule().afternoon().item(0).should('include.text', 'Joinery PM')
      overviewPage.schedule().evening().item(0).should('include.text', 'Gym - Football')
      overviewPage.schedule().evening().item(1).should('include.text', 'VLB - Test')
    })
  })
})
