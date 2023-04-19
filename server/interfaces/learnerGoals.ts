export interface LearnerGoals {
  prn?: string
  employmentGoals: string[]
  personalGoals: string[]
  longTermGoals: string[]
  shortTermGoals: string[]
}

export interface LearnerGoalsTestParams {
  prisonerNumber: string
  emptyStates: boolean
}
