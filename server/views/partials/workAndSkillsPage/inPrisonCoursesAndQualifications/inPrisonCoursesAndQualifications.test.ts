import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import { startOfToday, subDays } from 'date-fns'
import { formatDate } from '../../../../utils/dateHelpers'
import { Result } from '../../../../utils/result/result'
import {
  aValidEnglishInPrisonCourse,
  aValidEnglishInPrisonCourseCompletedWithinLast12Months,
  aValidMathsInPrisonCourse,
  aValidWoodWorkingInPrisonCourse,
} from '../../../../data/localMockData/inPrisonCourse'

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

const templateParams = {
  workAndSkillsPrisonerName: 'Ifereeca Peigh',
  fullCourseHistoryLinkUrl: 'http://localhost:3000/plan/A1234BC/in-prison-courses-and-qualifications',
  inPrisonCourses: Result.fulfilled({
    totalRecords: 0,
    coursesByStatus: { COMPLETED: [], IN_PROGRESS: [], WITHDRAWN: [], TEMPORARILY_WITHDRAWN: [] },
    coursesCompletedInLast12Months: [],
    hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
    hasWithdrawnOrInProgressCourses: jest.fn(),
  }),
  prisonNamesById: { MDI: 'Moorland (HMP & YOI)' },
}
const template = 'index.njk'

