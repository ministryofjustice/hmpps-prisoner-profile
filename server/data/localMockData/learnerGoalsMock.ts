import LearnerGoals from '../interfaces/curiousApi/LearnerGoals'

const aValidLearnerGoals = (options?: {
  prn?: string
  employmentGoals?: string[]
  personalGoals?: string[]
  longTermGoals?: string[]
  shortTermGoals?: string[]
}): LearnerGoals => {
  return {
    prn: options?.prn || 'G6123VU',
    employmentGoals: options?.employmentGoals || ['An employment goal'],
    personalGoals: options?.personalGoals || ['A personal goal'],
    shortTermGoals: options?.shortTermGoals || ['A short term goal'],
    longTermGoals: options?.longTermGoals || ['A long term goal'],
  }
}

export default aValidLearnerGoals
