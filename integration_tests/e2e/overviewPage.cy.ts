import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'
import { Role } from '../../server/data/enums/role'
import { permissionsTests } from './permissionsTests'
import NotFoundPage from '../pages/notFoundPage'
import { calculateAge } from '../../server/utils/utils'
import { ComplexityLevel } from '../../server/data/interfaces/complexityApi/ComplexityOfNeed'
import { mockContactDetailYouthEstate } from '../../server/data/localMockData/contactDetail'

const visitOverviewPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU' })
}

const visitOverviewPageAlt = (): OverviewPage => {
  cy.signIn({ redirectPath: '/prisoner/A1234BC' })
  return Page.verifyOnPage(OverviewPage)
}

const visitOverviewPageOnRemand = (): OverviewPage => {
  cy.signIn({ redirectPath: '/prisoner/ONREMAND' })
  return Page.verifyOnPage(OverviewPage)
}

context('Overview Page', () => {
  context('Permissions', () => {
    const prisonerNumber = 'G6123VU'
    const visitPage = prisonerDataOverrides => {
      cy.setupOverviewPageStubs({ prisonerNumber, bookingId: 1102484, prisonerDataOverrides })
      visitOverviewPage({ failOnStatusCode: false })
    }

    permissionsTests({ prisonerNumber, pageToDisplay: OverviewPage, visitPage })
  })

  context('Given the prisoner is not within the users caseload', () => {
    context('Given the user has the GLOBAL_SEARCH role', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({
          roles: ['ROLE_GLOBAL_SEARCH'],
          caseLoads: [{ caseloadFunction: '', caseLoadId: '123', currentlyActive: true, description: '', type: '' }],
        })
        cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      })

      it('Does not display the sidebar', () => {
        visitOverviewPage()
        cy.getDataQa('hidden-overview-side-bar').should('exist')
      })

      it('Does not display the schedule', () => {
        visitOverviewPage()
        cy.getDataQa('hidden-overview-schedule').should('exist')
      })
    })
  })

  context('Given prisoner is within the users case load', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOverviewPage()
    })

    it('Overview page is displayed', () => {
      cy.request('/prisoner/G6123VU').its('body').should('contain', 'Overview')
    })

    it('should contain elements with CSS classes linked to Google Analytics', () => {
      cy.get('.info__links').should('exist')
      cy.get('.hmpps-profile-tab-links').should('exist')
      cy.get('.hmpps-actions-block__list').should('exist')
    })

    it('Displays the overview tab as active', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.activeTab().should('contain', 'Overview')
    })

    context('Mini Summary A', () => {
      it('Mini summary list is displayed', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.miniSummaryGroupA().should('exist')
      })

      it('Mini summary Group A should display the macro header', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.miniSummaryGroupA_MacroHeader().should('exist')
      })

      it('Mini summary Group A should contain Money card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.moneyCard().contains('h2', 'Money')
        overviewPage.moneyCard().contains('p', 'Spends')
        overviewPage.moneyCard().contains('p', '£240.51')
        overviewPage.moneyCard().contains('p', 'Private cash')
        overviewPage.moneyCard().contains('p', '£35.00')
        overviewPage.moneyCard().contains('a', 'Transactions and savings')
      })

      it('Mini summary Group A should contain Adjudications card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.adjudicationsCard().contains('h2', 'Adjudications')
        overviewPage.adjudicationsCard().contains('p', 'Proven in last 3 months')
        overviewPage.adjudicationsCard().contains('p', '4')
        overviewPage.adjudicationsCard().contains('p', 'Active')
        overviewPage.adjudicationsCard().contains('p', 'No active punishments')
        overviewPage
          .adjudicationsCard()
          .contains(
            'a[href="http://localhost:3000/adjudications/adjudication-history/G6123VU"]',
            'Adjudication history',
          )
      })

      it('Mini summary Group A should contain Visits card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.visitsCard().contains('h2', 'Visits')
        overviewPage.visitsCard().contains('p', 'Next visit date')
        overviewPage.visitsCard().contains('p', '15/09/2023')
        overviewPage.visitsCard().contains('p', 'Remaining visits')
        overviewPage.visitsCard().contains('p', '6')
        overviewPage.visitsCard().contains('p', 'Including 2 privileged visits')
        overviewPage.visitsCard().contains('a', 'Visits details')
      })
    })

    context('Mini Summary B', () => {
      it('Mini summary list is displayed', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.miniSummaryGroupB().should('exist')
      })

      it('Mini summary Group B should hide the macro header', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.miniSummaryGroupB_MacroHeader().should('not.exist')
      })

      it('Mini summary Group B should contain Category card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.categoryCard().contains('p', 'Category')
        overviewPage.categoryCard().contains('p', 'B')
        overviewPage.categoryCard().contains('p', 'Next review: 19/02/2023')
        overviewPage.categoryCard().contains('a', 'Category')
      })

      it('Mini summary Group B should contain Incentives card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.incentivesCard().contains('p', 'Incentives: since last review')
        overviewPage.incentivesCard().contains('p', 'Positive behaviours: 1')
        overviewPage.incentivesCard().contains('p', 'Negative behaviours: 1')
        overviewPage.incentivesCard().contains('p', 'Next review by: 01/01/2024')
        overviewPage.incentivesCard().contains('a', 'Incentive level details')
      })

      it('Mini summary Group B should contain CSRA card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.csraCard().contains('p', 'CSRA')
        overviewPage.csraCard().contains('p', 'Standard')
        overviewPage.csraCard().contains('p', 'Last review: 19/02/2021')
        overviewPage.csraCard().contains('a', 'CSRA history')
      })
    })

    it('Should hide the change location link', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      // The link text label is change location but the functionality is change caseload
      overviewPage.headerChangeLocation().should('not.exist')
    })

    context('Personal details', () => {
      it('Displays the prisoner presonal details', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.personalDetails().perferredName().should('include.text', 'John')
        overviewPage.personalDetails().dateOfBirth().should('include.text', '12/10/1990')
        const expectedAge = calculateAge('1990-10-12')
        overviewPage
          .personalDetails()
          .age()
          .should('include.text', `${expectedAge.years} years, ${expectedAge.months} month`)
        overviewPage.personalDetails().nationality().should('include.text', 'Stateless')
        overviewPage.personalDetails().spokenLanguage().should('include.text', 'Welsh')

        overviewPage
          .personalDetails()
          .ethnicGroup()
          .should('include.text', 'White: Eng./Welsh/Scot./N.Irish/British (W1)')
        overviewPage.personalDetails().religionOrBelief().should('include.text', 'Celestial Church of God')
        overviewPage.personalDetails().croNumber().should('include.text', '400862/08W')
        overviewPage.personalDetails().pncNumber().should('include.text', '08/359381C')
      })
    })

    context('Schedule', () => {
      it('Displays the schedule on the page', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.schedule().morning().column().should('exist')
        overviewPage.schedule().afternoon().column().should('exist')
        overviewPage.schedule().evening().column().should('exist')

        overviewPage.schedule().morning().item(0).should('include.text', 'Joinery AM')
        overviewPage.schedule().afternoon().item(0).should('include.text', 'Joinery PM')
        overviewPage.schedule().evening().item(0).should('include.text', 'Gym - Football')
        overviewPage.schedule().evening().item(1).should('include.text', 'VLB - Test')
      })
    })

    it('Click the prisoner profile and go to the stand alone photo page', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU')
      overviewPage.prisonerPhotoLink().should('exist')
      overviewPage.prisonerPhotoLink().click({ force: true })
      cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU/image')
    })

    context('Statuses', () => {
      it('Displays the status list', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.statusList().should('exist')
        overviewPage.statusList().contains('li > p', 'In Moorland (HMP & YOI)')
        overviewPage.statusList().contains('li > p', 'Support needed')
        overviewPage.statusList().contains('li > p', 'Scheduled transfer')
      })
    })

    context('Click work and skills button', () => {
      it('Displays the status list', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.statusList().should('exist')
        overviewPage.statusList().contains('li > p', 'In Moorland (HMP & YOI)')
      })
    })

    context('Actions', () => {
      it('should display Add case note link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.addCaseNoteActionLink().should('exist')
      })

      it('should display Add appointment link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.addAppointmentActionLink().should('exist')
      })

      it('should display Report use of force link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.reportUseOfForceActionLink().should('exist')
      })

      it('should not display Refer to Pathfinder link or the Pathfinder profile link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.referToPathfinderActionLink().should('not.exist')
        overviewPage.pathfinderProfileInfoLink().should('not.exist')
      })

      it('should not display Add to SOC link or the SOC profile link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.addToSocActionLink().should('not.exist')
        overviewPage.socProfileInfoLink().should('not.exist')
      })

      it('should not display Manage category link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.manageCategoryActionLink().should('not.exist')
      })
    })

    context('More Info', () => {
      it('should not display probation documents link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.probationDocumentsInfoLink().should('not.exist')
      })

      it('should not display pathfinder profile link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.pathfinderProfileInfoLink().should('not.exist')
      })
      it('should not display soc profile link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.socProfileInfoLink().should('not.exist')
      })
    })

    context('Non-association summary', () => {
      it('Displays non-association summary', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.nonAssociationSummary().prisonName().should('have.text', 'In Moorland (HMP & YOI)')
        overviewPage.nonAssociationSummary().prisonCount().should('have.text', '1')
        overviewPage.nonAssociationSummary().otherPrisonsCount().should('have.text', '1')
        overviewPage.nonAssociationSummary().nonAssociationsLink().should('have.text', 'Non-associations')
        overviewPage
          .nonAssociationSummary()
          .nonAssociationsLink()
          .should('have.attr', 'href', 'http://localhost:9091/nonassociationsui/prisoner/G6123VU/non-associations')
      })
    })
  })

  context('Given the user has RELEASE_DATES_CALCULATOR role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.ReleaseDatesCalculator],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOverviewPage()
    })

    it('should not display calculate release dates link', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.calculateReleaseDatesActionLink().should('not.exist')
    })
  })

  context('Given the user has PF_USER role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.PathfinderUser],
      })
    })

    context('Prisoner is not currently in Pathfinder', () => {
      beforeEach(() => {
        cy.setupOverviewPageStubs({ prisonerNumber: 'A1234BC', bookingId: 1234567 })
      })

      it('should not display Refer to Pathfinder link, and not the Pathfinder profile link', () => {
        const overviewPage = visitOverviewPageAlt()
        overviewPage.referToPathfinderActionLink().should('not.exist')
        overviewPage.pathfinderProfileInfoLink().should('not.exist')
      })
    })

    context('Prisoner is already in Pathfinder', () => {
      beforeEach(() => {
        cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        visitOverviewPage()
      })

      it('should display Pathfinder profile link, and not the Refer to Pathfinder link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.pathfinderProfileInfoLink().should('exist')
        overviewPage.referToPathfinderActionLink().should('not.exist')
      })
    })
  })

  context('Given the user has PF_STD_PRISON role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.PathfinderStdPrison],
      })
    })

    context('Prisoner is not currently in Pathfinder', () => {
      beforeEach(() => {
        cy.setupOverviewPageStubs({ prisonerNumber: 'A1234BC', bookingId: 1234567 })
      })

      it('should display Refer to Pathfinder link, and not the Pathfinder profile link', () => {
        const overviewPage = visitOverviewPageAlt()
        overviewPage.referToPathfinderActionLink().should('exist')
        overviewPage.pathfinderProfileInfoLink().should('not.exist')
      })
    })

    context('Prisoner is already in Pathfinder', () => {
      beforeEach(() => {
        cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        visitOverviewPage()
      })

      it('should display Pathfinder profile link, and not the Refer to Pathfinder link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.pathfinderProfileInfoLink().should('exist')
        overviewPage.referToPathfinderActionLink().should('not.exist')
      })
    })
  })

  context('Given the user has SOC_CUSTODY role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.SocCustody],
      })
    })

    context('Prisoner is not currently in SOC', () => {
      beforeEach(() => {
        cy.setupOverviewPageStubs({ prisonerNumber: 'A1234BC', bookingId: 1234567 })
      })

      it('should display Add to SOC link, and not the SOC profile link', () => {
        const overviewPage = visitOverviewPageAlt()
        overviewPage.addToSocActionLink().should('exist')
        overviewPage.socProfileInfoLink().should('not.exist')
      })
    })

    context('Prisoner is already in SOC', () => {
      beforeEach(() => {
        cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        visitOverviewPage()
      })

      it('should display SOC profile link, and not the Add to SOC link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.socProfileInfoLink().should('exist')
        overviewPage.addToSocActionLink().should('not.exist')
      })
    })
  })

  context('Given the user has CREATE_CATEGORISATION role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.CreateCategorisation],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOverviewPage()
    })

    it('should display Manage category link', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.manageCategoryActionLink().should('exist')
    })
  })

  context('Given the user has POM role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.PomUser],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOverviewPage()
    })

    it('should display Probation documents  link', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.probationDocumentsInfoLink().should('exist')
    })
  })

  context('Given the user has VIEW_PROBATION_DOCUMENTS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.ViewProbationDocuments],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOverviewPage()
    })

    it('should display Probation documents  link', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.probationDocumentsInfoLink().should('exist')
    })
  })

  context('Given the user has the KW staff role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.ViewProbationDocuments],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, staffRoles: [{ role: 'KW' }] })
      visitOverviewPage()
    })

    it('Should display the add key worker session buton', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.addKeyWorkerSessionActionLink().should('exist')
    })
  })

  context('Given the prisoner is a restricted patient', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.PomUser],
      })
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        restrictedPatient: true,
        prisonerDataOverrides: {
          supportingPrisonId: 'MDI',
        },
      })
      visitOverviewPage()
    })

    context('Actions', () => {
      it('should display Add case note link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.addCaseNoteActionLink().should('exist')
      })

      it('should not display Add appointment link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.addAppointmentActionLink().should('not.exist')
      })

      it('should not display Report use of force link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.reportUseOfForceActionLink().should('not.exist')
      })
    })
  })

  context('Given the prisoner is not on remand', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: ['ROLE_GLOBAL_SEARCH'],
      })
    })

    context('Main offence overview', () => {
      it('should display main offence and confirmed release date if there is one and hide the next court appearance', () => {
        cy.setupOverviewPageStubs({
          prisonerNumber: 'G6123VU',
          bookingId: 1102484,
          prisonerDataOverrides: { confirmedReleaseDate: '2024-02-20' },
        })
        cy.task('stubGetNextCourtEvent', { bookingId: 1102484, resp: {} })
        visitOverviewPage()
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.offencesHeader().should('exist')
        overviewPage.offenceCardContent().should('exist')
        overviewPage.mainOffence().should('exist')
        overviewPage.imprisonmentStatusLabel().should('exist')
        overviewPage.imprisonmentStatus().should('exist')
        overviewPage.viewAllOffencesLink().should('exist')
        overviewPage.overviewConfirmedReleaseLabel().should('exist')
        overviewPage.overviewConfirmedRelease().should('exist')
        overviewPage.overviewConditionalReleaseLabel().should('not.exist')
        overviewPage.overviewConditionalRelease().should('not.exist')
        overviewPage.nextAppearanceDate().should('not.exist')
        overviewPage.courtCasesAndReleaseDates().card().should('not.exist')
      })

      it('should display main offence and conditional release date if there is no confirmed release date and hide the next court appearance', () => {
        cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubGetNextCourtEvent', { bookingId: 1102484, resp: {} })
        visitOverviewPage()
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.offencesHeader().should('exist')
        overviewPage.offenceCardContent().should('exist')
        overviewPage.mainOffence().should('exist')
        overviewPage.imprisonmentStatusLabel().should('exist')
        overviewPage.imprisonmentStatus().should('exist')
        overviewPage.viewAllOffencesLink().should('exist')
        overviewPage.overviewConfirmedReleaseLabel().should('not.exist')
        overviewPage.overviewConfirmedRelease().should('not.exist')
        overviewPage.overviewConditionalReleaseLabel().should('exist')
        overviewPage.overviewConditionalRelease().should('exist')
        overviewPage.nextAppearanceDate().should('not.exist')
      })
    })
  })

  context('Given the prisoner is on remand', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: ['ROLE_GLOBAL_SEARCH'],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'ONREMAND', bookingId: 1234568 })
    })

    context('Main offence overview', () => {
      it('should display main offence and the next court appearance and display the conditional release date', () => {
        const overviewPage = visitOverviewPageOnRemand()
        overviewPage.offencesHeader().should('exist')
        overviewPage.offenceCardContent().should('exist')
        overviewPage.mainOffence().should('exist')
        overviewPage.imprisonmentStatusLabel().should('exist')
        overviewPage.imprisonmentStatus().should('exist')
        overviewPage.viewAllOffencesLink().should('exist')
        overviewPage.overviewConditionalReleaseLabel().should('not.exist')
        overviewPage.overviewConditionalRelease().should('not.exist')
        overviewPage.nextAppearanceDate().should('exist')
      })
    })
  })

  context('Given the prisoner has high complexity of needs', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        complexityLevel: ComplexityLevel.High,
      })
      visitOverviewPage()
    })

    context('Staff contacts', () => {
      it('Displays the offender staff contact details', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.staffContacts().should('exist')
        overviewPage
          .staffContacts()
          .find('[data-qa=keyworker-details]')
          .should('contain.text', 'None - high complexity of need')
      })
    })
  })

  context('Given the prisoner has low complexity of needs', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        complexityLevel: ComplexityLevel.Low,
      })
      visitOverviewPage()
    })

    context('Staff contacts', () => {
      it('Displays the offender staff contact details', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.staffContacts().should('exist')
        overviewPage.staffContacts().find('[data-qa=keyworker-details]').should('contain.text', 'Dave Stevens')
      })
    })
  })

  context('Given the prisoner is in the youth estate', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [{ caseLoadId: 'WYI', currentlyActive: true, description: '', type: '', caseloadFunction: '' }],
      })
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        prisonerDataOverrides: { prisonId: 'WYI' },
      })
      cy.task('stubGetOffenderContacts', mockContactDetailYouthEstate)
      visitOverviewPage()
    })

    context('Staff contacts', () => {
      it('Displays the offender staff contact details', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.staffContacts().should('exist')
        overviewPage.staffContacts().should('contain.text', 'CuSP Officer')
        overviewPage.staffContacts().should('contain.text', 'CuSP Officer (backup)')
        overviewPage.staffContacts().should('contain.text', 'Youth Justice Worker')
        overviewPage.staffContacts().should('contain.text', 'Resettlement Practitioner')
        overviewPage.staffContacts().should('contain.text', 'Youth Justice Services Team')
        overviewPage.staffContacts().should('contain.text', 'Youth Justice Services Case Manager')
      })
    })
  })

  context('Given API call to get learner neurodivergence fails', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      cy.task('stubGetLearnerNeurodivergence', { prisonerNumber: 'G6123VU', error: true })
      visitOverviewPage()
    })

    it('Displays a page error banner and highlights the failure in the status list', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)

      overviewPage.apiErrorBanner().should('exist')
      overviewPage.apiErrorBanner().contains('p', 'Sorry, there is a problem with the service')

      overviewPage.statusList().should('exist')
      overviewPage.statusList().contains('li > p', 'Support needs unavailable')
    })
  })

  context('Given API call to get key worker name fails', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      cy.task('stubKeyWorkerData', { prisonerNumber: 'G6123VU', error: true })
      visitOverviewPage()
    })

    it('Displays a page error banner and error message replacing the key worker details', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)

      overviewPage.apiErrorBanner().should('exist')
      overviewPage.apiErrorBanner().contains('p', 'Sorry, there is a problem with the service')

      overviewPage
        .staffContacts()
        .find('[data-qa=keyworker-details]')
        .should('contain.text', 'We cannot show these details right now. Try again later.')
    })
  })
})

