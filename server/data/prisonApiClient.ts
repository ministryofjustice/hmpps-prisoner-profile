import { Readable } from 'stream'
import config from '../config'
import RestClient from './restClient'
import { LocationDummyDataB } from './localMockData/locations'
import { CaseLoadsDummyDataA } from './localMockData/caseLoad'
import { CaseLoad } from '../interfaces/caseLoad'
import { Location } from '../interfaces/location'
import { NonAssociationDetails } from '../interfaces/nonAssociationDetails'
import nonAssociationDetailsDummyData from './localMockData/nonAssociations'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import { AccountBalances } from '../interfaces/accountBalances'
import { AdjudicationSummary } from '../interfaces/adjudicationSummary'
import { VisitSummary } from '../interfaces/visitSummary'
import { VisitBalances } from '../interfaces/visitBalances'
import { Assessment } from '../interfaces/assessment'
import { ScheduledEvent } from '../interfaces/scheduledEvent'
import dummyScheduledEvents from './localMockData/eventsForToday'

export default class PrisonApiRestClient implements PrisonApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prisonApi, token)
  }

  async getUserLocations(): Promise<Location[]> {
    try {
      return await this.restClient.get<Location[]>({ path: '/api/users/me/locations' })
    } catch (error) {
      if (config.localMockData === 'true') {
        return LocationDummyDataB
      }
      return error
    }
  }

  async getUserCaseLoads(): Promise<CaseLoad[]> {
    try {
      return await this.restClient.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' })
    } catch (error) {
      if (config.localMockData === 'true') {
        return CaseLoadsDummyDataA
      }
      return error
    }
  }

  async getPrisonerImage(offenderNumber: string, fullSizeImage: boolean): Promise<Readable> {
    try {
      return await this.restClient.stream({
        path: `/api/bookings/offenderNo/${offenderNumber}/image/data?fullSizeImage=${fullSizeImage}`,
      })
    } catch (error) {
      return error
    }
  }

  async getNonAssociationDetails(prisonerNumber: string): Promise<NonAssociationDetails> {
    try {
      return await this.restClient.get<NonAssociationDetails>({
        path: `/api/offenders/${prisonerNumber}/non-association-details`,
      })
    } catch (err) {
      if (config.localMockData === 'true') {
        return nonAssociationDetailsDummyData
      }
      return err
    }
  }

  async getAccountBalances(bookingId: number): Promise<AccountBalances> {
    try {
      return await this.restClient.get<AccountBalances>({
        path: `/api/bookings/${bookingId}/balances`,
      })
    } catch (error) {
      return error
    }
  }

  async getAdjudications(bookingId: number): Promise<AdjudicationSummary> {
    try {
      return await this.restClient.get<AdjudicationSummary>({ path: `/api/bookings/${bookingId}/adjudications` })
    } catch (error) {
      return error
    }
  }

  async getVisitSummary(bookingId: number): Promise<VisitSummary> {
    try {
      return await this.restClient.get<VisitSummary>({ path: `/api/bookings/${bookingId}/visits/summary` })
    } catch (error) {
      return error
    }
  }

  async getVisitBalances(prisonerNumber: string): Promise<VisitBalances> {
    try {
      return await this.restClient.get<VisitBalances>({
        path: `/api/bookings/offenderNo/${prisonerNumber}/visit/balances`,
      })
    } catch (error) {
      return error
    }
  }

  async getAssessments(bookingId: number): Promise<Assessment[]> {
    try {
      return await this.restClient.get<Assessment[]>({ path: `/api/bookings/${bookingId}/assessments` })
    } catch (error) {
      return error
    }
  }

  async getEventsScheduledForToday(bookingId: number): Promise<ScheduledEvent[]> {
    try {
      const result = await this.restClient.get({
        path: `/api/bookings/${bookingId}/events/today`,
      })
      return result as ScheduledEvent[]
    } catch (err) {
      if (config.localMockData === 'true') {
        return dummyScheduledEvents
      }
      return err
    }
  }
}
