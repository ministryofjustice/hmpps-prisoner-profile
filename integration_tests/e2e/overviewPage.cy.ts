import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'
import { Role } from '../../server/data/enums/role'
import { permissionsTests } from './permissionsTests'
import NotFoundPage from '../pages/notFoundPage'
import { calculateAge } from '../../server/utils/utils'
import { ComplexityLevel } from '../../server/data/interfaces/complexityApi/ComplexityOfNeed'
import {
  mockContactDetailStaffContacts,
  mockContactDetailYouthEstate,
} from '../../server/data/localMockData/contactDetail'
import { latestCalculationWithNomisSource } from '../../server/data/localMockData/latestCalculationMock'
import IndexPage from '../pages'

const visitOverviewPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU' })
}

const visitOverviewPageAlt = (): OverviewPage => {
  cy.signIn({ redirectPath: '/prisoner/A1234BC' })
  return Page.verifyOnPage(OverviewPage)
}

const visitOverviewPageOnRemand = (): OverviewPage => {
  cy.signIn({ redirectPath: '/prisoner/X9999XX' })
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
        cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_GLOBAL_SEARCH'] })
        cy.setupOverviewPageStubs({
          prisonerNumber: 'G6123VU',
          bookingId: 1102484,
          caseLoads: [
            {
              caseloadFunction: '',
              caseLoadId: 'ZZZ',
              currentlyActive: true,
              description: '',
              type: '',
            },
          ],
        })
      })

      it('Does not display the facial images link', () => {
        visitOverviewPage()
        cy.get('[data-qa=prisoner-photo-link]').should('not.exist')
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
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        prisonerDataOverrides: { category: 'B' },
      })
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
        overviewPage.moneyVisitsNonAssociationsGroup().should('exist')
      })

      it('Mini summary Group A should display the macro header', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.moneyVisitsNonAssociationsGroup_MacroHeader().should('exist')
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

      it('Mini summary Group A should contain Non-associations card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.nonAssociationsCard().contains('h2', 'Non-associations')
        overviewPage.nonAssociationsCard().contains('p', 'In Moorland (HMP & YOI)')
        overviewPage.nonAssociationsCard().contains('p', 'In other establishments')
        overviewPage.nonAssociationsCard().contains('p', '1')
        overviewPage
          .nonAssociationsCard()
          .contains(
            'a[href="http://localhost:9091/nonassociationsui/prisoner/G6123VU/non-associations"]',
            'Non-associations',
          )
      })
    })

    context('Mini Summary B', () => {
      it('Mini summary list is displayed', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.categoryCsraCsipGroup().should('exist')
      })

      it('Mini summary Group B should hide the macro header', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.categoryCsraCsipGroup_MacroHeader().should('not.exist')
      })

      it('Mini summary Group B should contain Category card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.categoryCard().contains('h2', 'Category')
        overviewPage.categoryCard().contains('.mini-card__item', 'B')
        overviewPage.categoryCard().contains('.mini-card__item', 'Next review: 19/02/2023')
        overviewPage.categoryCard().contains('a', 'Category')
      })

      it('Mini summary Group B should contain CSRA card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.csraCard().contains('h2', 'CSRA')
        overviewPage.csraCard().contains('.mini-card__item', 'Standard')
        overviewPage.csraCard().contains('.mini-card__item', 'Last review: 19/02/2021')
        overviewPage.csraCard().contains('a', 'CSRA history')
      })

      it('Mini summary Group B should contain CSIP card with correct data', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.csipCard().contains('h2', 'CSIP')
        overviewPage.csipCard().contains('.mini-card__item', 'Status: CSIP open')
        overviewPage.csipCard().contains('.mini-card__item', 'Next review date: 01/01/2099')
        overviewPage.csipCard().contains('.mini-card__item', 'History: 1 CSIP (1 referral)')
        overviewPage.csipCard().contains('a', 'CSIP details')
      })
    })

    it('Should hide the change location link', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      // The link text label is change location but the functionality is change caseload
      overviewPage.headerChangeLocation().should('not.exist')
    })

    context('Personal details', () => {
      it('Displays the prisoner personal details', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
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

    context('Adjudications', () => {
      it('Displays the adjudications summary', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.adjudicationsSummary().contains('h2', 'Adjudications')
        overviewPage.adjudicationsSummary().contains('p', 'Proven in last 3 months')
        overviewPage.adjudicationsSummary().contains('p', '4')
        overviewPage.adjudicationsSummary().contains('p', 'Active')
        overviewPage.adjudicationsSummary().contains('p', 'No active punishments')
        overviewPage
          .adjudicationsSummary()
          .contains(
            'a[href="http://localhost:3000/adjudications/adjudication-history/G6123VU"]',
            'Adjudication history',
          )
      })
    })

    context('External contacts', () => {
      it('Displays the external contacts summary', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.externalContacts().card().should('exist')
        overviewPage.externalContacts().officialHeading().should('have.text', 'Official')
        overviewPage.externalContacts().official().should('have.text', '2')
        overviewPage.externalContacts().socialHeading().should('have.text', 'Social')
        overviewPage.externalContacts().social().should('have.text', '1')
        overviewPage
          .externalContacts()
          .link()
          .contains(
            'a[href="http://localhost:9091/contacts/prisoner/G6123VU/contacts/list"]',
            'Social and official contacts',
          )
      })
    })

    context('Incentives', () => {
      it('Displays the incentives summary', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.incentivesCard().contains('h2', 'Incentives')
        overviewPage.incentivesCard().contains('p', 'Since last review')
        overviewPage.incentivesCard().contains('.mini-card__item', 'Positive behaviours: 1')
        overviewPage.incentivesCard().contains('.mini-card__item', 'Negative behaviours: 1')
        overviewPage.incentivesCard().contains('.mini-card__item', 'Next review by: 01/01/2024')
        overviewPage
          .incentivesCard()
          .contains('a[href="http://localhost:3001/incentive-reviews/prisoner/G6123VU"]', 'Incentive level details')
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

      it('should not display Manage activity allocations link', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.manageActivityAllocationsActionLink().should('not.exist')
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
  })

  context('Given the user has RELEASE_DATES_CALCULATOR role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.ReleaseDatesCalculator] })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOverviewPage()
    })

    it('should not display calculate release dates link', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.calculateReleaseDatesActionLink().should('not.exist')
    })
  })

  context('Given the user has PF_LOCAL_READER role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PathfinderLocalReader] })
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
  })

  context('Given the user has PF_USER role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PathfinderUser] })
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

  context('Given the user has PF_STD_PRISON role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PathfinderStdPrison] })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.SocCustody] })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.CreateCategorisation] })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PomUser] })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.ViewProbationDocuments] })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.ViewProbationDocuments] })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, isAKeyWorker: true })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PomUser] })
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
      cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_GLOBAL_SEARCH'] })
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
      cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_GLOBAL_SEARCH'] })
      cy.setupOverviewPageStubs({ prisonerNumber: 'X9999XX', bookingId: 1234568 })
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
      cy.task('stubGetOffenderContacts', mockContactDetailStaffContacts)
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
        overviewPage.resettlementWorkerName().should('contain.text', 'Ivan Smirnov')
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
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        prisonerDataOverrides: { prisonId: 'WYI' },
        caseLoads: [
          {
            caseloadFunction: '',
            caseLoadId: 'WYI',
            currentlyActive: true,
            description: '',
            type: '',
          },
        ],
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
        overviewPage.staffContacts().should('contain.text', 'Youth Justice Service')
        overviewPage.staffContacts().should('contain.text', 'Youth Justice Service Case Manager')
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

  context('Given API call to get non-associations fails', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      cy.task('stubNonAssociationsError', 'G6123VU')
      visitOverviewPage()
    })

    it('Displays a page error banner and highlights the failure in the status list', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)

      overviewPage.apiErrorBanner().should('exist')
      overviewPage.apiErrorBanner().contains('p', 'Sorry, there is a problem with the service')

      overviewPage
        .nonAssociationsCard()
        .should('contain.text', 'We cannot show these details right now. Try again later.')
      overviewPage.nonAssociationsCard().contains('a', 'Non-associations')
    })
  })

  context('Given API call to get POMs fails', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      cy.task('stubPomDataError', 'G6123VU')
      visitOverviewPage()
    })

    it('Displays a page error banner and highlights the failure in the card', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)

      overviewPage.apiErrorBanner().should('exist')
      overviewPage.apiErrorBanner().contains('p', 'Sorry, there is a problem with the service')

      overviewPage.primaryPomName().should('contain.text', 'We cannot show these details right now. Try again later.')
      overviewPage.secondaryPomName().should('contain.text', 'We cannot show these details right now. Try again later.')
    })
  })

  context('Given API call to get external contacts count fails', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      cy.task('stubPersonalRelationshipsCountError', { prisonerNumber: 'G6123VU' })
      visitOverviewPage()
    })

    it('Displays a page error banner and highlights the failure in the card', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)

      overviewPage.apiErrorBanner().should('exist')
      overviewPage.apiErrorBanner().contains('p', 'Sorry, there is a problem with the service')

      overviewPage
        .externalContacts()
        .card()
        .should('contain.text', 'We cannot show these details right now. Try again later.')
    })
  })

  context('Given API call to get latest release calculation fails', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.PrisonUser, Role.ReleaseDatesCalculator],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      cy.task('stubGetLatestCalculation', {
        status: 500,
        resp: {
          errorCode: 'VC5001',
          errorMessage: 'Service unavailable',
          httpStatusCode: 500,
        },
      })
      visitOverviewPage()
    })

    it('Displays a page error banner and highlights the failure in the card', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      const nextCourtAppearance = overviewPage.courtCasesAndReleaseDates().nextCourtAppearance()
      const latestCalculation = overviewPage.courtCasesAndReleaseDates().latestCalculation()

      overviewPage.offencesHeader().should('not.exist')
      nextCourtAppearance.location().should('contain.text', 'Test court location')
      latestCalculation
        .placeHolderText()
        .should('contain.text', 'We cannot show these details right now. Try again later.')
    })
  })

  context('Given external contacts is not yet enabled in the prison', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupOverviewPageStubs({
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
        prisonerDataOverrides: { prisonId: 'WYI' },
        caseLoads: [
          {
            caseloadFunction: '',
            caseLoadId: 'WYI',
            currentlyActive: true,
            description: '',
            type: '',
          },
        ],
      })
      visitOverviewPage()
    })

    it('Does not display the external contacts summary', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.externalContacts().card().should('not.exist')
    })
  })
})

