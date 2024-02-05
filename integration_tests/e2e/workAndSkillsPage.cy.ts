import WorkAndSkillsPage from '../pages/workAndSkillsPage'

import Page from '../pages/page'
import { permissionsTests } from './permissionsTests'
import NotFoundPage from '../pages/notFoundPage'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page', () => {
  context('Permissions', () => {
    const prisonerNumber = 'G6123VU'
    const visitPage = prisonerDataOverrides => {
      cy.setupBannerStubs({ prisonerNumber, prisonerDataOverrides })
      cy.setupWorkAndSkillsPageStubs({ prisonerNumber, emptyStates: false })
      visitWorkAndSkillsPage({ failOnStatusCode: false })
    }

    permissionsTests({ prisonerNumber, pageToDisplay: WorkAndSkillsPage, visitPage })
  })

  context('With a prisoner outside the users caseload', () => {
    beforeEach(() => {
      const prisonerNumber = 'G6123VU'
      cy.task('reset')
      cy.setupUserAuth({
        roles: ['ROLE_GLOBAL_SEARCH'],
        caseLoads: [{ caseloadFunction: '', caseLoadId: '123', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupBannerStubs({ prisonerNumber })
      cy.setupWorkAndSkillsPageStubs({ prisonerNumber, emptyStates: false })
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
    })

    context('Default Prisoner State', () => {
      const prisonerNumber = 'G6123VU'
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber })
        cy.setupWorkAndSkillsPageStubs({ prisonerNumber, emptyStates: false })
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

      context('Courses and Qualifications card', () => {
        it('The card is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_card().should('exist')
        })
        it('The card summary header contains Courses and qualifications', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_header().contains('Courses and qualifications')
        })

        it('The card contains information about the card', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage
            .CAQ_info()
            .contains('This only includes educational courses. Contact the local education team to find out more.')
        })

        it('The card has a heading containing Current courses', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_courses().contains('Current courses')
        })

        it('The card has a list key should contain "string"', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_listKey().contains('string')
        })

        it('The card has a list value should contain end date 1 March 2023', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_listValue().contains('Planned end date on 1 March 2023')
        })

        it('The card has a CTA link', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_viewHistory().contains('View full course history')
        })
      })

      context('Work and activities card', () => {
        it('The card has a list key that should contain Braille am', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.workAndActivities().currentActivities(0).activity().contains('Braille am')
        })

        it('Displays the number of absenses in the last 30 days', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.workAndActivities().unacceptableAbsenceLastMonth().contains('0')
        })

        it('The card contains the text John Saunders has no....', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage
            .workAndActivities()
            .unacceptableAbsenceLast6Months()
            .contains('John Saunders has no unacceptable absences in the last 6 months.')
        })
      })

      context('Employability skills card', () => {
        it('The card is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.ES_card().should('exist')
        })
        it('The card summary header should display', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.ES_header().should('exist')
          workAndSkillsPage.ES_header().contains('Employability skills')
          workAndSkillsPage.ES_heading().contains('Most recent levels')
          workAndSkillsPage.ES_info().should('exist')
          workAndSkillsPage.ES_skillOne().contains('string')
          workAndSkillsPage.ES_skillLevelOne().contains('string')
        })
      })

      context('Goals card', () => {
        it('The card is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.GoalsCard().should('exist')
        })
        it('The card details should display', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.GoalsHeader().should('exist')
          workAndSkillsPage.GoalsHeader().contains('Goals')

          workAndSkillsPage.GoalsInfo().should('exist')
          workAndSkillsPage
            .GoalsInfo()
            .contains(
              'The prisoner education team set these goals using Virtual Campus. They do not include sentence plan targets. Contact the local education team to find out more.',
            )

          workAndSkillsPage.GoalsEmploymentLabel().should('exist')
          workAndSkillsPage.GoalsEmploymentLabel().contains('Employment goals')

          workAndSkillsPage.GoalsEmploymentText().should('exist')
          workAndSkillsPage.GoalsEmploymentText().contains('An employment goal')

          workAndSkillsPage.GoalsPersonalLabel().should('exist')
          workAndSkillsPage.GoalsPersonalLabel().contains('Personal goals')

          workAndSkillsPage.GoalsPersonalText().should('exist')
          workAndSkillsPage.GoalsPersonalText().contains('A personal goal')

          workAndSkillsPage.GoalsShortTermLabel().should('exist')
          workAndSkillsPage.GoalsShortTermLabel().contains('Short-term goals')

          workAndSkillsPage.GoalsShortTermText().should('exist')
          workAndSkillsPage.GoalsShortTermText().contains('A short term goal')

          workAndSkillsPage.GoalsLongTermLabel().should('exist')
          workAndSkillsPage.GoalsLongTermLabel().contains('Long-term goals')

          workAndSkillsPage.GoalsLongTermText().should('exist')
          workAndSkillsPage.GoalsLongTermText().contains('A long term goal')
        })
      })

      context('Functional skills level card', () => {
        it('The card is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.FSL_card().should('exist')
        })
        it('The card details should display', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.FSL_header().should('exist')
          workAndSkillsPage.FSL_header().contains('Functional skills level')

          workAndSkillsPage.FSL_listKey().should('exist')
          workAndSkillsPage.FSL_listKey().contains('English')

          workAndSkillsPage.FSL_listValue().should('exist')
          workAndSkillsPage.FSL_listValue().contains('string')

          workAndSkillsPage.FSL_listKey2().should('exist')
          workAndSkillsPage.FSL_listKey2().contains('Assessment date')

          workAndSkillsPage.FSL_listValue2().should('exist')
          workAndSkillsPage.FSL_listValue2().contains('1 March 2023')

          workAndSkillsPage.FSL_listKey3().should('exist')
          workAndSkillsPage.FSL_listKey3().contains('Assessment location')

          workAndSkillsPage.FSL_listValue3().should('exist')
          workAndSkillsPage.FSL_listValue3().contains('string')

          workAndSkillsPage.FSL_listKey4().should('exist')
          workAndSkillsPage.FSL_listKey4().contains('Maths')

          workAndSkillsPage.FSL_listValue4().should('exist')
          workAndSkillsPage.FSL_listValue4().contains('string')

          workAndSkillsPage.FSL_listKey5().should('exist')
          workAndSkillsPage.FSL_listKey5().contains('Assessment date')

          workAndSkillsPage.FSL_listValue5().should('exist')
          workAndSkillsPage.FSL_listValue5().contains('1 March 2023')

          workAndSkillsPage.FSL_listKey6().should('exist')
          workAndSkillsPage.FSL_listKey6().contains('Assessment location')

          workAndSkillsPage.FSL_listValue6().should('exist')
          workAndSkillsPage.FSL_listValue6().contains('string')
        })
      })
    })

    context('Activity empty state', () => {
      const prisonerNumber = 'G6123VU'
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber })
        cy.setupWorkAndSkillsPageStubs({ prisonerNumber, emptyStates: true })
        visitWorkAndSkillsPage()
      })

      context('Empty Work and activities card', () => {
        it('The card shows an empty state message', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.workAndActivities().emptyMessage().contains('John Saunders has no work or activities.')
        })
      })
    })

    context('Learner goals empty states', () => {
      const prisonerNumber = 'G6123VU'
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber })
        cy.setupWorkAndSkillsPageStubs({ prisonerNumber, emptyStates: true })
        visitWorkAndSkillsPage()
      })

      context('Goals card', () => {
        it('Work and skills page is displayed', () => {
          cy.request('/prisoner/G6123VU/work-and-skills').its('body').should('contain', 'Work and skills')
        })
        it('The card is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.GoalsCard().should('exist')
        })
        it('The card details should display', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.GoalsHeader().should('exist')
          workAndSkillsPage.GoalsHeader().contains('Goals')

          workAndSkillsPage.GoalsInfo().should('exist')
          workAndSkillsPage
            .GoalsInfo()
            .contains(
              'The prisoner education team set these goals using Virtual Campus. They do not include sentence plan targets. Contact the local education team to find out more.',
            )

          workAndSkillsPage.GoalsEmploymentLabel().should('exist')
          workAndSkillsPage.GoalsEmploymentLabel().contains('Employment goals')

          workAndSkillsPage.GoalsEmploymentText().should('exist')
          workAndSkillsPage.GoalsEmploymentText().contains('The prisoner does not have any employment goals.')

          workAndSkillsPage.GoalsPersonalLabel().should('exist')
          workAndSkillsPage.GoalsPersonalLabel().contains('Personal goals')

          workAndSkillsPage.GoalsPersonalText().should('exist')
          workAndSkillsPage.GoalsPersonalText().contains('The prisoner does not have any personal goals.')

          workAndSkillsPage.GoalsShortTermLabel().should('exist')
          workAndSkillsPage.GoalsShortTermLabel().contains('Short-term goals')

          workAndSkillsPage.GoalsShortTermText().should('exist')
          workAndSkillsPage.GoalsShortTermText().contains('The prisoner does not have any short-term goals.')

          workAndSkillsPage.GoalsLongTermLabel().should('exist')
          workAndSkillsPage.GoalsLongTermLabel().contains('Long-term goals')

          workAndSkillsPage.GoalsLongTermText().should('exist')
          workAndSkillsPage.GoalsLongTermText().contains('The prisoner does not have any long term goals.')
        })
      })
    })
  })
})
