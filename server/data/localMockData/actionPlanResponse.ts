import { ActionPlanResponse } from '../interfaces/educationAndWorkPlanApi/actionPlanResponse'
import GoalResponse from '../interfaces/educationAndWorkPlanApi/GoalResponse'
import StepResponse from '../interfaces/educationAndWorkPlanApi/StepResponse'

const aValidActionPlanResponse = (options?: {
  reference?: string
  prisonNumber?: string
  goals?: Array<GoalResponse>
}): ActionPlanResponse => {
  return {
    reference: options?.reference || 'a20912ab-4dae-4aa4-8bc5-32319da8fceb',
    prisonNumber: options?.prisonNumber || 'A1234BC',
    goals: options?.goals || [aValidGoalResponse()],
  }
}

const aValidActionPlanResponseWithOneGoal = (): ActionPlanResponse => {
  return aValidActionPlanResponse({ goals: [aValidGoalResponse()] })
}

const aValidGoalResponse = (options?: {
  reference?: string
  title?: string
  createdAt?: string
  createdBy?: string
  createdByDisplayName?: string
  updatedAt?: string
  updatedBy?: string
  updatedByDisplayName?: string
}): GoalResponse => {
  return {
    goalReference: options?.reference || 'd38a6c41-13d1-1d05-13c2-24619966119b',
    title: options?.title || 'Learn Spanish',
    status: 'ACTIVE',
    steps: [aValidFirstStepResponse(), aValidSecondStepResponse()],
    createdBy: options?.createdBy || 'asmith_gen',
    createdByDisplayName: options?.createdByDisplayName || 'Alex Smith',
    createdAt: options?.createdAt || '2023-01-16T09:14:43.158Z',
    createdAtPrison: 'MDI',
    updatedBy: options?.updatedBy || 'asmith_gen',
    updatedByDisplayName: options?.updatedByDisplayName || 'Alex Smith',
    updatedAt: options?.updatedAt || '2023-09-23T14:43:02.094Z',
    updatedAtPrison: 'MDI',
    targetCompletionDate: '2024-02-29',
    notes: 'Prisoner is not good at listening',
  }
}

const aValidFirstStepResponse = (): StepResponse => {
  return {
    stepReference: 'c88a6c48-97e2-4c04-93b5-98619966447b',
    title: 'Book Spanish course',
    status: 'ACTIVE',
    sequenceNumber: 1,
  }
}

const aValidSecondStepResponse = (): StepResponse => {
  return {
    stepReference: 'dc817ce8-2b2e-4282-96b2-b9a1d831fc56',
    title: 'Complete Spanish course',
    status: 'NOT_STARTED',
    sequenceNumber: 2,
  }
}

export { aValidActionPlanResponse, aValidActionPlanResponseWithOneGoal, aValidGoalResponse }
