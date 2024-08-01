import { parseISO } from 'date-fns'
import {
  PersonalLearningPlanActionPlan,
  PersonalLearningPlanGoal,
} from '../interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanGoals'
import GoalResponse from '../../data/interfaces/educationAndWorkPlanApi/GoalResponse'
import dateComparator from '../../utils/dateComparator'
import GetGoalsResponse from '../../data/interfaces/educationAndWorkPlanApi/GetGoalsResponse'

/**
 * Simple mapper function to map from the Education And Work Plan (PLP) API type [ActionPlanResponse]
 * into the view model type [PersonalLearningPlanActionPlan]
 */
const toPersonalLearningPlanActionPlan = (
  prisonerNumber: string,
  apiGetGoalsResponse: GetGoalsResponse,
): PersonalLearningPlanActionPlan => {
  return {
    prisonerNumber,
    goals: apiGetGoalsResponse.goals.map((goal: GoalResponse) => {
      return toPersonalLearningPlanGoal(goal)
    }),
    ...getLastUpdatedAuditFields(apiGetGoalsResponse.goals),
    problemRetrievingData: false,
  }
}

/**
 * Given an array of [GoalResponse] returns the "last updated at/by" audit fields for the [GoalResponse] that was updated
 * most recently.
 * If the specified array of [GoalResponse] is empty then the 3 fields will be returned as `undefined`
 */
const getLastUpdatedAuditFields = (
  goals: Array<GoalResponse>,
): { updatedBy?: string; updatedByDisplayName?: string; updatedAt?: Date } => {
  if (goals.length === 0) {
    return { updatedBy: undefined, updatedByDisplayName: undefined, updatedAt: undefined }
  }

  const mostRecentlyUpdatedGoal = [...goals].sort((left: GoalResponse, right: GoalResponse) =>
    dateComparator(parseISO(left.updatedAt), parseISO(right.updatedAt), 'DESC'),
  )[0]
  return {
    updatedBy: mostRecentlyUpdatedGoal.updatedBy,
    updatedByDisplayName: mostRecentlyUpdatedGoal.updatedByDisplayName,
    updatedAt: parseISO(mostRecentlyUpdatedGoal.updatedAt),
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
    targetCompletionDate: parseISO(apiGoalResponse.targetCompletionDate),
  }
}

export default toPersonalLearningPlanActionPlan
