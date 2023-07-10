import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'
import IndexPage from '../pages'

const visitOverviewPage = (): OverviewPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU' })
  return Page.verifyOnPage(OverviewPage)
}

context('Profile banner', () => {
  context('Given the prisoner is not within the users caseload', () => {
    context('Given the user has the GLOBAL_SEARCH role', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({
          roles: ['ROLE_GLOBAL_SEARCH'],
          caseLoads: [{ caseloadFunction: '', caseLoadId: '123', currentlyActive: true, description: '', type: '' }],
        })
        cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      })

      it('Displays the banner', () => {
        visitOverviewPage()
        cy.getDataQa('visible-outside-establishment-banner').should('exist')
      })

      it('Displays CSRA info without the link', () => {
        visitOverviewPage()
        const overviewPage = new OverviewPage()
        overviewPage.csraWithoutLink().should('exist')
      })
    })
  })

  context('Given the prisoner is within the users caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: ['ROLE_PRISON'],
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    })

    it('Hides the banner', () => {
      visitOverviewPage()
      cy.getDataQa('hidden-outside-establishment-banner').should('exist')
    })
  })

  context('Given the prisoner is released from prison', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: ['ROLE_GLOBAL_SEARCH'],
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'OUT', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        prisonerDataOverrides: { prisonId: 'OUT' },
      })
    })

    context('Hide the incorrect banners', () => {
      it('Hide the TRN banner', () => {
        visitOverviewPage()
        cy.getDataQa('TRN-establishment-banner').should('not.exist')
      })
      it('Hide the outside your establishment banner', () => {
        visitOverviewPage()
        cy.getDataQa('outside-establishment-banner').should('not.exist')
      })
    })

    it('Display the prisoner is released banner', () => {
      visitOverviewPage()
      cy.getDataQa('OUT-establishment-banner').should('exist')
      const indexPage = new IndexPage()
      indexPage.prisonerOUTBanner().should('exist')
    })
  })

  context('Given the prisoner is being transferred', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: ['ROLE_GLOBAL_SEARCH'],
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'TRN', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        prisonerDataOverrides: { prisonId: 'TRN' },
      })
    })

    context('Hide the incorrect banners', () => {
      it('Hide the OUT banner', () => {
        visitOverviewPage()
        cy.getDataQa('OUT-establishment-banner').should('not.exist')
      })
      it('Hide the outside your establishment banner', () => {
        visitOverviewPage()
        cy.getDataQa('outside-establishment-banner').should('not.exist')
      })
    })

    it('Display the prisoner TRN banner', () => {
      visitOverviewPage()
      cy.getDataQa('TRN-establishment-banner').should('exist')
      const indexPage = new IndexPage()
      indexPage.prisonerTRNBanner().should('exist')
    })

    it('Displays CSRA info with the link', () => {
      visitOverviewPage()
      const overviewPage = new OverviewPage()
      overviewPage.csraWithLink().should('exist')
    })
  })
})
