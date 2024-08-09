import EducationAndWorkPlanApiClient from './interfaces/educationAndWorkPlanApi/EducationAndWorkPlanApiClient'
import RestClient from './restClient'
import config from '../config'
import { ActionPlanResponse } from './interfaces/educationAndWorkPlanApi/actionPlanResponse'
import GetGoalsResponse from './interfaces/educationAndWorkPlanApi/GetGoalsResponse'

/**
 * REST API client implementation of [EducationAndWorkPlanApiClient] (aka. the PLP API Client)
 */
export default class EducationAndWorkPlanApiRestClient implements EducationAndWorkPlanApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Education And Work Plan API', config.apis.educationAndWorkPlanApi, token)
  }

  getActiveGoals(prisonerNumber: string): Promise<GetGoalsResponse> {
    return this.restClient.get<ActionPlanResponse>({
      path: `/action-plans/${prisonerNumber}/goals`,
      query: {
        status: 'ACTIVE',
      },
    })
  }
}
