import CuriousGoals from '../interfaces/workAndSkillsPageService/CuriousGoals'
import GovSummaryItem from '../../interfaces/GovSummaryItem'
import LearnerGoals from '../../data/interfaces/curiousApi/LearnerGoals'

/**
 * Simple mapper function to map from the Curious API type [LearnerGoals]
 * into the view model type [CuriousGoals]
 */
const toCuriousGoals = (learnerGoals: LearnerGoals): CuriousGoals => {
  return {
    prisonerNumber: learnerGoals.prn,
    employmentGoals: learnerGoals.employmentGoals.map(toGovSummaryItem),
    personalGoals: learnerGoals.personalGoals.map(toGovSummaryItem),
    shortTermGoals: learnerGoals.shortTermGoals.map(toGovSummaryItem),
    longTermGoals: learnerGoals.longTermGoals.map(toGovSummaryItem),
  }
}

const toGovSummaryItem = (value: string): GovSummaryItem => {
  return { key: { text: value }, value: { text: '' } }
}

export default toCuriousGoals
