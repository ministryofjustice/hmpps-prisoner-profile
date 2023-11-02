import { Readable } from 'stream'
import config from '../config'
import RestClient from './restClient'
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
import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { Transaction } from '../interfaces/prisonApi/transaction'
import { DamageObligationContainer } from '../interfaces/prisonApi/damageObligation'
import { Movement } from '../interfaces/prisonApi/movement'
import { MovementType } from './enums/movementType'
import { OffenderSentenceDetail } from '../interfaces/prisonApi/offenderSentenceDetail'
import { PrisonerSchedule, TimeSlot } from '../interfaces/prisonApi/prisonerSchedule'
import { Location } from '../interfaces/prisonApi/location'

export default class PrisonApiRestClient implements PrisonApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prisonApi, token)
  }

  private async post(args: object): Promise<unknown> {
    return this.restClient.post(args)
  }

  async getOffenderAttendanceHistory(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
  ): Promise<OffenderAttendanceHistory> {
    return this.restClient.get<OffenderAttendanceHistory>({
      path: `/api/offender-activities/${prisonerNumber}/attendance-history?fromDate=${fromDate}&toDate=${toDate}&page=0&size=1000`,
    })
  }

  async getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.restClient.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' })
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
    return this.restClient.get<AccountBalances>({
      path: `/api/bookings/${bookingId}/balances`,
    })
  }

  async getVisitSummary(bookingId: number): Promise<VisitSummary> {
    return this.restClient.get<VisitSummary>({ path: `/api/bookings/${bookingId}/visits/summary` })
  }

  async getVisitBalances(prisonerNumber: string): Promise<VisitBalances | null> {
    return this.restClient.get<VisitBalances | null>({
      path: `/api/bookings/offenderNo/${prisonerNumber}/visit/balances`,
      ignore404: true,
    })
  }

  async getAssessments(bookingId: number): Promise<Assessment[]> {
    return this.restClient.get<Assessment[]>({ path: `/api/bookings/${bookingId}/assessments` })
  }

  async getEventsScheduledForToday(bookingId: number): Promise<ScheduledEvent[]> {
    return this.restClient.get<ScheduledEvent[]>({
      path: `/api/bookings/${bookingId}/events/today`,
    })
  }

  async getBookingContacts(bookingId: number): Promise<ContactDetail> {
    try {
      return await this.restClient.get<ContactDetail>({ path: `/api/bookings/${bookingId}/contacts` })
    } catch (error) {
      return error
    }
  }

  async getPrisoner(prisonerNumber: string): Promise<PrisonerDetail> {
    const prisoner = await this.restClient.get<PrisonerDetail>({ path: `/api/prisoners/${prisonerNumber}` })
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
    return this.restClient.get<InmateDetail>({ path: `/api/bookings/${bookingId}` })
  }

  async getPersonalCareNeeds(bookingId: number, types?: string[]): Promise<PersonalCareNeeds> {
    let query
    if (types?.length) {
      query = `type=${types.join()}`
    }
    return this.restClient.get<PersonalCareNeeds>({ path: `/api/bookings/${bookingId}/personal-care-needs`, query })
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
    return this.restClient.get<SecondaryLanguage[]>({ path: `/api/bookings/${bookingId}/secondary-languages` })
  }

  async getAlerts(bookingId: number, queryParams?: PagedListQueryParams): Promise<PagedList<Alert>> {
    // Set defaults then apply queryParams
    const params: PagedListQueryParams = {
      size: queryParams?.showAll ? 9999 : 20,
      ...queryParams,
    }
    return this.restClient.get<PagedList<Alert>>({
      path: `/api/bookings/${bookingId}/alerts/v2`,
      query: mapToQueryString(params),
    })
  }

  async getProperty(bookingId: number): Promise<PropertyContainer[]> {
    return this.restClient.get<PropertyContainer[]>({ path: `/api/bookings/${bookingId}/property` })
  }

  async getCourtCases(bookingId: number): Promise<CourtCase[]> {
    return this.restClient.get<CourtCase[]>({ path: `/api/bookings/${bookingId}/court-cases` })
  }

  async getOffenceHistory(prisonerNumber: string): Promise<OffenceHistoryDetail[]> {
    return this.restClient.get<OffenceHistoryDetail[]>({
      path: `/api/bookings/offenderNo/${prisonerNumber}/offenceHistory`,
    })
  }

  async getSentenceTerms(bookingId: number): Promise<OffenderSentenceTerms[]> {
    return this.restClient.get<OffenderSentenceTerms[]>({
      path: `/api/offender-sentences/booking/${bookingId}/sentenceTerms?filterBySentenceTermCodes=IMP&filterBySentenceTermCodes=LIC`,
    })
  }

  async getPrisonerSentenceDetails(prisonerNumber: string): Promise<PrisonerSentenceDetails> {
    try {
      return this.restClient.get<PrisonerSentenceDetails>({ path: `/api/offenders/${prisonerNumber}/sentences` })
    } catch (error) {
      return error
    }
  }

  async getAddresses(prisonerNumber: string): Promise<Address[]> {
    return this.restClient.get<Address[]>({ path: `/api/offenders/${prisonerNumber}/addresses` })
  }

  async getAddressesForPerson(personId: number): Promise<Address[]> {
    return this.restClient.get<Address[]>({ path: `/api/persons/${personId}/addresses` })
  }

  async getOffenderContacts(prisonerNumber: string): Promise<OffenderContacts> {
    return this.restClient.get<OffenderContacts>({ path: `/api/offenders/${prisonerNumber}/contacts` })
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
    return this.restClient.get<ReferenceCode[]>({
      path: `/api/reference-domains/domains/${domain}`,
      headers: { 'page-limit': '1000' },
    })
  }

  async getReasonableAdjustments(bookingId: number, treatmentCodes: string[]): Promise<ReasonableAdjustments> {
    return this.restClient.get<ReasonableAdjustments>({
      path: `/api/bookings/${bookingId}/reasonable-adjustments?type=${treatmentCodes.join()}`,
    })
  }

  async getCaseNotesUsage(prisonerNumber: string): Promise<CaseNoteUsage[]> {
    const today = formatDateISO(new Date())
    return this.restClient.get({
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
    return this.restClient.get({
      path: `/api/bookings/${bookingId}/caseNotes/${type}/${subType}/count`,
      query: `fromDate=${fromDate}&toDate=${toDate}`,
    })
  }

  async getMainOffence(bookingId: number): Promise<MainOffence[]> {
    return this.restClient.get({ path: `/api/bookings/${bookingId}/mainOffence` })
  }

  async getFullStatus(prisonerNumber: string): Promise<FullStatus> {
    return this.restClient.get({ path: `/api/prisoners/${prisonerNumber}/full-status` })
  }

  async getCourtDateResults(prisonerNumber: string): Promise<CourtDateResults[]> {
    return this.restClient.get<CourtDateResults[]>({
      path: `/api/court-date-results/${prisonerNumber}`,
    })
  }

  async getIdentifiers(bookingId: number): Promise<OffenderIdentifier[]> {
    return this.restClient.get<OffenderIdentifier[]>({
      path: `/api/bookings/${bookingId}/identifiers`,
    })
  }

  async getSentenceSummary(prisonerNumber: string): Promise<SentenceSummary> {
    return this.restClient.get<SentenceSummary>({
      path: `/api/offenders/${prisonerNumber}/booking/latest/sentence-summary`,
    })
  }

  async getStaffRoles(staffId: number, agencyId: string): Promise<StaffRole[]> {
    return this.restClient.get<StaffRole[]>({ path: `/api/staff/${staffId}/${agencyId}/roles` })
  }

  async getAgencyDetails(agencyId: string): Promise<AgencyLocationDetails | null> {
    return this.restClient.get<AgencyLocationDetails>({
      path: `/api/agencies/${agencyId}?activeOnly=false`,
      ignore404: true,
    })
  }

  async getOffenderCellHistory(bookingId: number, params: object): Promise<OffenderCellHistory> {
    return this.restClient.get<OffenderCellHistory>({
      path: `/api/bookings/${bookingId}/cell-history?${mapToQueryString(params)}`,
    })
  }

  async getStaffDetails(staffId: string): Promise<StaffDetails> {
    return this.restClient.get<StaffDetails>({ path: `/api/users/${staffId}` })
  }

  async getInmatesAtLocation(locationId: number, params: object): Promise<LocationsInmate[]> {
    return this.restClient.get<LocationsInmate[]>({
      path: `/api/locations/${locationId}/inmates?${mapToQueryString(params)}`,
    })
  }

  async getAlertTypes(): Promise<AlertType[]> {
    return this.restClient.get<AlertType[]>({
      path: `/api/reference-domains/domains/ALERT?withSubCodes=true`,
      headers: { 'page-limit': '1000' },
    })
  }

  async createAlert(bookingId: number, alert: AlertForm): Promise<Alert> {
    return (await this.restClient.post({
      path: `/api/bookings/${bookingId}/alert`,
      data: alert,
    })) as Alert
  }

  async getCsraAssessment(bookingId: number, assessmentSeq: number): Promise<CsraAssessment> {
    return this.restClient.get<CsraAssessment>({
      path: `/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`,
    })
  }

  async getCsraAssessmentsForPrisoner(prisonerNumber: string): Promise<CsraAssessment[]> {
    return this.restClient.get<CsraAssessment[]>({
      path: `/api/offender-assessments/csra/${prisonerNumber}`,
    })
  }

  async getTransactionHistory(prisonerNumber: string, params: object): Promise<Transaction[]> {
    return this.restClient.get<Transaction[]>({
      path: `/api/offenders/${prisonerNumber}/transaction-history`,
      query: mapToQueryString(params),
    })
  }

  async getDamageObligations(prisonerNumber: string, status?: string): Promise<DamageObligationContainer> {
    return this.restClient.get<DamageObligationContainer>({
      path: `/api/offenders/${prisonerNumber}/damage-obligations`,
      query: mapToQueryString({ status: status || 'ACTIVE' }),
    })
  }

  async getScheduledEventsForThisWeek(bookingId: number): Promise<ScheduledEvent[]> {
    return this.restClient.get<ScheduledEvent[]>({ path: `/api/bookings/${bookingId}/events/thisWeek` })
  }

  async getScheduledEventsForNextWeek(bookingId: number): Promise<ScheduledEvent[]> {
    return this.restClient.get<ScheduledEvent[]>({ path: `/api/bookings/${bookingId}/events/nextWeek` })
  }

  async getMovements(
    prisonerNumbers: string[],
    movementTypes: MovementType[],
    latestOnly: boolean = true,
  ): Promise<Movement[]> {
    return (await this.restClient.post({
      path: `/api/movements/offenders`,
      query: mapToQueryString({ movementTypes, latestOnly }),
      data: prisonerNumbers,
    })) as Movement[]
  }

  async getLocationsForAppointments(agencyId: string): Promise<Location[]> {
    return this.restClient.get<Location[]>({ path: `/api/agencies/${agencyId}/locations?eventType=APP` })
  }

  async getAppointmentTypes(): Promise<ReferenceCode[]> {
    return this.restClient.get<ReferenceCode[]>({ path: '/api/reference-domains/scheduleReasons?eventType=APP' })
  }

  async getSentenceData(offenderNumbers: string[]): Promise<OffenderSentenceDetail[]> {
    return (await this.restClient.post({
      path: '/api/offender-sentences',
      data: offenderNumbers,
    })) as OffenderSentenceDetail[]
  }

  async getCourtEvents(offenderNumbers: string[], agencyId: string, date: string): Promise<PrisonerSchedule[]> {
    return (await this.restClient.post({
      path: `/api/schedules/${agencyId}/courtEvents?date=${date}`,
      data: offenderNumbers,
    })) as PrisonerSchedule[]
  }

  async getVisits(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return (await this.restClient.post({
      path: `/api/schedules/${agencyId}/visits`,
      query: mapToQueryString({ date, timeSlot }),
      data: offenderNumbers,
    })) as PrisonerSchedule[]
  }

  async getAppointments(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return (await this.restClient.post({
      path: `/api/schedules/${agencyId}/appointments`,
      query: mapToQueryString({ date, timeSlot }),
      data: offenderNumbers,
    })) as PrisonerSchedule[]
  }

  async getActivities(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return (await this.restClient.post({
      path: `/api/schedules/${agencyId}/activities`,
      query: mapToQueryString({ date, timeSlot }),
      data: offenderNumbers,
    })) as PrisonerSchedule[]
  }

  async getExternalTransfers(offenderNumbers: string[], agencyId: string, date: string): Promise<PrisonerSchedule[]> {
    return (await this.restClient.post({
      path: `/api/schedules/${agencyId}/externalTransfers?date=${date}`,
      data: offenderNumbers,
    })) as PrisonerSchedule[]
  }

  async getLocation(locationId: number): Promise<Location> {
    return this.restClient.get<Location>({ path: `/api/locations/${locationId}` })
  }

  async getActivitiesAtLocation(
    locationId: number,
    date: string,
    timeSlot?: TimeSlot,
    includeSuspended = false,
  ): Promise<PrisonerSchedule[]> {
    return this.restClient.get<PrisonerSchedule[]>({
      path: `/api/schedules/locations/${locationId}/activities`,
      query: mapToQueryString({ date, timeSlot, includeSuspended }),
    })
  }

  async getActivityList(
    agencyId: string,
    locationId: number,
    usage: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return this.restClient.get<PrisonerSchedule[]>({
      path: `/api/schedules/${agencyId}/locations/${locationId}/usage/${usage}`,
      query: mapToQueryString({ date, timeSlot }),
    })
  }
}
