import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'
import { Role } from '../../server/data/enums/role'
import { permissionsTests } from './permissionsTests'
import NotFoundPage from '../pages/notFoundPage'

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

      it('Does not display the non-associations', () => {
        visitOverviewPage()
        cy.getDataQa('hidden-overview-non-associations').should('exist')
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
        overviewPage.adjudicationsCard().contains('a', 'Adjudications history')
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
        overviewPage.categoryCard().contains('a', 'View category')
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

    context('Non-associations', () => {
      it('Displays the non associations on the page', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.nonAssociations().table().should('exist')
        overviewPage.nonAssociations().rows().should('have.length', 3)
        overviewPage.nonAssociations().row(1).prisonerName().should('have.text', 'John Doe')
        overviewPage.nonAssociations().row(1).prisonerName().should('have.attr', 'href', '/prisoner/ABC123')
        overviewPage.nonAssociations().row(1).prisonNumber().should('have.text', 'ABC123')
        overviewPage.nonAssociations().row(1).location().should('have.text', 'NMI-RECP')
        overviewPage.nonAssociations().row(1).reciprocalReason().should('have.text', 'Victim')
        overviewPage.nonAssociations().row(2).prisonerName().should('have.text', 'Guy Incognito')
        overviewPage.nonAssociations().row(2).prisonerName().should('have.attr', 'href', '/prisoner/DEF321')
        overviewPage.nonAssociations().row(2).prisonNumber().should('have.text', 'DEF321')
        overviewPage.nonAssociations().row(2).location().should('have.text', 'NMI-RECP')
        overviewPage.nonAssociations().row(2).reciprocalReason().should('have.text', 'Rival Gang')
      })
    })

    context('Personal details', () => {
      it('Displays the prisoner presonal details', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.personalDetails().should('exist')
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

    context('Staff contacts', () => {
      it('Displays the offender staff contact details', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.staffContacts().should('exist')
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

    context('Alerts summary', () => {
      it('Displays alerts summary', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.alertsSummary().panel().should('exist')
        overviewPage.alertsSummary().alertCount().should('have.text', '80')
        overviewPage.alertsSummary().nonAssociationCount().should('have.text', '2')
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

    it('should display calculate release dates link', () => {
      const overviewPage = Page.verifyOnPage(OverviewPage)
      overviewPage.calculateReleaseDatesActionLink().should('exist')
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
        roles: [Role.PrisonUser],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, restrictedPatient: true })
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
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitOverviewPage()
    })

    context('Main offence overview', () => {
      it('should display main offence and conditional release date and hide the next court appearance', () => {
        const overviewPage = Page.verifyOnPage(OverviewPage)
        overviewPage.offencesHeader().should('exist')
        overviewPage.offenceCardContent().should('exist')
        overviewPage.mainOffence().should('exist')
        overviewPage.imprisonmentStatusLabel().should('exist')
        overviewPage.imprisonmentStatus().should('exist')
        overviewPage.viewAllOffencesLink().should('exist')
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
      it('should display main offence and the next court appearance and hide the conditional release date', () => {
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

  context('Given the prisoner is on remand', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: ['ROLE_GLOBAL_SEARCH'],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'ONREMAND', bookingId: 1234568 })
    })

    context('Main offence overview', () => {
      it('should display main offence and the next court appearance and hide the conditional release date', () => {
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
