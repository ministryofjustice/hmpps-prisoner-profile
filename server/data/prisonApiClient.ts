import { Readable } from 'stream'
import config from '../config'
import RestClient from './restClient'
import { CaseLoadsDummyDataA } from './localMockData/caseLoad'
import { CaseLoad } from '../interfaces/caseLoad'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import { AccountBalances } from '../interfaces/accountBalances'
import { VisitSummary } from '../interfaces/visitSummary'
import { VisitBalances } from '../interfaces/visitBalances'
import { Assessment } from '../interfaces/prisonApi/assessment'
import { ContactDetail } from '../interfaces/staffContacts'
import { mapToQueryString } from '../utils/utils'
import { CaseNote } from '../interfaces/caseNote'
import { ScheduledEvent } from '../interfaces/scheduledEvent'
import dummyScheduledEvents from './localMockData/eventsForToday'
import { PrisonerDetail } from '../interfaces/prisonerDetail'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'
import { PersonalCareNeeds } from '../interfaces/personalCareNeeds'
import { OffenderActivitiesHistory } from '../interfaces/offenderActivitiesHistory'
import { OffenderAttendanceHistory } from '../interfaces/offenderAttendanceHistory'
import { SecondaryLanguage } from '../interfaces/prisonApi/secondaryLanguage'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { PropertyContainer } from '../interfaces/prisonApi/propertyContainer'
import { CourtCase } from '../interfaces/prisonApi/courtCase'
import { OffenceHistoryDetail } from '../interfaces/prisonApi/offenceHistoryDetail'
import { OffenderSentenceTerms } from '../interfaces/prisonApi/offenderSentenceTerms'
import { PrisonerSentenceDetails } from '../interfaces/prisonerSentenceDetails'
import { Address } from '../interfaces/prisonApi/address'
import { OffenderContacts } from '../interfaces/prisonApi/offenderContacts'
import { ReferenceCode, ReferenceCodeDomain } from '../interfaces/prisonApi/referenceCode'
import { ReasonableAdjustments } from '../interfaces/prisonApi/reasonableAdjustment'
import { CaseNoteUsage } from '../interfaces/prisonApi/caseNoteUsage'
import { formatDateISO } from '../utils/dateHelpers'
import { CaseNoteCount } from '../interfaces/prisonApi/caseNoteCount'
import { CourtDateResults } from '../interfaces/courtDateResults'
import { MainOffence } from '../interfaces/prisonApi/mainOffence'
import { FullStatus } from '../interfaces/prisonApi/fullStatus'
import { SentenceSummary } from '../interfaces/prisonApi/sentenceSummary'
import { OffenderIdentifier } from '../interfaces/prisonApi/offenderIdentifier'
import { StaffRole } from '../interfaces/prisonApi/staffRole'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'
import { LocationsInmate } from '../interfaces/prisonApi/locationsInmates'
import { OffenderCellHistory } from '../interfaces/prisonApi/offenderCellHistoryInterface'
import { Alert, AlertForm, AlertType } from '../interfaces/prisonApi/alert'
import { GetEventScheduleItem } from '../interfaces/prisonApi/getEventScheduleItem'
import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { Transaction } from '../interfaces/prisonApi/transaction'
import { DamageObligationContainer } from '../interfaces/prisonApi/damageObligation'
import { Movement } from '../interfaces/prisonApi/movement'
import { MovementType } from './enums/movementType'

export default class PrisonApiRestClient implements PrisonApiClient {
  constructor(private restClient: RestClient) {}

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

  private async post(args: object): Promise<unknown> {
    return this.restClient.post(args)
  }

