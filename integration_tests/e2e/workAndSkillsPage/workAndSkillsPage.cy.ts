import WorkAndSkillsPage from '../../pages/workAndSkillsPage'

import Page from '../../pages/page'
import { permissionsTests } from '../permissionsTests'
import NotFoundPage from '../../pages/notFoundPage'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page', () => {
  context('Permissions', () => {
    const prisonerNumber = 'G6123VU'
    const visitPage = prisonerDataOverrides => {
      cy.setupBannerStubs({ prisonerNumber, prisonerDataOverrides })
      cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
      visitWorkAndSkillsPage({ failOnStatusCode: false })
    }

    permissionsTests({ prisonerNumber, pageToDisplay: WorkAndSkillsPage, visitPage })
  })

  context('With a prisoner outside the users caseload', () => {
    beforeEach(() => {
      const prisonerNumber = 'G6123VU'
      cy.task('reset')
      cy.setupUserAuth({ roles: ['ROLE_GLOBAL_SEARCH'] })
      cy.setupComponentsData({
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
      cy.setupBannerStubs({ prisonerNumber })
      cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
    })

    it('Doesnt dislpay the link to the 7 day schedule', () => {
      visitWorkAndSkillsPage()
      cy.getDataQa('hidden-7-day-schedule').should('exist')
    })
  })

  context('With a prisoner within the users caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
    })

    context('Default Prisoner State', () => {
      const prisonerNumber = 'G6123VU'
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber })
        cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
        visitWorkAndSkillsPage()
      })

      it('Work and skills page is displayed', () => {
        cy.request('/prisoner/G6123VU/work-and-skills').its('body').should('contain', 'Work and skills')
      })

      it('should contain elements with CSS classes linked to Google Analytics', () => {
        cy.get('.info__links').should('exist')
        cy.get('.hmpps-profile-tab-links').should('exist')
        cy.get('.hmpps-sidebar').should('exist')
      })

      it('Displays the Work and skills tab as active', () => {
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.activeTab().should('contain', 'Work and skills')
      })

      context('404 page', () => {
        it('Photo page should go to 404 not found page', () => {
          cy.visit(`/prisoner/asudhsdudhid/work-and-skills`, { failOnStatusCode: false })
          Page.verifyOnPage(NotFoundPage)
        })
      })

      context('Sidebar', () => {
        it('Sidebar is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.sidebar().should('exist')
          workAndSkillsPage.sidebar().contains('a', 'Courses and qualifications')
          workAndSkillsPage.sidebar().contains('a', 'Work and activities')
          workAndSkillsPage.sidebar().contains('a', 'Employability skills')
          workAndSkillsPage.sidebar().contains('a', 'Goals')
          workAndSkillsPage.sidebar().contains('a', 'Functional skills level')
        })
      })

      context('Main', () => {
        it('Main block is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.main().should('exist')
        })
      })
    })
  })
})