context('Overview Page - Prisoner not found', () => {
  context('Given the prisoner does not exist', () => {
    context('Given the user has the GLOBAL_SEARCH role', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({
          roles: ['ROLE_GLOBAL_SEARCH'],
          caseLoads: [{ caseloadFunction: '', caseLoadId: '123', currentlyActive: true, description: '', type: '' }],
        })
        cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      })

      it('The 404 page should display', () => {
        cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/asudhsdudhid' })
        Page.verifyOnPage(NotFoundPage)
      })
    })
  })
})

context('Court cases and release dates', () => {
  context('Given the user has release dates calculator role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.ReleaseDatesCalculator],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    })

    it('should display the link with correct text', () => {
      visitOverviewPage()
      const overviewPage = Page.verifyOnPage(OverviewPage)

      overviewPage
        .courtCasesAndReleaseDates()
        .card()
        .contains('a[href="http://localhost:9091/ccrd/prisoner/G6123VU/overview"]', 'Calculate release dates')
    })

    context('data is returned from the API', () => {
      it('should display the court cases and release dates panel and not the offences panel', () => {
        visitOverviewPage()
        const overviewPage = Page.verifyOnPage(OverviewPage)

        overviewPage.offencesHeader().should('not.exist')
        overviewPage.courtCasesAndReleaseDates().courtCasesCount().should('contain.text', '5')
        overviewPage.courtCasesAndReleaseDates().nextCourtAppearance().caseReference().should('contain.text', 'ABC123')
        overviewPage
          .courtCasesAndReleaseDates()
          .nextCourtAppearance()
          .location()
          .should('contain.text', 'Test court location')
        overviewPage
          .courtCasesAndReleaseDates()
          .nextCourtAppearance()
          .hearingType()
          .should('contain.text', 'Sentencing')
        overviewPage.courtCasesAndReleaseDates().nextCourtAppearance().date().should('contain.text', '1 January 2030')
      })
    })

    context('no data is returned from the API', () => {
      it('should display the placeholder text', () => {
        cy.task('stubGetNextCourtEvent', { bookingId: 1102484, resp: {} })

        visitOverviewPage()
        const overviewPage = Page.verifyOnPage(OverviewPage)

        overviewPage.offencesHeader().should('not.exist')
        overviewPage
          .courtCasesAndReleaseDates()
          .nextCourtAppearance()
          .placeHolderText()
          .should('contain.text', 'There are no upcoming court hearings.')
      })
    })
  })

  context('Given the user has release dates calculator and adjustments maintainer role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.ReleaseDatesCalculator, Role.AdjustmentsMaintainer],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    })

    it('should display the link with correct text', () => {
      visitOverviewPage()
      const overviewPage = Page.verifyOnPage(OverviewPage)

      overviewPage
        .courtCasesAndReleaseDates()
        .card()
        .contains('a[href="http://localhost:9091/ccrd/prisoner/G6123VU/overview"]', 'Court cases and release dates')
    })
  })
})
