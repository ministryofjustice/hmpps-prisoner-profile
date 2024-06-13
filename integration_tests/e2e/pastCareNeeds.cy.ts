import Page from '../pages/page'
import PastCareNeedsPage from '../pages/pastCareNeedsPage'
import { componentsNoServicesMock } from '../../server/data/localMockData/componentApi/componentsMetaMock'

const visitPastCareNeedsPage = (): PastCareNeedsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/past-care-needs' })
  return Page.verifyOnPageWithTitle(PastCareNeedsPage, 'John Saunders’ past care needs')
}

context('Past care needs page', () => {
  let pastCareNeedsPage: PastCareNeedsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubComponentsMeta', componentsNoServicesMock)
    cy.task('stubPastCareNeeds', 1102484)
    cy.task('stubHealthReferenceDomain')
    cy.task('stubHealthTreatmentReferenceDomain')
    cy.task('stubReasonableAdjustments', 1102484)

    pastCareNeedsPage = visitPastCareNeedsPage()
  })

  it('should contain a list of past care needs', () => {
    pastCareNeedsPage.careNeeds().personalCareNeeds(0).type().should('include.text', 'Medical')
    pastCareNeedsPage.careNeeds().personalCareNeeds(0).description().should('include.text', 'False Limbs')
    pastCareNeedsPage.careNeeds().personalCareNeeds(0).comment().should('include.text', 'Peg leg')
    pastCareNeedsPage.careNeeds().personalCareNeeds(0).addedOn().should('include.text', '19 May 2023')

    pastCareNeedsPage
      .careNeeds()
      .personalCareNeeds(0)
      .reasonableAdjustments(0)
      .description()
      .should('include.text', 'Behavioural responses/Body language')
    pastCareNeedsPage
      .careNeeds()
      .personalCareNeeds(0)
      .reasonableAdjustments(0)
      .comment()
      .should('include.text', 'psych care type adjustment comment goes here')
    pastCareNeedsPage
      .careNeeds()
      .personalCareNeeds(0)
      .reasonableAdjustments(0)
      .addedBy()
      .should('include.text', 'Moorland (HMP & YOI)')
    pastCareNeedsPage
      .careNeeds()
      .personalCareNeeds(0)
      .reasonableAdjustments(0)
      .addedOn()
      .should('include.text', '9 June 1999')

    pastCareNeedsPage
      .careNeeds()
      .personalCareNeeds(0)
      .reasonableAdjustments(1)
      .description()
      .should('include.text', 'Comfort and Dressing Aids')
    pastCareNeedsPage
      .careNeeds()
      .personalCareNeeds(0)
      .reasonableAdjustments(1)
      .addedBy()
      .should('include.text', 'Moorland (HMP & YOI)')
    pastCareNeedsPage
      .careNeeds()
      .personalCareNeeds(0)
      .reasonableAdjustments(1)
      .addedOn()
      .should('include.text', '9 June 2020')

    pastCareNeedsPage.careNeeds().personalCareNeeds(1).type().should('include.text', 'Social Care')
    pastCareNeedsPage
      .careNeeds()
      .personalCareNeeds(1)
      .description()
      .should('include.text', 'Being Appropriately Clothed')
    pastCareNeedsPage.careNeeds().personalCareNeeds(1).comment().should('include.text', 'Double denim')
    pastCareNeedsPage.careNeeds().personalCareNeeds(1).addedOn().should('include.text', '9 June 2020')
  })
})
