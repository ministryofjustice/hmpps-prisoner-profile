import { parseISO } from 'date-fns'
import {
  PersonalLearningPlanActionPlan,
  PersonalLearningPlanGoal,
} from '../interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanGoals'
import { ActionPlanResponse } from '../../data/interfaces/educationAndWorkPlanApi/actionPlanResponse'
import GoalResponse from '../../data/interfaces/educationAndWorkPlanApi/GoalResponse'
import dateComparator from '../../utils/dateComparator'

/**
 * Simple mapper function to map from the Education And Work Plan (PLP) API type [ActionPlanResponse]
 * into the view model type [PersonalLearningPlanActionPlan]
 */
const toPersonalLearningPlanActionPlan = (
  apiActionPlanResponse: ActionPlanResponse,
): PersonalLearningPlanActionPlan => {
  const goalReferencesInCreationDateOrder = goalReferencesSortedByCreationDate(apiActionPlanResponse.goals)
  return {
    prisonerNumber: apiActionPlanResponse.prisonNumber,
    goals: apiActionPlanResponse.goals.map((goal: GoalResponse) => {
      const goalSequenceNumber = goalReferencesInCreationDateOrder.indexOf(goal.goalReference) + 1
      return toPersonalLearningPlanGoal(goal, goalSequenceNumber)
    }),
    ...getLastUpdatedAuditFields(apiActionPlanResponse.goals),
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

const toPersonalLearningPlanGoal = (
  apiGoalResponse: GoalResponse,
  goalSequenceNumber: number,
): PersonalLearningPlanGoal => {
  return {
    reference: apiGoalResponse.goalReference,
    title: apiGoalResponse.title,
    createdAt: parseISO(apiGoalResponse.createdAt),
    createdBy: apiGoalResponse.createdBy,
    createdByDisplayName: apiGoalResponse.createdByDisplayName,
    updatedAt: parseISO(apiGoalResponse.updatedAt),
    updatedBy: apiGoalResponse.updatedBy,
    updatedByDisplayName: apiGoalResponse.updatedByDisplayName,
    sequenceNumber: goalSequenceNumber,
  }
}

/**
 * Sorts the goals by creation date descending in a non-destructive manner (function arg is pass by reference) and
 * returns an array of the goal reference numbers.
 */
const goalReferencesSortedByCreationDate = (goals: Array<GoalResponse>): Array<string> => {
  return [...goals]
    .sort((left: GoalResponse, right: GoalResponse) =>
      dateComparator(parseISO(left.createdAt), parseISO(right.createdAt), 'ASC'),
    )
    .map(goal => goal.goalReference)
}

export default toPersonalLearningPlanActionPlan
