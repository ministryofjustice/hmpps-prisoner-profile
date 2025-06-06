import OffencesPage from '../pages/offencesPage'
import Page from '../pages/page'
import { permissionsTests } from './permissionsTests'
import NotFoundPage from '../pages/notFoundPage'

context('Offenses page - Permissions', () => {
  const prisonerNumber = 'G6123VU'
  const visitPage = prisonerDataOverrides => {
    cy.setupPermissionsCheckStubs({ prisonerNumber, prisonerDataOverrides })
    cy.setupBannerStubs({ prisonerNumber, prisonerDataOverrides })
    cy.setupOffencesPageSentencedStubs({ prisonerNumber, bookingId: 1102484 })
    cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/offences' })
  }
  permissionsTests({ prisonerNumber, visitPage, pageToDisplay: OffencesPage })
})

context('Offences Page Sentenced', () => {
  const visitOffencesPage = () => {
    cy.signIn({ redirectPath: '/prisoner/G6123VU/offences' })
  }

  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupPermissionsCheckStubs({ prisonerNumber })
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupOffencesPageSentencedStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
  })

  it('Offences page is displayed', () => {
    visitOffencesPage()
    cy.request('/prisoner/G6123VU/offences').its('body').should('contain', 'Offences')
  })

  it('should contain elements with CSS classes linked to Google Analytics', () => {
    visitOffencesPage()
    cy.get('.info__links').should('exist')
    cy.get('.hmpps-profile-tab-links').should('exist')
    cy.get('.hmpps-sidebar').should('exist')
  })

  it('Displays the Offences tab as active', () => {
    visitOffencesPage()
    const offencesPage = Page.verifyOnPage(OffencesPage)
    offencesPage.activeTab().should('contain', 'Offences')
  })

  context('Sidebar', () => {
    it('Sidebar is displayed', () => {
      visitOffencesPage()
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.sidebar().should('exist')
      offencesPage.sidebar().contains('a', 'Court cases and offences')
      offencesPage.sidebar().contains('a', 'Release dates')
    })
  })

  context('Court cases and offences', () => {
    beforeEach(() => {
      visitOffencesPage()
    })
    it('Court cases and offences card should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.courtCasesAndOffencesCard().should('exist')
    })
    it('Court cases and offences header should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.courtCasesAndOffencesHeader().should('exist')
      offencesPage.courtCasesAndOffencesHeader().contains('Court cases, offences and sentences')
    })
    it('Show all text should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.showAllText().should('exist')
    })
    it('Section heading should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.sectionHeading().should('exist')
      offencesPage.sectionHeading().contains('Court case 1')
    })
    it('Section summary should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.sectionSummary().should('exist')
      offencesPage.sectionSummary().contains('Court case number')
      offencesPage.sectionSummary().contains('Court name')
      offencesPage.sectionSummary().contains('Sheffield Crown Court')
    })
    it('Section toggle text should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.sectionToggleText().should('exist')
    })
    context('Sentenced Counts', () => {
      it('Offences heading text should display', () => {
        const offencesPage = Page.verifyOnPage(OffencesPage)
        offencesPage.showAllText().click({ force: true })
        offencesPage.sectionSumaryOffences().should('exist')
        offencesPage.sectionSumaryOffences().contains('Count 1')
      })
      it('Should contain all count information', () => {
        const offencesPage = Page.verifyOnPage(OffencesPage)
        offencesPage.showAllText().click({ force: true })
        offencesPage.countOffenceCard().should('exist')
        offencesPage.sectionSumaryOffences().contains('Burglary dwelling - with intent to steal')
        offencesPage.sectionSumaryOffences().contains('TH68')
        offencesPage.sectionSumaryOffences().contains('CJA03 Standard Determinate Sentence')
        offencesPage.sectionSumaryOffences().contains('Sentence date')
        offencesPage.sectionSumaryOffences().contains('24 August 2016')
        offencesPage.sectionSumaryOffences().contains('Length')
        offencesPage.sectionSumaryOffences().contains('40 months')
        offencesPage.sectionSumaryOffences().contains('Concurrent or consecutive')
        offencesPage.sectionSumaryOffences().contains('Concurrent')
      })
      it('Should show Not entered for life sentence with no length', () => {
        const offencesPage = Page.verifyOnPage(OffencesPage)
        offencesPage.showAllText().click({ force: true })
        offencesPage.lifeSentenceOffenceCard().should('exist')
        offencesPage.lifeSentenceOffenceCard().contains('Burglary other than dwelling - theft')
        offencesPage.lifeSentenceOffenceCard().contains('TH68')
        offencesPage.lifeSentenceOffenceCard().contains('ORA CJA03 Standard Determinate Sentence')
        offencesPage.lifeSentenceOffenceCard().contains('Sentence date')
        offencesPage.lifeSentenceOffenceCard().contains('7 March 2017')
        offencesPage.lifeSentenceOffenceCard().contains('Length')
        offencesPage.lifeSentenceOffenceCard().contains('Not entered')
        offencesPage.lifeSentenceOffenceCard().contains('Concurrent or consecutive')
        offencesPage.lifeSentenceOffenceCard().contains('Concurrent')
      })
      it('Should contain all count information including the licence', () => {
        const offencesPage = Page.verifyOnPage(OffencesPage)
        offencesPage.showAllText().click({ force: true })
        offencesPage.countFiveCard().should('exist')
        offencesPage
          .countFiveCard()
          .contains('AATF operator/approved exporter fail to include quarterly information in reg 66(1)')
        offencesPage.countFiveCard().contains('WE13')
        offencesPage.countFiveCard().contains('EDS LASPO Discretionary Release')
        offencesPage.countFiveCard().contains('Sentence date')
        offencesPage.countFiveCard().contains('2 March 2020')
        offencesPage.countFiveCard().contains('Length')
        offencesPage.countFiveCard().contains('10 years')
        offencesPage.countFiveCard().contains('Concurrent or consecutive')
        offencesPage.countFiveCard().contains('Concurrent')
        offencesPage.countFiveCard().contains('Licence')
        offencesPage.countFiveCard().contains('5 years')
      })
      it('Should not display accordion toggle if no sentences/offences/terms', () => {
        const offencesPage = Page.verifyOnPage(OffencesPage)
        offencesPage.sectionSummarySentencedNoToggle().should('exist')
        offencesPage.sectionSummarySentencedNoToggle().should('not.have.class', 'govuk-accordion__section')
        offencesPage.sectionSummarySentencedNoToggle().find('.govuk-accordion__section-toggle').should('not.exist')
      })
    })
  })
  context('Unsentenced Counts', () => {
    beforeEach(() => {
      cy.setupOffencesPageUnsentencedStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOffencesPage()
    })

    it('Offences heading text should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.showAllText().click({ force: true })
      offencesPage.sectionSumaryOffences().should('exist')
      offencesPage.sectionSumaryOffences().contains('Count 1')
    })

    it('Should contain all count information', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.showAllText().click({ force: true })
      offencesPage.countOffenceCard().should('exist')
      offencesPage.sectionSumaryOffences().contains('Theft - other - including theft by finding')
      offencesPage.sectionSumaryOffences().contains('Committed on 13 March 2013')
      offencesPage.sectionSumaryOffences().contains('Status')
      offencesPage.sectionSumaryOffences().contains('Recall to Prison')
    })

    it('Should not display accordion toggle if no sentences/offences/terms', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.sectionSummaryUnsentencedNoToggle().should('exist')
      offencesPage.sectionSummaryUnsentencedNoToggle().should('not.have.class', 'govuk-accordion__section')
      offencesPage.sectionSummaryUnsentencedNoToggle().find('.govuk-accordion__section-toggle').should('not.exist')
    })
  })

  context('Release dates', () => {
    beforeEach(() => {
      visitOffencesPage()
    })

    it('Release dates card is displayed', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.releaseDatesCard().should('exist')
    })
    it('Release dates header should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.releaseDatesSummaryHeader().should('exist')
      offencesPage.releaseDatesSummaryHeader().contains('Release dates')
    })

    it('Confirmed release date key should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.confirmedReleaseDateKey().should('exist')
      offencesPage.confirmedReleaseDateKey().contains('Confirmed release date')
    })
    it('Confirmed release date value should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.confirmedReleaseDateValue().should('exist')
      offencesPage.confirmedReleaseDateValue().contains('29 January 2076')
    })

    it('Conditional release key should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.conditionalReleaseKey().should('exist')
      offencesPage.conditionalReleaseKey().contains('Conditional release')
    })
    it('Conditional release value should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.conditionalReleaseValue().should('exist')
      offencesPage.conditionalReleaseValue().contains('29 January 2076')
    })

    it('Parole eligibility key should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.paroleEligibilityKey().should('exist')
      offencesPage.paroleEligibilityKey().contains('Parole eligibility')
    })
    it('Parole eligibility value should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.paroleEligibilityValue().should('exist')
      offencesPage.paroleEligibilityValue().contains('12 December 2021')
    })

    it('Post-recall release date (PRRD) key should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.postRecallKey().should('exist')
      offencesPage.postRecallKey().contains('Post-recall release date (PRRD)')
    })

    it('Post-recall release date (PRRD) value should display', () => {
      const offencesPage = Page.verifyOnPage(OffencesPage)
      offencesPage.postRecallValue().should('exist')
      offencesPage.postRecallValue().contains('12 December 2021')
    })

    it('Offences page should go to 404 not found page', () => {
      cy.visit(`/prisoner/asudhsdudhid/offences`, { failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })
})
