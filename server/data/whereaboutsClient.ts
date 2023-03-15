import RestClient from './restClient'
import config from '../config'
import { UnacceptableAbsences } from '../interfaces/unacceptableAbsences'
import { PageableQuery } from '../interfaces/pageable'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApiClient'

export default class WhereaboutsRestApiClient implements WhereaboutsApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Whereabouts API', config.apis.whereaboutsApiUrl, token)
  }

  private async get<T>(args: object, localMockData?: T): Promise<T> {
    try {
      return await this.restClient.get<T>(args)
    } catch (error) {
      if (config.localMockData === 'true' && localMockData) {
        return localMockData
      }
      return error
    }
  }

  async getUnacceptableAbsences(
    offenderNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences> {
    return this.get<UnacceptableAbsences>({
      path: `/attendances/offender/${offenderNumber}/unacceptable-absences?fromDate=${fromDate}&toDate=${toDate}&page=${page}&size=1&sort=string`,
    })
  }
}
