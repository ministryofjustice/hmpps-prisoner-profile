import ActivePunishmentsPage from '../pages/activePunishments'
import Page from '../pages/page'

context('Active punishments', () => {
  const activePunishmentsPageUrl = () => {
    cy.signIn({ redirectPath: '/prisoner/G6123VU/active-punishments' })
  }

  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupActivePunishmentsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
  })

  it('Active punishments page is displayed', () => {
    activePunishmentsPageUrl()
    cy.request('/prisoner/G6123VU/active-punishments').its('body').should('contain', 'active punishments')
  })

  it('Active punishments should contain the correct adjudication data', () => {
    activePunishmentsPageUrl()
    const activePunishmentsPage = Page.verifyOnPageWithTitle(ActivePunishmentsPage, 'active Punishments')
    activePunishmentsPage.h1().contains('John Saunders’ active punishments')
    activePunishmentsPage.punishmentTypeLabel().contains('Punishment type')
    activePunishmentsPage.detailsCommentLabel().contains('Details')
    activePunishmentsPage.startDateLabel().contains('Start date')
    activePunishmentsPage.firstRowPunishmentType().contains('10 days Forfeiture of Privileges')
    activePunishmentsPage.firstRowDetailsComment().contains('Loss of CANTEEN')
    activePunishmentsPage.firstRowStartDate().contains('31/05/2023')
    activePunishmentsPage.viewHistoryLink().contains('View adjudication history')
  })

  it('View history link should go to the adjudication history page', () => {
    activePunishmentsPageUrl()
    const activePunishmentsPage = Page.verifyOnPageWithTitle(ActivePunishmentsPage, 'active Punishments')

    activePunishmentsPage.viewHistoryLink().click()
  })
})
