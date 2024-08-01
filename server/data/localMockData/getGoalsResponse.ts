import GoalResponse from '../interfaces/educationAndWorkPlanApi/GoalResponse'
import GetGoalsResponse from '../interfaces/educationAndWorkPlanApi/GetGoalsResponse'
import aValidGoalResponse from './goalResponse'

const aValidGetGoalsResponse = (options?: {
  reference?: string
  prisonNumber?: string
  goals?: Array<GoalResponse>
}): GetGoalsResponse => {
  return {
    goals: options?.goals || [aValidGoalResponse()],
  }
}

const aValidGetGoalsResponseWithOneGoal = (): GetGoalsResponse => {
  return aValidGetGoalsResponse({ goals: [aValidGoalResponse()] })
}

export { aValidGetGoalsResponse, aValidGetGoalsResponseWithOneGoal }
