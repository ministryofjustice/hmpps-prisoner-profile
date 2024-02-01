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
  return {
    prisonerNumber: apiActionPlanResponse.prisonNumber,
    goals: apiActionPlanResponse.goals.map(goal => toPersonalLearningPlanGoal(goal)),
    problemRetrievingData: false,
  }
}

const toPersonalLearningPlanGoal = (apiGoalResponse: GoalResponse): PersonalLearningPlanGoal => {
  return {
    reference: apiGoalResponse.goalReference,
    title: apiGoalResponse.title,
    createdAt: parseISO(apiGoalResponse.createdAt),
    updatedAt: parseISO(apiGoalResponse.updatedAt),
  }
}

export default toPersonalLearningPlanActionPlan
