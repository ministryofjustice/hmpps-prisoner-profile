import Page from '../pages/page'
import CsraReviewPage from '../pages/crsaReviewPage'
import CsraHistoryPage from '../pages/crsaHistoryPage'

const visitCsraReviewPage = (): CsraReviewPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/csra-review?assessmentSeq=12345&bookingId=67891' })
  return Page.verifyOnPageWithTitle(CsraReviewPage, 'CSRA review on 12 January 2017')
}

const visitCsraHistoryPage = (): CsraHistoryPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/csra-history' })
  return Page.verifyOnPageWithTitle(CsraHistoryPage, 'John Saunders’ CSRA history')
}

context('CSRA page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()

    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })

    cy.task('stubCsraHistory', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetAgency', 'MDI')

    cy.task('stubCsraReview', { bookingId: 67891, assessmentSeq: 12345 })
    cy.task('stubGetAgency', 'HLI')
    cy.task('stubStaffDetails', 'BQN38E')
  })

  context('CSRA history page', () => {
    let csraHistoryPage: CsraHistoryPage

    beforeEach(() => {
      csraHistoryPage = visitCsraHistoryPage()
    })

    it('should contain csra details', () => {
      csraHistoryPage.h1().contains('John Saunders’ CSRA history')
      csraHistoryPage.csraList().children('.govuk-grid-row').should('have.length', 2)

      const firstCsraLink = csraHistoryPage
        .firstCsra()
        .find('[href="/prisoner/G6123VU/csra-review?assessmentSeq=12345&bookingId=67891"]')

      firstCsraLink.click()

      Page.verifyOnPageWithTitle(CsraReviewPage, 'CSRA review on 12 January 2017')
    })

    it('should allow filtering of results', () => {
      csraHistoryPage.filters().should('exist')
      const csraFilters = csraHistoryPage.filters().find('[name="csra"]')
      csraFilters.should('have.length', 2)
      csraHistoryPage.filters().get('[name="location"]').should('have.length', 1)
      csraHistoryPage.filters().get('#startDate').should('exist')
      csraHistoryPage.filters().get('#endDate').should('exist')

      csraFilters.first().click()
      csraHistoryPage.applyFiltersBtn().click()
      Page.verifyOnPageWithTitle(CsraHistoryPage, 'John Saunders’ CSRA history')
      csraHistoryPage.csraList().children('.govuk-grid-row').should('have.length', 1)
    })
  })

  context('CSRA review page', () => {
    let csraReviewPage: CsraReviewPage

    beforeEach(() => {
      csraReviewPage = visitCsraReviewPage()
    })

    it('should contain csra details', () => {
      csraReviewPage.h1().contains('CSRA review on 12 January 2017')
      csraReviewPage.csraValue().contains('Standard')
      csraReviewPage.authorisedBy().contains('Review Board')
      csraReviewPage.location().contains('Moorland (HMP & YOI)')
      csraReviewPage.comments().contains('HiMEIesRHiMEIesR')
      csraReviewPage.reviewedBy().contains('Reception - John Smith')
      csraReviewPage.nextReviewDate().contains('13 January 2018')

      csraReviewPage.reviewQuestions().children('.govuk-summary-list__row').should('have.length', 1)
      csraReviewPage
        .reviewQuestions()
        .find('.govuk-summary-list__row > .govuk-summary-list__key')
        .contains('Select Risk Rating')
      csraReviewPage
        .reviewQuestions()
        .find('.govuk-summary-list__row > .govuk-summary-list__value')
        .contains('Standard')
    })
  })
})
