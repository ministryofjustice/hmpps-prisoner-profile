import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import { formatDate } from '../../../../utils/dateHelpers'
import GovSummaryItem from '../../../../interfaces/GovSummaryItem'
import {
  aValidPersonalLearningPlanActionPlan,
  aValidPersonalLearningPlanGoal,
} from '../../../../data/localMockData/personalLearningPlanActionPlan'

describe('Work and Skills Page - Goals panel tests', () => {
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

  const prisonerNumber = 'A1234BC'
  const templateParams = {
    workAndSkillsPrisonerName: 'Fred Bloggs',
    problemRetrievingPrisonerGoalData: false,
    hasVc2Goals: false,
    hasActiveLwpGoals: false,
    hasAnyLwpGoals: false,
    curiousGoals: {
      value: {
        prisonerNumber,
        employmentGoals: [] as Array<GovSummaryItem>,
        personalGoals: [] as Array<GovSummaryItem>,
        longTermGoals: [] as Array<GovSummaryItem>,
        shortTermGoals: [] as Array<GovSummaryItem>,
      },
    },
    personalLearningPlanActionPlan: aValidPersonalLearningPlanActionPlan({
      prisonerNumber,
      activeGoals: [],
      archivedGoals: [],
      completedGoals: [],
    }),
  }

  describe('Prisoner does not have VC2 goals', () => {
    // workAndSkillsPage/goals/hasNoVc2GoalsAnd/noLwpGoals.njk
    it('should render given prisoner has no VC2 goals and no LWP goals at all', () => {
      // Given
      const params = {
        ...templateParams,
        hasVc2Goals: false,
        hasActiveLwpGoals: false,
        hasAnyLwpGoals: false,
      }

      // When
      const content = njkEnv.render('index.njk', params)
      const $ = cheerio.load(content)

      // Then
      expect($('[data-qa="summary-header"]').text().trim()).toEqual('Goals')
      expect($('[data-qa="no-active-lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-goals"]').length).toEqual(1)
      expect($('[data-qa="no-goals"] .govuk-body').text().trim()).toEqual(
        'Fred Bloggs has no goals recorded in DPS or Virtual Campus (VC2).',
      )
      expect($('[data-qa="lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-active-lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="problem-retrieving-goals"]').length).toEqual(0)
    })

    // workAndSkillsPage/goals/hasNoVc2GoalsAnd/someInProgressLwpGoals.njk
    it('should render given prisoner has no VC2 goals but has some active LWP goals', () => {
      // Given
      const params = {
        ...templateParams,
        hasVc2Goals: false,
        hasActiveLwpGoals: true,
        hasAnyLwpGoals: true,
        personalLearningPlanActionPlan: aValidPersonalLearningPlanActionPlan({
          prisonerNumber,
          activeGoals: [aValidPersonalLearningPlanGoal({ status: 'ACTIVE' })],
          archivedGoals: [],
          completedGoals: [],
        }),
      }

      // When
      const content = njkEnv.render('index.njk', params)
      const $ = cheerio.load(content)

      // Then
      expect($('[data-qa="summary-header"]').text().trim()).toEqual('Goals')
      expect($('[data-qa="no-active-lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-goals"]').length).toEqual(1)
      expect($('[data-qa="lwp-goals"] a').eq(0).text().trim()).toEqual(
        'View goals in the Learning and work progress service',
      )
      expect($('[data-qa="no-active-lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="problem-retrieving-goals"]').length).toEqual(0)
    })

    // workAndSkillsPage/goals/hasNoVc2GoalsAnd/noInProgressLwpGoals.njk
    it('should render given prisoner has no VC2 goals and no active LWP goals (but does have non-active LWP goals)', () => {
      // Given
      const params = {
        ...templateParams,
        hasVc2Goals: false,
        hasActiveLwpGoals: false,
        hasAnyLwpGoals: true,
        personalLearningPlanActionPlan: aValidPersonalLearningPlanActionPlan({
          prisonerNumber,
          activeGoals: [],
          archivedGoals: [aValidPersonalLearningPlanGoal({ status: 'ARCHIVED' })],
          completedGoals: [aValidPersonalLearningPlanGoal({ status: 'COMPLETED' })],
        }),
      }

      // When
      const content = njkEnv.render('index.njk', params)
      const $ = cheerio.load(content)

      // Then
      expect($('[data-qa="summary-header"]').text().trim()).toEqual('Goals')
      expect($('[data-qa="no-active-lwp-goals"]').length).toEqual(1)
      expect($('[data-qa="no-active-lwp-goals"] .govuk-body').text().trim()).toEqual(
        'Fred Bloggs has no goals recorded in Virtual Campus (VC2) and no goals in progress recorded in DPS.',
      )
      expect($('[data-qa="no-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-active-lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="problem-retrieving-goals"]').length).toEqual(0)
    })
  })

  describe('Prisoner has VC2 goals', () => {
    // workAndSkillsPage/goals/hasVc2GoalsAnd/noLwpGoals.njk
    it('should render given prisoner has VC2 goals but has no LWP goals at all', () => {
      // Given
      const params = {
        ...templateParams,
        hasVc2Goals: true,
        hasActiveLwpGoals: false,
        hasAnyLwpGoals: false,
        curiousGoals: {
          value: {
            prisonerNumber,
            employmentGoals: [{ key: { text: 'An employment goal' }, value: { text: '' } }],
            personalGoals: [{ key: { text: 'A personal goal' }, value: { text: '' } }],
            shortTermGoals: [{ key: { text: 'A short term goal' }, value: { text: '' } }],
            longTermGoals: [{ key: { text: 'A long term goal' }, value: { text: '' } }],
          },
        },
      }

      // When
      const content = njkEnv.render('index.njk', params)
      const $ = cheerio.load(content)

      // Then
      expect($('[data-qa="summary-header"]').text().trim()).toEqual('Goals')
      expect($('[data-qa="no-active-lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-active-lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="vc2-goals"]').length).toEqual(1)
      expect($('[data-qa="lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="problem-retrieving-goals"]').length).toEqual(0)
    })

    // workAndSkillsPage/goals/hasVc2GoalsAnd/someInProgressLwpGoals.njk
    it('should render given prisoner has both VC2 goals and some active LWP goals', () => {
      // Given
      const params = {
        ...templateParams,
        hasVc2Goals: true,
        hasActiveLwpGoals: true,
        hasAnyLwpGoals: true,
        personalLearningPlanActionPlan: aValidPersonalLearningPlanActionPlan({
          prisonerNumber,
          activeGoals: [aValidPersonalLearningPlanGoal({ status: 'ACTIVE' })],
          archivedGoals: [],
          completedGoals: [],
        }),
        curiousGoals: {
          value: {
            prisonerNumber,
            employmentGoals: [{ key: { text: 'An employment goal' }, value: { text: '' } }],
            personalGoals: [{ key: { text: 'A personal goal' }, value: { text: '' } }],
            shortTermGoals: [{ key: { text: 'A short term goal' }, value: { text: '' } }],
            longTermGoals: [{ key: { text: 'A long term goal' }, value: { text: '' } }],
          },
        },
      }

      // When
      const content = njkEnv.render('index.njk', params)
      const $ = cheerio.load(content)

      // Then
      expect($('[data-qa="summary-header"]').text().trim()).toEqual('Goals')
      expect($('[data-qa="no-active-lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-active-lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-vc2-goals"]').length).toEqual(1)
      expect($('[data-qa="lwp-vc2-goals"] a').eq(0).text().trim()).toEqual(
        'View goals in the Learning and work progress service',
      )
      expect($('[data-qa="lwp-vc2-goals"] a').eq(1).text().trim()).toEqual('View previous goals from Virtual Campus')
      expect($('[data-qa="problem-retrieving-goals"]').length).toEqual(0)
    })

    // workAndSkillsPage/goals/hasVc2GoalsAnd/noInProgressLwpGoals.njk
    it('should render given prisoner has VC2 goals but has no active LWP goals (but does have non-active LWP goals)', () => {
      // Given
      const params = {
        ...templateParams,
        hasVc2Goals: true,
        hasActiveLwpGoals: false,
        hasAnyLwpGoals: true,
        curiousGoals: {
          value: {
            prisonerNumber,
            employmentGoals: [{ key: { text: 'An employment goal' }, value: { text: '' } }],
            personalGoals: [{ key: { text: 'A personal goal' }, value: { text: '' } }],
            shortTermGoals: [{ key: { text: 'A short term goal' }, value: { text: '' } }],
            longTermGoals: [{ key: { text: 'A long term goal' }, value: { text: '' } }],
          },
        },
        personalLearningPlanActionPlan: aValidPersonalLearningPlanActionPlan({
          prisonerNumber,
          activeGoals: [],
          archivedGoals: [aValidPersonalLearningPlanGoal({ status: 'ARCHIVED' })],
          completedGoals: [aValidPersonalLearningPlanGoal({ status: 'COMPLETED' })],
        }),
      }

      // When
      const content = njkEnv.render('index.njk', params)
      const $ = cheerio.load(content)

      // Then
      expect($('[data-qa="summary-header"]').text().trim()).toEqual('Goals')
      expect($('[data-qa="no-active-lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-goals"]').length).toEqual(0)
      expect($('[data-qa="no-active-lwp-vc2-goals"]').length).toEqual(1)
      expect($('[data-qa="no-active-lwp-vc2-goals"] p').eq(1).text().trim()).toEqual(
        'Fred Bloggs has no goals in progress recorded in DPS.',
      )
      expect($('[data-qa="vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="lwp-vc2-goals"]').length).toEqual(0)
      expect($('[data-qa="problem-retrieving-goals"]').length).toEqual(0)
    })
  })

  // workAndSkillsPage/goals/problemRetrievingGoals.njk
  it('should render given problem retrieving prisoner goal data', () => {
    // Given
    const params = {
      ...templateParams,
      problemRetrievingPrisonerGoalData: true,
    }

    // When
    const content = njkEnv.render('index.njk', params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa="summary-header"]').text().trim()).toEqual('Goals')
    expect($('[data-qa="no-active-lwp-goals"]').length).toEqual(0)
    expect($('[data-qa="no-goals"]').length).toEqual(0)
    expect($('[data-qa="lwp-goals"]').length).toEqual(0)
    expect($('[data-qa="no-active-lwp-vc2-goals"]').length).toEqual(0)
    expect($('[data-qa="vc2-goals"]').length).toEqual(0)
    expect($('[data-qa="lwp-vc2-goals"]').length).toEqual(0)
    expect($('[data-qa="problem-retrieving-goals"]').length).toEqual(1)
  })
})
