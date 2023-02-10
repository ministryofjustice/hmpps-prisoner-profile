import config from '../config'
import RestClient from './restClient'
import { LocationDummyDataB } from './localMockData/locations'
import { CaseLoadsDummyDataA } from './localMockData/caseLoad'
import { CaseLoad } from '../interfaces/caseLoad'
import { Location } from '../interfaces/location'
import { NonAssociationDetails } from '../interfaces/nonAssociationDetails'
import nonAssociationDetailsDummyData from './localMockData/nonAssociations'
import { PrisonApiClient } from './interfaces/prisonApiClient'

export default class PrisonApiRestClient implements PrisonApiClient {
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

  async getNonAssociationDetails(prisonerNumber: string): Promise<NonAssociationDetails> {
    try {
      const result = await this.restClient.get({
        path: `/api/offenders/${prisonerNumber}/non-association-details`,
      })
      return result as NonAssociationDetails
    } catch (err) {
      if (config.localMockData === 'true') {
        return nonAssociationDetailsDummyData
      }
      return err
    }
  }
}
