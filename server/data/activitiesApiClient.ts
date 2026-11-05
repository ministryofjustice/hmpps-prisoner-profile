import type CircuitBreaker from 'opossum'
import config from '../config'
import { mapToQueryString } from '../utils/utils'
import type { ActivitiesApiClient, AttendanceSummary } from './interfaces/activitiesApi/activitiesApiClient'
import RestClient, { type Request } from './restClient'

export default class ActivitiesApiRestClient extends RestClient implements ActivitiesApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Activities Management API', config.apis.activitiesApi, token, circuitBreaker)
  }

  async getAttendanceSummary(prisonerNumber: string, startDate: string, endDate: string): Promise<AttendanceSummary> {
    return this.get<AttendanceSummary>(
      {
        path: `/attendances/prisoner/${encodeURIComponent(prisonerNumber)}/attendance-summary`,
        query: mapToQueryString({ startDate, endDate }),
      },
      this.token,
    )
  }
}
