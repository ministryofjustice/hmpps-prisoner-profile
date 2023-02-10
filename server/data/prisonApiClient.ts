import config from '../config'
import RestClient from './restClient'
import { LocationDummyDataB } from './localMockData/locations'
import { CaseLoadsDummyDataA } from './localMockData/caseLoad'
import { CaseLoad } from '../interfaces/caseLoad'
import { Location } from '../interfaces/location'

export default class PrisonApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prisonApi, token)
  }

  getUserLocations(): Promise<Location[]> {
    return this.restClient.get({ path: '/api/users/me/locations' }).catch(err => {
      if (config.localMockData === 'true') {
        return LocationDummyDataB
      }
      return err
    }) as Promise<Location[]>
  }

  getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.restClient.get({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' }).catch(err => {
      if (config.localMockData === 'true') {
        return CaseLoadsDummyDataA
      }
      return err
    }) as Promise<CaseLoad[]>
  }

  async getPrisonerImage<Readable>(offenderNumber: string, fullSizeImage: boolean): Promise<Readable> {
    try {
      const result = await this.restClient.stream({
        path: `/api/bookings/offenderNo/${offenderNumber}/image/data?fullSizeImage=${fullSizeImage}`,
      })
      return result as Readable
    } catch (err) {
      return err
    }
  }
}
