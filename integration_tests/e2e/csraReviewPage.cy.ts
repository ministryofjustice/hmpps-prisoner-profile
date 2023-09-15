import Page from '../pages/page'
import CsraReviewPage from '../pages/crsaReviewPage'

const visitCsraReviewPage = (): CsraReviewPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/csra-review?assessmentSeq=12345&bookingId=67891' })
  return Page.verifyOnPageWithTitle(CsraReviewPage, 'CSRA review on 12 January 2017')
}

context('CSRA review page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()

    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubCsraReview', { bookingId: 67891, assessmentSeq: 12345 })
    cy.task('stubGetAgency', 'HLI')
    cy.task('stubStaffDetails', 'BQN38E')
  })

  context('Active Alerts', () => {
    let csraReviewPage: CsraReviewPage

    beforeEach(() => {
      csraReviewPage = visitCsraReviewPage()
    })

    it('should contain elements with CSS classes linked to Google Analytics', () => {
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
