import Page from '../pages/page'
import CsraReviewPage from '../pages/crsaReviewPage'
import CsraHistoryPage from '../pages/crsaHistoryPage'
import agenciesDetails from '../../server/data/localMockData/agenciesDetails'

const visitCsraReviewPage = ({
  prisonerNumber,
  assessmentSeq,
  bookingId,
}: {
  prisonerNumber: string
  assessmentSeq: number
  bookingId: number
}): CsraReviewPage => {
  cy.signIn({
    redirectPath: `/prisoner/${prisonerNumber}/csra-review?assessmentSeq=${assessmentSeq}&bookingId=${bookingId}`,
  })
  return Page.verifyOnPageWithTitle(CsraReviewPage, 'CSRA review on 12 January 2017')
}

const visitCsraHistoryPage = (): CsraHistoryPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/csra-history' })
  return Page.verifyOnPageWithTitle(CsraHistoryPage, 'John Saunders’ CSRA history')
}

context('CSRA page', () => {
  beforeEach(() => {
    const prisonerNumber = 'G6123VU'
    cy.task('reset')
    cy.setupUserAuth()

    cy.task('stubPrisonerData', { prisonerNumber })

    cy.task('stubCsraHistory', {
      prisonerNumber,
      overrides: [
        {
          bookingId: 67891,
          prisonerNumber,
          assessmentSeq: 3,
          assessmentAgencyId: agenciesDetails.agencyId,
        },
        {
          assessmentSeq: 4,
          prisonerNumber,
          classificationCode: 'MED',
          assessmentAgencyId: agenciesDetails.agencyId,
        },
        {
          assessmentSeq: 5,
          prisonerNumber,
          classificationCode: 'HI',
          assessmentAgencyId: agenciesDetails.agencyId,
        },
      ],
    })
    cy.task('stubGetAgency', 'MDI')

    cy.task('stubCsraReview', { bookingId: 67891, assessmentSeq: 3, overrides: { offenderNo: prisonerNumber } })
    cy.task('stubCsraReview', {
      bookingId: 111111,
      assessmentSeq: 4,
      overrides: { originalClassificationCode: 'HI', classificationReviewReason: null },
    })
    cy.task('stubCsraReview', {
      bookingId: 111111,
      assessmentSeq: 5,
      overrides: { classificationCode: 'HI', approvalDate: null },
    })
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
      csraHistoryPage.csraList().children('.govuk-grid-row').should('have.length', 3)

      csraHistoryPage.csraApprovalStatus(0).should('include.text', 'Approved')
      csraHistoryPage.csraApprovalStatus(1).should('include.text', 'Level changed at approval')
      csraHistoryPage.csraApprovalStatus(2).should('include.text', 'Waiting for approval')

      const firstCsraLink = csraHistoryPage
        .csra(0)
        .find('[href="/prisoner/G6123VU/csra-review?assessmentSeq=3&bookingId=67891"]')

      firstCsraLink.click()

      Page.verifyOnPageWithTitle(CsraReviewPage, 'CSRA review on 12 January 2017')
    })

    it('should allow filtering of results', () => {
      csraHistoryPage.filters().should('exist')
      const csraFilters = csraHistoryPage.filters().find('[name="csra"]')
      csraFilters.should('have.length', 3)
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
      csraReviewPage = visitCsraReviewPage({ prisonerNumber: 'G6123VU', bookingId: 67891, assessmentSeq: 3 })
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
