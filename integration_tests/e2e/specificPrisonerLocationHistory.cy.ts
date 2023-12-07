import { CaseLoadsDummyDataA } from '../../server/data/localMockData/caseLoad'
import Page from '../pages/page'
import SpecificPrisonerLocationHistoryPage from '../pages/specificPrisonerLocationHistoryPage'

context('Specific Prisoner Location History', () => {
  const url =
    '/prisoner/G6123VU/location-history?fromDate=2023-07-11T14:56:16&toDate=2023-08-17T12:00:00&locationId=25762&agencyId=LEI'
  const visitLocationHistoryPage = () => {
    cy.signIn({ redirectPath: url })
  }

  context('With a shared location history', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupSpecificLocationHistoryPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        locationId: '25762',
        staffId: 'KQJ74F',
        prisonId: 'LEI',
        caseLoads: CaseLoadsDummyDataA,
        sharingHistory: [
          {
            bookingId: 1234567,
            prisonerNumber: 'A123BC',
            firstName: 'Somebody',
            lastName: 'LastName',
            movedIn: '2023-07-11T00:00:00',
            movedOut: '2023-07-12T00:00:00',
          },
          {
            bookingId: 7654321,
            prisonerNumber: 'D321EF',
            firstName: 'Another',
            lastName: 'Name',
            movedIn: '2023-07-12T12:34:56',
            movedOut: '2023-07-14T12:34:56',
          },
        ],
      })
    })

    it('Specific prisoner location history page is displayed', () => {
      visitLocationHistoryPage()
      Page.verifyOnPageWithTitle(SpecificPrisonerLocationHistoryPage, 'John Saunders’ history in location')
    })

    it('Displays information about the prisoners location history', () => {
      visitLocationHistoryPage()
      const page = Page.verifyOnPageWithTitle(SpecificPrisonerLocationHistoryPage, 'John Saunders’ history in location')
      page.pageTitle().should('contain', '1-1')
      page.location().should('contain', 'Moorland (HMP & YOI)')
      page.movedIn().should('contain', '05/07/2021 - 10:35')
      page.movedOut().should('contain', '05/07/2021 - 10:35')
      page.cellType().should('contain', 'Listener Cell')
      page.movedBy().should('contain', 'John Smith')
      page.reasonForMove().should('contain', 'Some description')
      page.whatHappened().should('contain', 'Test tes')
    })

    it('Displays information about the prisoners shared with', () => {
      visitLocationHistoryPage()
      const page = Page.verifyOnPageWithTitle(SpecificPrisonerLocationHistoryPage, 'John Saunders’ history in location')
      page.sharedWith(0).name().should('contain', 'Name, Another')
      page.sharedWith(0).prisonNumber().should('contain', 'D321EF')
      page.sharedWith(0).movedIn().should('contain', '12/07/2023 - 12:34')
      page.sharedWith(0).movedOut().should('contain', '14/07/2023 - 12:34')

      page.sharedWith(1).name().should('contain', 'Lastname, Somebody')
      page.sharedWith(1).prisonNumber().should('contain', 'A123BC')
      page.sharedWith(1).movedIn().should('contain', '11/07/2023 - 00:00')
      page.sharedWith(1).movedOut().should('contain', '12/07/2023 - 00:00')
    })
  })

  context('Without a shared location history', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupSpecificLocationHistoryPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        locationId: '25762',
        staffId: 'KQJ74F',
        prisonId: 'LEI',
        caseLoads: CaseLoadsDummyDataA,
        sharingHistory: [],
      })
    })

    it('Displays the notice that the prisoner has not shared with anyone', () => {
      visitLocationHistoryPage()
      const page = Page.verifyOnPageWithTitle(SpecificPrisonerLocationHistoryPage, 'John Saunders’ history in location')
      page.notSharedLocationNotice().should('be.visible')
    })
  })
})
