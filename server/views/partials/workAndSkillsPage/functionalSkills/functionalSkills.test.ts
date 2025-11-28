import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import { startOfDay } from 'date-fns'
import { formatDate } from '../../../../utils/dateHelpers'
import { Result } from '../../../../utils/result/result'
import filterArrayOnPropertyFilter from '../../../../utils/filterArrayOnPropertyFilter'

const njkEnv = nunjucks.configure([
  'node_modules/govuk-frontend/govuk/',
  'node_modules/govuk-frontend/govuk/components/',
  'node_modules/govuk-frontend/govuk/template/',
  'node_modules/govuk-frontend/dist/',
  'node_modules/@ministryofjustice/frontend/',
  'server/views/',
  __dirname,
])
njkEnv //
  .addFilter('formatDate', formatDate)
  .addFilter('filterArrayOnProperty', filterArrayOnPropertyFilter)

const templateParams = {
  allFunctionalSkillsLinkUrl: 'http://localhost:3000/plan/A1234BC/functional-skills',
  prisonerFunctionalSkills: Result.fulfilled({ assessments: [] }),
  prisonNamesById: { BXI: 'Brixton (HMP)', MDI: 'Moorland (HMP & YOI)' },
}
const template = 'index.njk'

describe('Work and Skills Page - Functional skills panel tests', () => {
  it('should render given prisoner has several functional skills recorded', () => {
    // Given
    const params = {
      ...templateParams,
      prisonerFunctionalSkills: Result.fulfilled({
        assessments: [
          {
            type: 'READING',
            assessmentDate: startOfDay('2025-10-02'),
            level: 'consolidating reader',
            levelBanding: null,
            nextStep: 'Reading support not required at this time.',
            referral: ['Education Specialist'],
            prisonId: 'BXI',
            source: 'CURIOUS2',
          },
          {
            type: 'DIGITAL_LITERACY',
            assessmentDate: startOfDay('2012-02-16'),
            level: 'Level 1',
            levelBanding: null,
            nextStep: null,
            referral: null,
            prisonId: 'BXI',
            source: 'CURIOUS1',
          },
          {
            type: 'DIGITAL_LITERACY',
            assessmentDate: startOfDay('2024-08-02'),
            level: 'Level 2',
            levelBanding: null,
            nextStep: null,
            referral: null,
            prisonId: 'BXI',
            source: 'CURIOUS1',
          },
          {
            type: 'ESOL',
            assessmentDate: startOfDay('2025-10-02'),
            level: 'ESOL Pathway',
            levelBanding: null,
            nextStep: 'English Language Support Level 2',
            referral: ['Healthcare'],
            prisonId: 'MDI',
            source: 'CURIOUS2',
          },
          {
            type: 'MATHS',
            assessmentDate: startOfDay('2024-08-02'),
            level: 'Level 1',
            levelBanding: null,
            nextStep: null,
            referral: null,
            prisonId: 'BXI',
            source: 'CURIOUS1',
          },
          {
            type: 'ENGLISH',
            assessmentDate: startOfDay('2024-04-18'),
            level: 'Level 1',
            levelBanding: null,
            nextStep: null,
            referral: null,
            prisonId: 'BXI',
            source: 'CURIOUS1',
          },
          {
            type: 'ENGLISH',
            assessmentDate: startOfDay('2024-09-22'),
            level: 'Level 2',
            levelBanding: null,
            nextStep: null,
            referral: null,
            prisonId: 'BXI',
            source: 'CURIOUS1',
          },
          {
            type: 'ENGLISH',
            assessmentDate: startOfDay('2025-10-22'),
            level: 'Level 2',
            levelBanding: '2.4',
            nextStep: 'Progress to course at lower level due to individual circumstances',
            referral: ['Education Specialist', 'NSM', 'Other'],
            prisonId: 'BXI',
            source: 'CURIOUS2',
          },
        ],
      }),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=functional-skills-assessment-results]').length).toEqual(1)
    // expect a DL summary list element for each functional skill type (5 in total because we only show the latest of each type)
    expect($('[data-qa=functional-skills-assessment-results] dl.govuk-summary-list').length).toEqual(5)

    const englishAssessmentResult = $('[data-qa=ENGLISH-assessment-result]')
    expect(englishAssessmentResult.length).toEqual(1)
    expect(englishAssessmentResult.find('[data-qa=assessment-type]').text().trim()).toEqual('English')
    expect(englishAssessmentResult.find('[data-qa=assessment-level]').text().trim()).toEqual('Level 2 (2.4)')
    expect(englishAssessmentResult.find('[data-qa=assessment-date]').text().trim()).toEqual('22 Oct 2025')
    expect(englishAssessmentResult.find('[data-qa=assessment-location]').text().trim()).toEqual('Brixton (HMP)')
    expect(englishAssessmentResult.find('[data-qa=assessment-next-steps]').text().trim()).toEqual(
      'Progress to course at lower level due to individual circumstances',
    )
    expect(englishAssessmentResult.find('[data-qa=assessment-referral] li').length).toEqual(3)
    expect(englishAssessmentResult.find('[data-qa=assessment-referral] li').eq(0).text().trim()).toEqual(
      'Education Specialist',
    )
    expect(englishAssessmentResult.find('[data-qa=assessment-referral] li').eq(1).text().trim()).toEqual('NSM')
    expect(englishAssessmentResult.find('[data-qa=assessment-referral] li').eq(2).text().trim()).toEqual('Other')

    const mathsAssessmentResult = $('[data-qa=MATHS-assessment-result]')
    expect(mathsAssessmentResult.length).toEqual(1)
    expect(mathsAssessmentResult.find('[data-qa=assessment-type]').text().trim()).toEqual('Maths')
    expect(mathsAssessmentResult.find('[data-qa=assessment-level]').text().trim()).toEqual('Level 1')
    expect(mathsAssessmentResult.find('[data-qa=assessment-date]').text().trim()).toEqual('2 Aug 2024')
    expect(mathsAssessmentResult.find('[data-qa=assessment-location]').text().trim()).toEqual('Brixton (HMP)')
    expect(mathsAssessmentResult.find('[data-qa=assessment-next-steps]').text().trim()).toEqual('N/A')
    expect(mathsAssessmentResult.find('[data-qa=assessment-referral]').text().trim()).toEqual('N/A')

    const digitalLiteracyAssessmentResult = $('[data-qa=DIGITAL_LITERACY-assessment-result]')
    expect(digitalLiteracyAssessmentResult.length).toEqual(1)
    expect(digitalLiteracyAssessmentResult.find('[data-qa=assessment-type]').text().trim()).toEqual('Digital skills')
    expect(digitalLiteracyAssessmentResult.find('[data-qa=assessment-level]').text().trim()).toEqual('Level 2')
    expect(digitalLiteracyAssessmentResult.find('[data-qa=assessment-date]').text().trim()).toEqual('2 Aug 2024')
    expect(digitalLiteracyAssessmentResult.find('[data-qa=assessment-location]').text().trim()).toEqual('Brixton (HMP)')
    expect(digitalLiteracyAssessmentResult.find('[data-qa=assessment-next-steps]').text().trim()).toEqual('N/A')
    expect(digitalLiteracyAssessmentResult.find('[data-qa=assessment-referral]').text().trim()).toEqual('N/A')

    const readingAssessmentResult = $('[data-qa=READING-assessment-result]')
    expect(readingAssessmentResult.length).toEqual(1)
    expect(readingAssessmentResult.find('[data-qa=assessment-type]').text().trim()).toEqual('Reading')
    expect(readingAssessmentResult.find('[data-qa=assessment-level]').text().trim()).toEqual('consolidating reader')
    expect(readingAssessmentResult.find('[data-qa=assessment-date]').text().trim()).toEqual('2 Oct 2025')
    expect(readingAssessmentResult.find('[data-qa=assessment-location]').text().trim()).toEqual('Brixton (HMP)')
    expect(readingAssessmentResult.find('[data-qa=assessment-next-steps]').text().trim()).toEqual(
      'Reading support not required at this time.',
    )
    expect(readingAssessmentResult.find('[data-qa=assessment-referral] li').length).toEqual(1)
    expect(readingAssessmentResult.find('[data-qa=assessment-referral] li').eq(0).text().trim()).toEqual(
      'Education Specialist',
    )

    const esolAssessmentResult = $('[data-qa=ESOL-assessment-result]')
    expect(esolAssessmentResult.length).toEqual(1)
    expect(esolAssessmentResult.find('[data-qa=assessment-type]').text().trim()).toEqual('ESOL')
    expect(esolAssessmentResult.find('[data-qa=assessment-level]').text().trim()).toEqual('ESOL Pathway')
    expect(esolAssessmentResult.find('[data-qa=assessment-date]').text().trim()).toEqual('2 Oct 2025')
    expect(esolAssessmentResult.find('[data-qa=assessment-location]').text().trim()).toEqual('Moorland (HMP & YOI)')
    expect(esolAssessmentResult.find('[data-qa=assessment-next-steps]').text().trim()).toEqual(
      'English Language Support Level 2',
    )
    expect(esolAssessmentResult.find('[data-qa=assessment-referral] li').length).toEqual(1)
    expect(esolAssessmentResult.find('[data-qa=assessment-referral] li').eq(0).text().trim()).toEqual('Healthcare')

    expect($('[data-qa=no-functional-skills-assessment-results-message]').length).toEqual(0)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(0)
  })

  it('should render given prisoner has no functional skills recorded', () => {
    // Given
    const params = {
      ...templateParams,
      prisonerFunctionalSkills: Result.fulfilled({ assessments: [] }),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=functional-skills-assessment-results]').length).toEqual(0)
    expect($('[data-qa=no-functional-skills-assessment-results-message]').length).toEqual(1)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(0)
  })

  it('should render given the Curious service API promise is not resolved', () => {
    // Given
    const params = {
      ...templateParams,
      prisonerFunctionalSkills: Result.rejected(new Error('Curious API call failed when getting functional skills')),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=functional-skills-assessment-results]').length).toEqual(0)
    expect($('[data-qa=no-functional-skills-assessment-results-message]').length).toEqual(0)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(1)
  })
})
