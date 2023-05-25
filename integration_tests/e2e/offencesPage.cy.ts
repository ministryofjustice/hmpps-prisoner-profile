import OffencesPage from '../pages/offencesPage'

import Page from '../pages/page'

const visitOffencesPage = (): OffencesPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/offences' })
  return Page.verifyOnPage(OffencesPage)
}

context('Offences Page', () => {
  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: ['ROLE_GLOBAL_SEARCH'],
      caseLoads: [{ caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: true, description: '', type: '' }],
    })
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupOffencesPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
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
      offencesPage.courtCasesAndOffencesHeader().contains('Court cases and offences')
    })
    it('Show all text should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.showAllText().should('exist')
    })
    it('Section heading should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sectionHeading().should('exist')
      offencesPage.sectionHeading().contains('Sheffield Crown Court')
    })
    it('Section summary should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sectionSummary().should('exist')
      offencesPage.sectionSummary().contains('2 March 2020')
    })
    it('Section toggle text should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sectionToggleText().should('exist')
    })
    context('Offences', () => {
      it('Offences heading text should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sectionSumaryOffences().should('exist')
        offencesPage.sectionSumaryOffences().contains('Offences')
      })
      it('Offence child one should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.offencesChildOne().should('exist')
        offencesPage
          .offencesChildOne()
          .contains('AATF operator/approved exporter fail to include quarterly information in reg 66(1) report')
      })
      it('Offence child two should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.offencesChildTwo().should('exist')
        offencesPage
          .offencesChildTwo()
          .contains('Drive vehicle for more than 13 hours or more in a working day - domestic')
      })
      it('Offence child three should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.offencesChildThree().should('exist')
        offencesPage
          .offencesChildThree()
          .contains('Import nuclear material with intent to evade a prohibition / restriction')
      })
    })
    context('Sentences', () => {
      it('Sentences summary text should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sectionSummarySentences().should('exist')
        offencesPage.sectionSummarySentences().contains('Sentences')
      })
      it('Sentence heading text should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceHeadingOne().should('exist')
        offencesPage.sentenceHeadingOne().contains('Sentence 5')
      })
      it('Sentence type key text should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceOneTypeKey().should('exist')
        offencesPage.sentenceOneTypeKey().contains('Type')
      })
      it('Sentence type value should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceOneTypeValue().should('exist')
        offencesPage.sentenceOneTypeValue().contains('EDS LASPO Discretionary Release')
      })
      it('Sentence start date key should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceOneStartDateKey().should('exist')
        offencesPage.sentenceOneStartDateKey().contains('Start date')
      })
      it('Sentence start date value should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceOneStartDateValue().should('exist')
        offencesPage.sentenceOneStartDateValue().contains('2 March 2020')
      })
      it('Sentence length key should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceOneLengthKey().should('exist')
        offencesPage.sentenceOneLengthKey().contains('Length')
      })
      it('Sentence length value should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceOneLengthValue().should('exist')
        offencesPage.sentenceOneLengthValue().contains('10 years')
      })
      it('Sentence licence key should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceOneLicenceKey().should('exist')
        offencesPage.sentenceOneLicenceKey().contains('Licence')
      })
      it('Sentence licence value should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceOneLicenceValue().should('exist')
        offencesPage.sentenceOneLicenceValue().contains('5 years')
      })
      it('Sentence heading text should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceHeadingTwo().should('exist')
        offencesPage.sentenceHeadingTwo().contains('Sentence 4')
      })
      it('Sentence type key should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceTwoTypeKey().should('exist')
        offencesPage.sentenceTwoTypeKey().contains('Type')
      })
      it('Sentence type value should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceTwoTypeValue().should('exist')
        offencesPage.sentenceTwoTypeValue().contains('CJA03 Standard Determinate Sentence')
      })
      it('Sentence start date key should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceTwoStartDateKey().should('exist')
        offencesPage.sentenceTwoStartDateKey().contains('Start date')
      })
      it('Sentence start date value should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceTwoStartDateValue().should('exist')
        offencesPage.sentenceTwoStartDateValue().contains('2 March 2020')
      })
      it('Sentence length key should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceTwoLengthKey().should('exist')
        offencesPage.sentenceTwoLengthKey().contains('Length')
      })
      it('Sentence length value should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceTwoLengthValue().should('exist')
        offencesPage.sentenceTwoLengthValue().contains('100 years')
      })
      it('Sentence fine key should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceTwoFineKey().should('exist')
        offencesPage.sentenceTwoFineKey().contains('Fine')
      })
      it('Sentence fine value should display', () => {
        const offencesPage = visitOffencesPage()
        offencesPage.showAllText().click({ force: true })
        offencesPage.sentenceTwoFineValue().should('exist')
        offencesPage.sentenceTwoFineValue().contains('£10,000.00')
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
    it('Licence expiry key should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.licenseExpiryKey().should('exist')
      offencesPage.licenseExpiryKey().contains('Licence expiry')
    })
    it('Licence expiry value should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.licenseExpiryValue().should('exist')
      offencesPage.licenseExpiryValue().contains('12 March 2132')
    })
    it('Sentence expiry key should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sentenceExpiryKey().should('exist')
      offencesPage.sentenceExpiryKey().contains('Sentence expiry')
    })
    it('Sentence expiry value should display', () => {
      const offencesPage = visitOffencesPage()
      offencesPage.sentenceExpiryValue().should('exist')
      offencesPage.sentenceExpiryValue().contains('12 March 2132')
    })
  })
})
