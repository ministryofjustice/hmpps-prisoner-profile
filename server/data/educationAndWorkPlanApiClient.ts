import EducationAndWorkPlanApiClient from './interfaces/educationAndWorkPlanApi/EducationAndWorkPlanApiClient'
import RestClient from './restClient'
import config from '../config'
import { ActionPlanResponse } from './interfaces/educationAndWorkPlanApi/actionPlanResponse'
import GetGoalsResponse from './interfaces/educationAndWorkPlanApi/GetGoalsResponse'

/**
 * REST API client implementation of [EducationAndWorkPlanApiClient] (aka. the PLP API Client)
 */
export default class EducationAndWorkPlanApiRestClient extends RestClient implements EducationAndWorkPlanApiClient {
  constructor(token: string) {
    super('Education And Work Plan API', config.apis.educationAndWorkPlanApi, token)
  }

  getAllGoals(prisonerNumber: string): Promise<GetGoalsResponse> {
    return this.get<ActionPlanResponse>({
      path: `/action-plans/${prisonerNumber}/goals`,
    })
  }
}