describe('Work and Skills Page - In prison courses and qualifications panel tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should render given prisoner courses or qualifications completed in the last 12 months', () => {
    // Given
    const courseCompletionDate = subDays(startOfToday(), 10)
    const expectedCourseCompletionDate = formatDate(courseCompletionDate.toISOString(), 'medium')
    const courseCompletedInLast12Months = {
      ...aValidEnglishInPrisonCourseCompletedWithinLast12Months(),
      courseCompletionDate,
      isAccredited: false,
      prisonId: 'MDI',
      courseName: 'English',
      grade: 'Achieved at Level 2',
    }
    const params = {
      ...templateParams,
      inPrisonCourses: Result.fulfilled({
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [courseCompletedInLast12Months, aValidMathsInPrisonCourse()],
          IN_PROGRESS: [],
          WITHDRAWN: [aValidWoodWorkingInPrisonCourse()],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [courseCompletedInLast12Months],
        hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
        hasWithdrawnOrInProgressCourses: jest.fn(),
      }),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=no-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-in-last-12-months-message]').length).toEqual(0)
    const completedCoursesInLast12MonthsTable = $('#completed-in-prison-courses-in-last-12-months-table')
    expect(completedCoursesInLast12MonthsTable.length).toEqual(1)
    expect(completedCoursesInLast12MonthsTable.find('tbody tr').length).toEqual(1)
    expect(completedCoursesInLast12MonthsTable.find('tbody tr td').eq(0).text().trim()).toEqual('English')
    expect(completedCoursesInLast12MonthsTable.find('tbody tr td').eq(1).text().trim()).toEqual('Non-accredited')
    expect(completedCoursesInLast12MonthsTable.find('tbody tr td').eq(2).text().trim()).toEqual('Moorland (HMP & YOI)')
    expect(completedCoursesInLast12MonthsTable.find('tbody tr td').eq(3).text().trim()).toEqual(
      expectedCourseCompletionDate,
    )
    expect(completedCoursesInLast12MonthsTable.find('tbody tr td').eq(4).text().trim()).toEqual('Achieved at Level 2')
    expect($('[data-qa=link-to-view-all-in-prison-courses]').length).toEqual(1)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(0)
  })

  it('should render given given prison name lookup does not resolve prisons', () => {
    // Given
    const courseCompletedInLast12Months = {
      ...aValidEnglishInPrisonCourseCompletedWithinLast12Months(),
      prisonId: 'MDI',
    }
    const params = {
      ...templateParams,
      prisonNamesById: {},
      inPrisonCourses: Result.fulfilled({
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [courseCompletedInLast12Months, aValidMathsInPrisonCourse()],
          IN_PROGRESS: [],
          WITHDRAWN: [aValidWoodWorkingInPrisonCourse()],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [courseCompletedInLast12Months],
        hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
        hasWithdrawnOrInProgressCourses: jest.fn(),
      }),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=no-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-in-last-12-months-message]').length).toEqual(0)
    const completedCoursesInLast12MonthsTable = $('#completed-in-prison-courses-in-last-12-months-table')
    expect(completedCoursesInLast12MonthsTable.length).toEqual(1)
    expect(completedCoursesInLast12MonthsTable.find('tbody tr').length).toEqual(1)
    expect(completedCoursesInLast12MonthsTable.find('tbody tr td').eq(2).text().trim()).toEqual('MDI')
    expect($('[data-qa=link-to-view-all-in-prison-courses]').length).toEqual(1)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(0)
  })

  it('should render given prisoner has no courses or qualifications at all', () => {
    // Given
    const params = {
      ...templateParams,
      inPrisonCourses: Result.fulfilled({
        totalRecords: 0,
        coursesByStatus: { COMPLETED: [], IN_PROGRESS: [], WITHDRAWN: [], TEMPORARILY_WITHDRAWN: [] },
        coursesCompletedInLast12Months: [],
        hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
        hasWithdrawnOrInProgressCourses: jest.fn(),
      }),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=no-in-prison-courses-message]').length).toEqual(1)
    expect($('[data-qa=no-completed-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-in-last-12-months-message]').length).toEqual(0)
    expect($('#completed-in-prison-courses-in-last-12-months-table').length).toEqual(0)
    expect($('[data-qa=link-to-view-all-in-prison-courses]').length).toEqual(0)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(0)
  })

  it('should render given prisoner has no completed courses or qualifications in any time frame', () => {
    // Given
    const params = {
      ...templateParams,
      inPrisonCourses: Result.fulfilled({
        totalRecords: 1,
        coursesByStatus: {
          COMPLETED: [],
          IN_PROGRESS: [aValidEnglishInPrisonCourse()],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
        hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
        hasWithdrawnOrInProgressCourses: jest.fn(),
      }),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=no-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-message]').length).toEqual(1)
    expect($('[data-qa=no-completed-in-prison-courses-in-last-12-months-message]').length).toEqual(0)
    expect($('#completed-in-prison-courses-in-last-12-months-table').length).toEqual(0)
    expect($('[data-qa=link-to-view-all-in-prison-courses]').length).toEqual(1)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(0)
  })

  it('should render given prisoner has no completed courses or qualifications in the last 12 months', () => {
    // Given
    const params = {
      ...templateParams,
      inPrisonCourses: Result.fulfilled({
        totalRecords: 1,
        coursesByStatus: {
          COMPLETED: [aValidEnglishInPrisonCourse()],
          IN_PROGRESS: [],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
        hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
        hasWithdrawnOrInProgressCourses: jest.fn(),
      }),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=no-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-in-last-12-months-message]').length).toEqual(1)
    expect($('#completed-in-prison-courses-in-last-12-months-table').length).toEqual(0)
    expect($('[data-qa=link-to-view-all-in-prison-courses]').length).toEqual(1)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(0)
  })

  it('should render given the Curious service API promise is not resolved', () => {
    // Given
    const params = {
      ...templateParams,
      inPrisonCourses: Result.rejected(new Error('Curious API call failed when getting in prison courses')),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=no-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-message]').length).toEqual(0)
    expect($('[data-qa=no-completed-in-prison-courses-in-last-12-months-message]').length).toEqual(0)
    expect($('#completed-in-prison-courses-in-last-12-months-table').length).toEqual(0)
    expect($('[data-qa=link-to-view-all-in-prison-courses]').length).toEqual(0)
    expect($('[data-qa=curious-unavailable-message]').length).toEqual(1)
  })
})
