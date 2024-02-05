import { parseISO } from 'date-fns'
import { PersonalLearningPlanActionPlan, PersonalLearningPlanGoal } from '../personalLearningPlanGoals'
import { ActionPlanResponse } from '../educationAndWorkPlanApi/actionPlanResponse'
import { GoalResponse } from '../educationAndWorkPlanApi/goalResponse'

/**
 * Simple mapper function to map from the Education And Work Plan (PLP) API type [ActionPlanResponse]
 * into the view model type [PersonalLearningPlanActionPlan]
 */
const toPersonalLearningPlanActionPlan = (
  apiActionPlanResponse: ActionPlanResponse,
): PersonalLearningPlanActionPlan => {
  const goals = apiActionPlanResponse.goals.map(goal => toPersonalLearningPlanGoal(goal))
  return {
    prisonerNumber: apiActionPlanResponse.prisonNumber,
    goals,
    ...getLastUpdatedAuditFields(goals),
    problemRetrievingData: false,
  }
}

/**
 * Given an array of [GoalResponse] returns the "last updated at/by" audit fields for the [GoalResponse] that was updated
 * most recently.
 * If the specified array of [GoalResponse] is empty then the 3 fields will be returned as `undefined`
 */
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

const toPersonalLearningPlanGoal = (apiGoalResponse: GoalResponse): PersonalLearningPlanGoal => {
  return {
    reference: apiGoalResponse.goalReference,
    title: apiGoalResponse.title,
    createdAt: parseISO(apiGoalResponse.createdAt),
    createdBy: apiGoalResponse.createdBy,
    createdByDisplayName: apiGoalResponse.createdByDisplayName,
    updatedAt: parseISO(apiGoalResponse.updatedAt),
    updatedBy: apiGoalResponse.updatedBy,
    updatedByDisplayName: apiGoalResponse.updatedByDisplayName,
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

export default toPersonalLearningPlanActionPlan
