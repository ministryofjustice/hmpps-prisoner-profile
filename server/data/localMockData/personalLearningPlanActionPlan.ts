import { PersonalLearningPlanActionPlan, PersonalLearningPlanGoal } from '../../interfaces/personalLearningPlanGoals'

const aValidPersonalLearningPlanActionPlan = (options?: {
  prisonerNumber?: string
  goals?: Array<PersonalLearningPlanGoal>
}): PersonalLearningPlanActionPlan => {
  return {
    prisonerNumber: options?.prisonerNumber || 'A1234BC',
    goals: options?.goals || [aValidPersonalLearningPlanGoal()],
    problemRetrievingData: false,
  }
}

const aValidPersonalLearningPlanGoal = (options?: {
  reference?: string
  title?: string
  createdAt?: Date
  updatedAt?: Date
}): PersonalLearningPlanGoal => {
  return {
    reference: options?.reference || 'd38a6c41-13d1-1d05-13c2-24619966119b',
    title: options?.title || 'Learn Spanish',
    createdAt: options?.createdAt || new Date('2023-01-16T09:14:43.158Z'),
    updatedAt: options?.updatedAt || new Date('2023-09-23T14:43:02.094Z'),
  }
}

export { aValidPersonalLearningPlanActionPlan, aValidPersonalLearningPlanGoal }
