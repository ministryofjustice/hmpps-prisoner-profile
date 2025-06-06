/**
 * Interfaces defining Personal Learning Plan (PLP) view model types.
 *
 * These types are a deliberate abstraction from the implementation detail of the REST API that returns the data
 * so as not to tightly couple the view concerns, including the controller, to any given REST API.
 *
 * This is particularly relevant in the case of Personal Learning Plan data (specifically, but not limited to Goals)
 * because there is some thought that HMPPS Digital strategic direction may replace the Education and Work Plan (PLP) API
 * (or elements of it) with the OnePlan API. This abstraction and loose coupling means that the scope and impact of that
 * change as and when it happens would be minimal.
 */
export interface PersonalLearningPlanActionPlan {
  prisonerNumber: string
  activeGoals: Array<PersonalLearningPlanGoal>
  archivedGoals: Array<PersonalLearningPlanGoal>
  completedGoals: Array<PersonalLearningPlanGoal>
  updatedBy?: string
  updatedByDisplayName?: string
  updatedAt?: Date
  problemRetrievingData: boolean
}

export interface PersonalLearningPlanGoal {
  reference: string
  title: string
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  createdAt: Date
  createdBy: string
  createdByDisplayName: string
  updatedAt: Date
  updatedBy: string
  updatedByDisplayName: string
  targetCompletionDate: Date
}
