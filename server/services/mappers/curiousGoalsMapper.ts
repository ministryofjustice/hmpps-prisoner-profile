import type { GovukSummaryListRow } from '../../interfaces/govukComponents'
import type CuriousGoals from '../interfaces/workAndSkillsPageService/CuriousGoals'
import type LearnerGoals from '../../data/interfaces/curiousApi/LearnerGoals'

/**
 * Simple mapper function to map from the Curious API type [LearnerGoals]
 * into the view model type [CuriousGoals]
 */
const toCuriousGoals = (learnerGoals: LearnerGoals): CuriousGoals => ({
  prisonerNumber: learnerGoals.prn,
  employmentGoals: learnerGoals.employmentGoals.map(toRow),
  personalGoals: learnerGoals.personalGoals.map(toRow),
  shortTermGoals: learnerGoals.shortTermGoals.map(toRow),
  longTermGoals: learnerGoals.longTermGoals.map(toRow),
})

const toRow = (value: string): GovukSummaryListRow => ({ key: { text: value }, value: { text: '' } })

export default toCuriousGoals
