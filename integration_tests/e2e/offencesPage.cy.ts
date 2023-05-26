import OffencesPage from '../pages/offencesPage'
import Page from '../pages/page'

context('Offences Page Sentenced', () => {
  const visitOffencesPage = (): OffencesPage => {
    cy.signIn({ redirectPath: '/prisoner/G6123VU/offences' })
    return Page.verifyOnPage(OffencesPage)
  }

  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupOffencesPageSentencedStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
  })

  it('Offences page is displayed', () => {
    visitOffencesPage()
    cy.request('/prisoner/G6123VU/offences').its('body').should('contain', 'Offences')
  })

  it('Displays the Offences tab as active', () => {
    const offencesPage = visitOffencesPage()
    offencesPage.activeTab().should('contain', 'Offences')
  })

  context('Sidebar', () => {
    it('Sidebar is displayed', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sidebar().should('exist')
      offencesPage.sidebar().contains('a', 'Court cases and offences')
      offencesPage.sidebar().contains('a', 'Release dates')
    })
  })

  context('Court cases and offences', () => {
    it('Court cases and offences card should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.courtCasesAndOffencesCard().should('exist')
    })
    it('Court cases and offences header should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.courtCasesAndOffencesHeader().should('exist')
      offencesPage.courtCasesAndOffencesHeader().contains('Court cases, offences and sentences')
    })
    it('Show all text should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.showAllText().should('exist')
    })
    it('Section heading should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sectionHeading().should('exist')
      offencesPage.sectionHeading().contains('Court case 1')
    })
    it('Section summary should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sectionSummary().should('exist')
      offencesPage.sectionSummary().contains('Court case number')
      offencesPage.sectionSummary().contains('Court name')
      offencesPage.sectionSummary().contains('Sheffield Crown Court')
    })
    it('Section toggle text should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sectionToggleText().should('exist')
    })
    context('Sentenced Counts', () => {
      it('Offences heading text should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sectionSumaryOffences().should('exist')
        offencesPage.sectionSumaryOffences().contains('Count 5')
      })
      it('Should contain all count information', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.countOffenceCard().should('exist')
        offencesPage
          .sectionSumaryOffences()
          .contains('Drive vehicle for more than 13 hours or more in a working day - domestic')
        offencesPage.sectionSumaryOffences().contains('TR68')
        offencesPage.sectionSumaryOffences().contains('EDS LASPO Discretionary Release')
        offencesPage.sectionSumaryOffences().contains('Sentence date')
        offencesPage.sectionSumaryOffences().contains('2 March 2020')
        offencesPage.sectionSumaryOffences().contains('Length')
        offencesPage.sectionSumaryOffences().contains('10 years')
        offencesPage.sectionSumaryOffences().contains('Concurrent or consecutive')
        offencesPage.sectionSumaryOffences().contains('Concurrent')
        offencesPage.sectionSumaryOffences().contains('Licence')
        offencesPage.sectionSumaryOffences().contains('5 years')
      })
    })
    context('Unsentenced Counts', () => {
      it('Offences heading text should display', () => {
        cy.setupOffencesPageUnsentencedStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sectionSumaryOffences().should('exist')
        offencesPage.sectionSumaryOffences().contains('Count 1')
      })
      it('Should contain all count information', () => {
        cy.setupOffencesPageUnsentencedStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.countOffenceCard().should('exist')
        offencesPage.sectionSumaryOffences().contains('Theft - other - including theft by finding')
        offencesPage.sectionSumaryOffences().contains('Committed on 13 March 2013')
        offencesPage.sectionSumaryOffences().contains('Status')
        offencesPage.sectionSumaryOffences().contains('Recall to Prison')
      })
    })
  })

  context('Release dates', () => {
    it('Release dates card is displayed', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.releaseDatesCard().should('exist')
    })
    it('Release dates header should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.releaseDatesSummaryHeader().should('exist')
      offencesPage.releaseDatesSummaryHeader().contains('Release dates')
    })
    it('Conditional release key should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.conditionalReleaseKey().should('exist')
      offencesPage.conditionalReleaseKey().contains('Conditional release')
    })
    it('Conditional release value should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.conditionalReleaseValue().should('exist')
      offencesPage.conditionalReleaseValue().contains('29 January 2076')
    })
    it('Post recall release key should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.postRecallKey().should('exist')
      offencesPage.postRecallKey().contains('Post recall release')
    })
    it('Post recall release value should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.postRecallValue().should('exist')
      offencesPage.postRecallValue().contains('12 December 2021')
    })
    it('Parole eligibility key should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.paroleEligibilityKey().should('exist')
      offencesPage.paroleEligibilityKey().contains('Parole eligibility')
    })
    it('Parole eligibility value should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.paroleEligibilityValue().should('exist')
      offencesPage.paroleEligibilityValue().contains('12 December 2021')
    })
  })
})
