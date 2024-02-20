import Page from '../pages/page'
import IncentiveLevelDetailsPage from '../pages/incentiveLevelDetailsPage'
import { Role } from '../../server/data/enums/role'

const visitIncentiveLevelDetailsPage = (): IncentiveLevelDetailsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/incentive-level-details' })
  return Page.verifyOnPageWithTitle(IncentiveLevelDetailsPage, 'John Saunders’ incentive details')
}

context('Incentive level details page - prisoner with no incentives', () => {
  let incentiveLevelDetailsPage: IncentiveLevelDetailsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetAgency', { agencyId: 'MDI' })
    cy.task('stubGetReviews', { bookingId: -1, withDetails: true })

    incentiveLevelDetailsPage = visitIncentiveLevelDetailsPage()
  })

  it('should a message that the prisoner has no incentive level history', () => {
    incentiveLevelDetailsPage.currentIncentiveLevel().should('contain', 'Not entered')
    incentiveLevelDetailsPage.nextReviewDate().should('contain', 'Not entered')
    incentiveLevelDetailsPage.nextReviewDateOverdue().should('not.exist')
    incentiveLevelDetailsPage.noIncentivesMessage().should('contain', 'John Saunders has no incentive level history')
    incentiveLevelDetailsPage.recordIncentiveLevelButton().should('not.exist')
    incentiveLevelDetailsPage.incentivesFilter().should('not.exist')
    incentiveLevelDetailsPage.incentiveLevelHistoryTable().should('not.exist')
  })
})

context('Incentive level details page - prisoner with incentives', () => {
  let incentiveLevelDetailsPage: IncentiveLevelDetailsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.MaintainIEP] })
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetAgency', { agencyId: 'MDI' })
    cy.task('stubGetReviews', { bookingId: 1102484, withDetails: true })

    incentiveLevelDetailsPage = visitIncentiveLevelDetailsPage()
  })

  it('should contain a list of incentive level details', () => {
    incentiveLevelDetailsPage.currentIncentiveLevel().should('contain', 'Standard')
    incentiveLevelDetailsPage.nextReviewDate().should('contain', '1 January 2024')
    incentiveLevelDetailsPage.nextReviewDateOverdue().should('contain', 'days overdue')
    incentiveLevelDetailsPage.noIncentivesMessage().should('not.exist')
    incentiveLevelDetailsPage.recordIncentiveLevelButton().should('exist')
    incentiveLevelDetailsPage.incentivesFilter().should('exist')
    incentiveLevelDetailsPage
      .incentiveLevelHistoryTable()
      .find('tbody tr td:nth-child(1)')
      .should('contain.text', '01/12/2023 - 10:35')
    incentiveLevelDetailsPage
      .incentiveLevelHistoryTable()
      .find('tbody tr td:nth-child(2)')
      .should('contain.text', 'Standard')
    incentiveLevelDetailsPage
      .incentiveLevelHistoryTable()
      .find('tbody tr td:nth-child(3)')
      .should('contain.text', 'A review took place')
    incentiveLevelDetailsPage
      .incentiveLevelHistoryTable()
      .find('tbody tr td:nth-child(4)')
      .should('contain.text', 'Moorland (HMP & YOI)')
    incentiveLevelDetailsPage
      .incentiveLevelHistoryTable()
      .find('tbody tr td:nth-child(5)')
      .should('contain.text', 'Not entered')
  })
})