  async getOffenderAttendanceHistory(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
  ): Promise<OffenderAttendanceHistory> {
    return this.get<OffenderAttendanceHistory>({
      path: `/api/offender-activities/${prisonerNumber}/attendance-history?fromDate=${fromDate}&toDate=${toDate}&page=0&size=20`,
    })
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

  async getAccountBalances(bookingId: number): Promise<AccountBalances> {
    return this.get<AccountBalances>({
      path: `/api/bookings/${bookingId}/balances`,
    })
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

  async getBookingContacts(bookingId: number): Promise<ContactDetail> {
    try {
      return await this.restClient.get<ContactDetail>({ path: `/api/bookings/${bookingId}/contacts` })
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
      query = `type=${types.join()}`
    }
    return this.get<PersonalCareNeeds>({ path: `/api/bookings/${bookingId}/personal-care-needs`, query })
  }

  async getOffenderActivitiesHistory(
    prisonerNumber: string,
    earliestEndDate: string,
  ): Promise<OffenderActivitiesHistory> {
    try {
      return await this.restClient.get<OffenderActivitiesHistory>({
        path: `/api/offender-activities/${prisonerNumber}/activities-history?earliestEndDate=${earliestEndDate}`,
      })
    } catch (error) {
      return error
    }
  }

  async getSecondaryLanguages(bookingId: number): Promise<SecondaryLanguage[]> {
    return this.get<SecondaryLanguage[]>({ path: `/api/bookings/${bookingId}/secondary-languages` })
  }

  async getAlerts(bookingId: number, queryParams?: PagedListQueryParams): Promise<PagedList<Alert>> {
    // Set defaults then apply queryParams
    const params: PagedListQueryParams = {
      size: queryParams?.showAll ? 9999 : 20,
      ...queryParams,
    }
    return this.get<PagedList<Alert>>({ path: `/api/bookings/${bookingId}/alerts/v2`, query: mapToQueryString(params) })
  }

  async getProperty(bookingId: number): Promise<PropertyContainer[]> {
    return this.get<PropertyContainer[]>({ path: `/api/bookings/${bookingId}/property` })
  }

  async getCourtCases(bookingId: number): Promise<CourtCase[]> {
    return this.get<CourtCase[]>({ path: `/api/bookings/${bookingId}/court-cases` })
  }

  async getOffenceHistory(prisonerNumber: string): Promise<OffenceHistoryDetail[]> {
    return this.get<OffenceHistoryDetail[]>({ path: `/api/bookings/offenderNo/${prisonerNumber}/offenceHistory` })
  }

  async getSentenceTerms(bookingId: number): Promise<OffenderSentenceTerms[]> {
    return this.get<OffenderSentenceTerms[]>({
      path: `/api/offender-sentences/booking/${bookingId}/sentenceTerms?filterBySentenceTermCodes=IMP&filterBySentenceTermCodes=LIC`,
    })
  }

  async getPrisonerSentenceDetails(prisonerNumber: string): Promise<PrisonerSentenceDetails> {
    try {
      return this.get<PrisonerSentenceDetails>({ path: `/api/offenders/${prisonerNumber}/sentences` })
    } catch (error) {
      return error
    }
  }

  async getAddresses(prisonerNumber: string): Promise<Address[]> {
    return this.get<Address[]>({ path: `/api/offenders/${prisonerNumber}/addresses` })
  }

  async getAddressesForPerson(personId: number): Promise<Address[]> {
    return this.get<Address[]>({ path: `/api/persons/${personId}/addresses` })
  }

  async getOffenderContacts(prisonerNumber: string): Promise<OffenderContacts> {
    return this.get<OffenderContacts>({ path: `/api/offenders/${prisonerNumber}/contacts` })
  }

  async getImage(imageId: string, getFullSizedImage: boolean): Promise<Readable> {
    try {
      return await this.restClient.stream({
        path: `/api/images/${imageId}/data?fullSizeImage=${getFullSizedImage}`,
      })
    } catch (error) {
      return error
    }
  }

  async getReferenceCodesByDomain(domain: ReferenceCodeDomain): Promise<ReferenceCode[]> {
    return this.get<ReferenceCode[]>({
      path: `/api/reference-domains/domains/${domain}`,
      headers: { 'page-limit': '1000' },
    })
  }

  async getReasonableAdjustments(bookingId: number, treatmentCodes: string[]): Promise<ReasonableAdjustments> {
    return this.get<ReasonableAdjustments>({
      path: `/api/bookings/${bookingId}/reasonable-adjustments?type=${treatmentCodes.join()}`,
    })
  }

  async getCaseNotesUsage(prisonerNumber: string): Promise<CaseNoteUsage[]> {
    const today = formatDateISO(new Date())
    return this.get({
      path: `/api/case-notes/usage`,
      query: `offenderNo=${prisonerNumber}&toDate=${today}&numMonths=1200`,
    })
  }

  async getCaseNoteCount(
    bookingId: number,
    type: string,
    subType: string,
    fromDate: string,
    toDate: string,
  ): Promise<CaseNoteCount> {
    return this.get({
      path: `/api/bookings/${bookingId}/caseNotes/${type}/${subType}/count`,
      query: `fromDate=${fromDate}&toDate=${toDate}`,
    })
  }

  async getMainOffence(bookingId: number): Promise<MainOffence[]> {
    return this.get({ path: `/api/bookings/${bookingId}/mainOffence` })
  }

  async getFullStatus(prisonerNumber: string): Promise<FullStatus> {
    return this.get({ path: `/api/prisoners/${prisonerNumber}/full-status` })
  }

  async getCourtDateResults(prisonerNumber: string): Promise<CourtDateResults[]> {
    return this.get<CourtDateResults[]>({
      path: `/api/court-date-results/${prisonerNumber}`,
    })
  }

  async getIdentifiers(bookingId: number): Promise<OffenderIdentifier[]> {
    return this.get<OffenderIdentifier[]>({
      path: `/api/bookings/${bookingId}/identifiers`,
    })
  }

  async getSentenceSummary(prisonerNumber: string): Promise<SentenceSummary> {
    return this.get<SentenceSummary>({
      path: `/api/offenders/${prisonerNumber}/booking/latest/sentence-summary`,
    })
  }

  async getStaffRoles(staffId: number, agencyId: string): Promise<StaffRole[]> {
    return this.get<StaffRole[]>({ path: `/api/staff/${staffId}/${agencyId}/roles` })
  }

  async getAgencyDetails(agencyId: string): Promise<AgencyLocationDetails> {
    return this.get<AgencyLocationDetails>({ path: `/api/agencies/${agencyId}` })
  }

  async getOffenderCellHistory(bookingId: number, params: object): Promise<OffenderCellHistory> {
    return this.get<OffenderCellHistory>({
      path: `/api/bookings/${bookingId}/cell-history?${mapToQueryString(params)}`,
    })
  }

  async getStaffDetails(staffId: string): Promise<StaffDetails> {
    return this.get<StaffDetails>({ path: `/api/users/${staffId}` })
  }

  async getInmatesAtLocation(locationId: number, params: object): Promise<LocationsInmate[]> {
    return this.get<LocationsInmate[]>({ path: `/api/locations/${locationId}/inmates?${mapToQueryString(params)}` })
  }

  async getAlertTypes(): Promise<AlertType[]> {
    return this.get<AlertType[]>({
      path: `/api/reference-domains/domains/ALERT?withSubCodes=true`,
      headers: { 'page-limit': '1000' },
    })
  }

  async createAlert(bookingId: number, alert: AlertForm): Promise<Alert> {
    return (await this.post({ path: `/api/bookings/${bookingId}/alert`, data: alert })) as Alert
  }

  async getCsraAssessment(bookingId: number, assessmentSeq: number): Promise<CsraAssessment> {
    return this.get<CsraAssessment>({
      path: `/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`,
    })
  }

  async getCsraAssessmentsForPrisoner(prisonerNumber: string): Promise<CsraAssessment[]> {
    return this.get<CsraAssessment[]>({
      path: `/api/offender-assessments/csra/${prisonerNumber}`,
    })
  }

  async getTransactionHistory(prisonerNumber: string, params: object): Promise<Transaction[]> {
    return this.get<Transaction[]>({
      path: `/api/offenders/${prisonerNumber}/transaction-history`,
      query: mapToQueryString(params),
    })
  }

  async getDamageObligations(prisonerNumber: string, status?: string): Promise<DamageObligationContainer> {
    return this.get<DamageObligationContainer>({
      path: `/api/offenders/${prisonerNumber}/damage-obligations`,
      query: mapToQueryString({ status: status || 'ACTIVE' }),
    })
  }

  async getScheduledEventsForThisWeek(bookingId: number): Promise<GetEventScheduleItem[]> {
    return this.get<GetEventScheduleItem[]>({ path: `/api/bookings/${bookingId}/events/thisWeek` })
  }

  async getScheduledEventsForNextWeek(bookingId: number): Promise<GetEventScheduleItem[]> {
    return this.get<GetEventScheduleItem[]>({ path: `/api/bookings/${bookingId}/events/nextWeek` })
  }

  async getMovements(
    prisonerNumbers: string[],
    movementTypes: MovementType[],
    latestOnly: boolean = true,
  ): Promise<Movement[]> {
    return (await this.post({
      path: `/api/movements/offenders`,
      query: mapToQueryString({ movementTypes, latestOnly }),
      data: prisonerNumbers,
    })) as Movement[]
  }
}
