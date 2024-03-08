import {
  PersonalLearningPlanActionPlan,
  PersonalLearningPlanGoal,
} from '../../services/interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanGoals'

const aValidPersonalLearningPlanActionPlan = (options?: {
  prisonerNumber?: string
  goals?: Array<PersonalLearningPlanGoal>
}): PersonalLearningPlanActionPlan => {
  const goals = options?.goals || [aValidPersonalLearningPlanGoal()]
  return {
    prisonerNumber: options?.prisonerNumber || 'A1234BC',
    goals,
    ...getLastUpdatedAuditFields(goals),
    problemRetrievingData: false,
  }
}

const aValidPersonalLearningPlanGoal = (options?: {
  reference?: string
  title?: string
  createdAt?: Date
  createdBy?: string
  createdByDisplayName?: string
  updatedAt?: Date
  updatedBy?: string
  updatedByDisplayName?: string
  sequenceNumber?: number
}): PersonalLearningPlanGoal => {
  return {
    reference: options?.reference || 'd38a6c41-13d1-1d05-13c2-24619966119b',
    title: options?.title || 'Learn Spanish',
    createdBy: options?.createdBy || 'asmith_gen',
    createdByDisplayName: options?.createdByDisplayName || 'Alex Smith',
    createdAt: options?.createdAt || new Date('2023-01-16T09:14:43.158Z'),
    updatedBy: options?.updatedBy || 'asmith_gen',
    updatedByDisplayName: options?.updatedByDisplayName || 'Alex Smith',
    updatedAt: options?.updatedAt || new Date('2023-09-23T14:43:02.094Z'),
    sequenceNumber: options?.sequenceNumber || 1,
  }
}

const getLastUpdatedAuditFields = (
  goals: Array<PersonalLearningPlanGoal>,
): { updatedBy?: string; updatedByDisplayName?: string; updatedAt?: Date } => {
  if (goals.length === 0) {
    return { updatedBy: undefined, updatedByDisplayName: undefined, updatedAt: undefined }
  }

  const mostRecentGoal = goals.sort(goalComparator)[0]
  return {
    updatedBy: mostRecentGoal.updatedBy,
    updatedByDisplayName: mostRecentGoal.updatedByDisplayName,
    updatedAt: mostRecentGoal.updatedAt,
  }
}

const goalComparator = (left: PersonalLearningPlanGoal, right: PersonalLearningPlanGoal): number => {
  if (left.updatedAt > right.updatedAt) {
    return -1
  }
  if (left.updatedAt < right.updatedAt) {
    return 1
  }
  return 0
}

export { aValidPersonalLearningPlanActionPlan, aValidPersonalLearningPlanGoal }
