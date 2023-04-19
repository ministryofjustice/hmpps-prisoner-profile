import { LearnerGoals } from '../../interfaces/learnerGoals'

export const LearnerGoalsMock: LearnerGoals = {
  prn: 'G6123VU',
  employmentGoals: ['string'],
  personalGoals: ['string'],
  longTermGoals: ['string'],
  shortTermGoals: ['string'],
}

export const LearnerGoalsMockB: LearnerGoals = {
  employmentGoals: [] as string[],
  personalGoals: [] as string[],
  longTermGoals: [] as string[],
  shortTermGoals: [] as string[],
}

export default {
  LearnerGoalsMock,
}
