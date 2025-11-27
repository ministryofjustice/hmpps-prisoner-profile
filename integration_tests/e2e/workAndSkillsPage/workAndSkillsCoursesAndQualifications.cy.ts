import { format, startOfToday, subMonths } from 'date-fns'
import WorkAndSkillsPage from '../../pages/workAndSkillsPage'
import Page from '../../pages/page'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

const curiousV1Course = {
  prn: 'G6123VU',
  establishmentId: 'MDI',
  establishmentName: 'MOORLAND (HMP & YOI)',
  courseName: 'GCSE English',
  courseCode: '008ENGL06',
  isAccredited: false,
  aimSequenceNumber: 1,
  learningStartDate: '2021-06-01',
  learningPlannedEndDate: '2021-08-06',
  learningActualEndDate: null,
  learnersAimType: null,
  miNotionalNVQLevelV2: null,
  sectorSubjectAreaTier1: null,
  sectorSubjectAreaTier2: null,
  occupationalIndicator: null,
  accessHEIndicator: null,
  keySkillsIndicator: null,
  functionalSkillsIndicator: null,
  gceIndicator: null,
  gcsIndicator: null,
  asLevelIndicator: null,
  a2LevelIndicator: null,
  qcfIndicator: null,
  qcfDiplomaIndicator: null,
  qcfCertificateIndicator: null,
  lrsGLH: null,
  attendedGLH: null,
  actualGLH: 100,
  outcome: null,
  outcomeGrade: null,
  employmentOutcome: null,
  withdrawalReasons: null,
  prisonWithdrawalReason: null,
  completionStatus:
    'The learner is continuing or intending to continue the learning activities leading to the learning aim',
  withdrawalReasonAgreed: false,
  fundingModel: 'Adult skills',
  fundingAdjustmentPriorLearning: null,
  subcontractedPartnershipUKPRN: null,
  deliveryLocationPostCode: 'DN7 6BW',
  unitType: null,
  fundingType: 'DPS',
  deliveryMethodType: 'Pack only learning - In Cell/Room',
  alevelIndicator: null,
}

const curiousV2Course = {
  prn: 'G6123VU',
  establishmentId: 'BXI',
  establishmentName: 'BRIXTON (HMP)',
  qualificationCode: '270828',
  qualificationName: 'CIMA Strategic Level',
  learningStartDate: '2024-06-01',
  learningPlannedEndDate: '2024-06-30',
  learnerOnRemand: 'Yes',
  isAccredited: true,
  aimType: 'Programme aim',
  fundingType: 'YCS',
  deliveryApproach: '',
  deliveryLocationpostcode: 'SW2 5XF',
  completionStatus: 'Continuing',
  learningActualEndDate: null,
  outcome: null,
  outcomeGrade: null,
  outcomeDate: null,
  withdrawalReason: null,
  withdrawalReasonAgreed: null,
  withdrawalReviewed: false,
}

context('Work and skills page - Courses And Qualification Card', () => {
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
      })

      context('Courses and Qualifications card', () => {
        it('should display course data given prisoner has at least one course completed in the last 12 months', () => {
          // Given
          const completedCourseInTheLast12MonthsAgo = {
            ...curiousV2Course,
            qualificationName: 'City & Guilds Wood Working',
            outcome: 'Pass',
            completionStatus: 'Completed',
            learningActualEndDate: format(subMonths(startOfToday(), 3), 'yyyy-MM-dd'),
          }
          cy.task('stubGetLearnerQualifications', {
            prisonerNumber,
            qualifications: { v1: [curiousV1Course], v2: [completedCourseInTheLast12MonthsAgo] },
          })

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
          const completedCourseFromOver12MonthsAgo = {
            ...curiousV1Course,
            completionStatus: 'The learner has completed the learning activities leading to the learning aim',
            learningActualEndDate: '2021-12-13',
          }
          cy.task('stubGetLearnerQualifications', {
            prisonerNumber,
            qualifications: { v1: [completedCourseFromOver12MonthsAgo], v2: [] },
          })

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
          const inProgressCourse = { ...curiousV2Course, completionStatus: 'Continuing' }
          cy.task('stubGetLearnerQualifications', {
            prisonerNumber,
            qualifications: { v1: [], v2: [inProgressCourse] },
          })

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
          cy.task('stubGetLearnerQualifications', { prisonerNumber, qualifications: { v1: [], v2: [] } })

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
          cy.task('stubGetLearnerQualifications', { prisonerNumber, error: 404 })

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
          cy.task('stubGetLearnerQualifications', { prisonerNumber, error: 500 })

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
