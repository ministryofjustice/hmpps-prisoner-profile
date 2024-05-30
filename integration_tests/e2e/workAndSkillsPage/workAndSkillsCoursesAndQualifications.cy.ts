import WorkAndSkillsPage from '../../pages/workAndSkillsPage'

import Page from '../../pages/page'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page - Courses And Qualification Card', () => {
  context('With a prisoner within the users caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
    })

    context('Default Prisoner State', () => {
      const prisonerNumber = 'G6123VU'
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber })
        cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
      })

      context('Courses and Qualifications card', () => {
        it('should display course data given prisoner has at least one course completed in the last 12 months', () => {
          // Given
          cy.task('stubGetLearnerEducation', prisonerNumber) // this stub returns several courses, only 1 of which is completed in the last 12 months (City & Guilds Wood Working)

          // When
          visitWorkAndSkillsPage()

          // Then
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_card().should('be.visible')
          workAndSkillsPage.CAQ_course_table().should('be.visible')
          workAndSkillsPage.CAQ_completed_course_names().should('contain', 'City & Guilds Wood Working')
          workAndSkillsPage.CAQ_view_all_in_prison_courses_link().should('be.visible')
        })

        it('should not display course data given prisoner has completed courses but none are completed in the last 12 months', () => {
          // Given
          cy.task('stubGetLearnerEducationForPrisonWithCoursesButNoneCompleteInTheLast12Months', prisonerNumber) // this stub returns courses that have been completed, but none in the last 12 months

          // When
          visitWorkAndSkillsPage()

          // Then
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_card().should('be.visible')
          workAndSkillsPage.CAQ_course_table().should('not.exist')
          workAndSkillsPage.CAQ_no_completed_in_prison_courses_in_last_12_months_message().should('be.visible')
          workAndSkillsPage.CAQ_view_all_in_prison_courses_link().should('be.visible')
        })

        it('should not display course data given prisoner has attended courses but none have ever been completed', () => {
          // Given
          cy.task('stubGetLearnerEducationForPrisonWithCoursesButNoneComplete', prisonerNumber) // this stub returns several courses, but none are completed

          // When
          visitWorkAndSkillsPage()

          // Then
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_card().should('be.visible')
          workAndSkillsPage.CAQ_course_table().should('not.exist')
          workAndSkillsPage.CAQ_no_completed_in_prison_courses_message().should('be.visible')
          workAndSkillsPage.CAQ_view_all_in_prison_courses_link().should('be.visible')
        })

        it('should not display course data given curious returns response containing no course or qualification data at all', () => {
          // Given
          cy.task('stubGetLearnerEducationForPrisonerWithNoCourses', prisonerNumber)

          // When
          visitWorkAndSkillsPage()

          // Then
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_card().should('be.visible')
          workAndSkillsPage.CAQ_course_table().should('not.exist')
          workAndSkillsPage.CAQ_no_in_prison_courses_message().should('be.visible')
          workAndSkillsPage.CAQ_view_all_in_prison_courses_link().should('not.exist')
        })

        it('should not display course data given curious returns 404 for prisoner indicating no course or qualification data at all', () => {
          // Given
          cy.task('stubGetLearnerEducation404Error', prisonerNumber)

          // When
          visitWorkAndSkillsPage()

          // Then
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_card().should('be.visible')
          workAndSkillsPage.CAQ_course_table().should('not.exist')
          workAndSkillsPage.CAQ_no_in_prison_courses_message().should('be.visible')
          workAndSkillsPage.CAQ_view_all_in_prison_courses_link().should('not.exist')
        })

        it('should display curious unavailable message given curious returns error response', () => {
          // Given
          cy.task('stubGetLearnerEducation401Error', prisonerNumber)

          // When
          visitWorkAndSkillsPage()

          // Then
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_card().should('be.visible')
          workAndSkillsPage.CAQ_course_table().should('not.exist')
          workAndSkillsPage.CAQ_curious_unavailable_message().should('be.visible')
          workAndSkillsPage.CAQ_view_all_in_prison_courses_link().should('not.exist')
        })
      })
    })
  })
})
