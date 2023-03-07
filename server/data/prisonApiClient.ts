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
import { Assessment } from '../interfaces/prisonApi/assessment'
import { OffenderContact } from '../interfaces/staffContacts'
import { mapToQueryString } from '../utils/utils'
import { CaseNote } from '../interfaces/caseNote'
import { ScheduledEvent } from '../interfaces/scheduledEvent'
import dummyScheduledEvents from './localMockData/eventsForToday'
import { PrisonerDetail } from '../interfaces/prisonerDetail'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'
import { PersonalCareNeeds } from '../interfaces/personalCareNeeds'
import { SecondaryLanguage } from '../interfaces/prisonApi/secondaryLanguage'

export default class PrisonApiRestClient implements PrisonApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prisonApi, token)
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

  async getUserLocations(): Promise<Location[]> {
    return this.get<Location[]>({ path: '/api/users/me/locations' }, LocationDummyDataB)
  }

  async getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' }, CaseLoadsDummyDataA)
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
    return this.get<NonAssociationDetails>(
      { path: `/api/offenders/${prisonerNumber}/non-association-details` },
      nonAssociationDetailsDummyData,
    )
  }

  async getAccountBalances(bookingId: number): Promise<AccountBalances> {
    return this.get<AccountBalances>({
      path: `/api/bookings/${bookingId}/balances`,
    })
  }

  async getAdjudications(bookingId: number): Promise<AdjudicationSummary> {
    return this.get<AdjudicationSummary>({ path: `/api/bookings/${bookingId}/adjudications` })
  }

  async getVisitSummary(bookingId: number): Promise<VisitSummary> {
    return this.get<VisitSummary>({ path: `/api/bookings/${bookingId}/visits/summary` })
  }

  async getVisitBalances(prisonerNumber: string): Promise<VisitBalances> {
    return this.get<VisitBalances>({
      path: `/api/bookings/offenderNo/${prisonerNumber}/visit/balances`,
    })
  }

  async getAssessments(bookingId: number): Promise<Assessment[]> {
    return this.get<Assessment[]>({ path: `/api/bookings/${bookingId}/assessments` })
  }

  async getEventsScheduledForToday(bookingId: number): Promise<ScheduledEvent[]> {
    return this.get<ScheduledEvent[]>(
      {
        path: `/api/bookings/${bookingId}/events/today`,
      },
      dummyScheduledEvents,
    )
  }

  async getOffenderContacts(bookingId: number): Promise<OffenderContact> {
    try {
      return await this.restClient.get<OffenderContact>({ path: `/api/bookings/${bookingId}/contacts` })
    } catch (error) {
      return error
    }
  }

  async getPrisoner(prisonerNumber: string): Promise<PrisonerDetail> {
    const prisoner = await this.get<PrisonerDetail>({ path: `/api/prisoners/${prisonerNumber}` })
    // API returns array with one entry, so extract this to return a single object
    if (Array.isArray(prisoner)) {
      return prisoner[0]
    }
    return prisoner
  }

  async getCaseNoteSummaryByTypes(params: object): Promise<CaseNote[]> {
    try {
      return await this.restClient.get<CaseNote[]>({ path: `/api/case-notes/summary?${mapToQueryString(params)}` })
    } catch (error) {
      return error
    }
  }

  async getInmateDetail(bookingId: number): Promise<InmateDetail> {
    return this.get<InmateDetail>({ path: `/api/bookings/${bookingId}` })
  }

  async getPersonalCareNeeds(bookingId: number, types?: string[]): Promise<PersonalCareNeeds> {
    let query
    if (types?.length) {
      query = `type=${types.join('+')}`
    }
    return this.get<PersonalCareNeeds>({ path: `/api/bookings/${bookingId}/personal-care-needs`, query })
  }
}
