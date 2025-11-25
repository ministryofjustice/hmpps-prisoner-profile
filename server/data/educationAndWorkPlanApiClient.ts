import CircuitBreaker from 'opossum'
import EducationAndWorkPlanApiClient from './interfaces/educationAndWorkPlanApi/EducationAndWorkPlanApiClient'
import RestClient, { Request } from './restClient'
import config from '../config'
import { ActionPlanResponse } from './interfaces/educationAndWorkPlanApi/actionPlanResponse'
import GetGoalsResponse from './interfaces/educationAndWorkPlanApi/GetGoalsResponse'

/**
 * REST API client implementation of [EducationAndWorkPlanApiClient] (aka. the PLP API Client)
 */
export default class EducationAndWorkPlanApiRestClient extends RestClient implements EducationAndWorkPlanApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Education And Work Plan API', config.apis.educationAndWorkPlanApi, token, circuitBreaker)
  }

  getAllGoals(prisonerNumber: string): Promise<GetGoalsResponse> {
    return this.get<ActionPlanResponse>(
      {
        path: `/action-plans/${prisonerNumber}/goals`,
      },
      this.token,
    )
  }
}