context('Overview Page - Prisoner not found', () => {
  context('Given the prisoner does not exist', () => {
    context('Given the user has the GLOBAL_SEARCH role', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_GLOBAL_SEARCH'] })
        cy.setupOverviewPageStubs({
          prisonerNumber: 'G6123VU',
          bookingId: 1102484,
          caseLoads: [
            {
              caseloadFunction: '',
              caseLoadId: 'ZZZ',
              currentlyActive: true,
              description: '',
              type: '',
            },
          ],
        })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.ReleaseDatesCalculator] })
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
        const nextCourtAppearance = overviewPage.courtCasesAndReleaseDates().nextCourtAppearance()
        const latestCalculation = overviewPage.courtCasesAndReleaseDates().latestCalculation()

        overviewPage.offencesHeader().should('not.exist')
        overviewPage.courtCasesAndReleaseDates().courtCasesCount().should('contain.text', '5')

        nextCourtAppearance.caseReference().should('contain.text', 'ABC123')
        nextCourtAppearance.location().should('contain.text', 'Test court location')
        nextCourtAppearance.hearingType().should('contain.text', 'Sentencing')
        nextCourtAppearance.date().should('contain.text', '1 January 2030')

        latestCalculation.dateOfCalculation().should('contain.text', '7 March 2024')
        latestCalculation.establishment().should('contain.text', 'Kirkham (HMP)')
        latestCalculation.reason().should('contain.text', 'Correcting an earlier sentence')
      })

      context('given the source of the latest calculation is Nomis', () => {
        it('should not display an establishment', () => {
          cy.task('stubGetLatestCalculation', { resp: latestCalculationWithNomisSource })

          visitOverviewPage()
          const overviewPage = Page.verifyOnPage(OverviewPage)
          const latestCalculation = overviewPage.courtCasesAndReleaseDates().latestCalculation()

          latestCalculation.dateOfCalculation().should('contain.text', '7 March 2024')
          latestCalculation.establishment().should('contain.text', 'Not entered')
          latestCalculation.reason().should('contain.text', 'Correcting an earlier sentence')
        })
      })
    })

    context('no data is returned from the API', () => {
      it('should display the placeholder text', () => {
        cy.task('stubGetNextCourtEvent', { bookingId: 1102484, resp: {} })
        cy.task('stubGetLatestCalculation', { status: 404, resp: null })

        visitOverviewPage()
        const overviewPage = Page.verifyOnPage(OverviewPage)
        const nextCourtAppearance = overviewPage.courtCasesAndReleaseDates().nextCourtAppearance()
        const latestCalculation = overviewPage.courtCasesAndReleaseDates().latestCalculation()

        overviewPage.offencesHeader().should('not.exist')
        nextCourtAppearance.placeHolderText().should('contain.text', 'There are no upcoming court hearings.')
        latestCalculation
          .placeHolderText()
          .should('contain.text', 'There are no release dates calculated for John Saunders')
      })
    })
  })

  context('Given the user has release dates calculator and adjustments maintainer role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.ReleaseDatesCalculator, Role.AdjustmentsMaintainer] })
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

  context('Given feedback banner is published in contentful', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.task('stubBanner')
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOverviewPage()
    })

    it('Displays the feedback banner', () => {
      const indexPage = new IndexPage()
      indexPage.banner().should('contain.text', 'Banner')
    })
  })
})
