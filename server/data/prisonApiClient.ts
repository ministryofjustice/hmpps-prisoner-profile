import { Readable } from 'stream'
import config from '../config'
import RestClient from './restClient'
import CaseLoad from './interfaces/prisonApi/CaseLoad'
import { PrisonApiClient } from './interfaces/prisonApi/prisonApiClient'
import AccountBalances from './interfaces/prisonApi/AccountBalances'
import VisitSummary from './interfaces/prisonApi/VisitSummary'
import VisitBalances from './interfaces/prisonApi/VisitBalances'
import Assessment from './interfaces/prisonApi/Assessment'
import { ContactDetail } from './interfaces/prisonApi/StaffContacts'
import { mapToQueryString } from '../utils/utils'
import CaseNote, { CaseNoteCount, CaseNoteUsage } from './interfaces/prisonApi/CaseNote'
import ScheduledEvent from './interfaces/prisonApi/ScheduledEvent'
import PrisonerDetail from './interfaces/prisonApi/PrisonerDetail'
import InmateDetail from './interfaces/prisonApi/InmateDetail'
import PersonalCareNeeds from './interfaces/prisonApi/PersonalCareNeeds'
import OffenderActivitiesHistory from './interfaces/prisonApi/OffenderActivitiesHistory'
import OffenderAttendanceHistory from './interfaces/prisonApi/OffenderAttendanceHistory'
import SecondaryLanguage from './interfaces/prisonApi/SecondaryLanguage'
import PropertyContainer from './interfaces/prisonApi/PropertyContainer'
import CourtCase from './interfaces/prisonApi/CourtCase'
import OffenceHistoryDetail from './interfaces/prisonApi/OffenceHistoryDetail'
import OffenderSentenceTerms from './interfaces/prisonApi/OffenderSentenceTerms'
import PrisonerSentenceDetails from './interfaces/prisonApi/PrisonerSentenceDetails'
import Address from './interfaces/prisonApi/Address'
import ReferenceCode, { ReferenceCodeDomain } from './interfaces/prisonApi/ReferenceCode'
import { ReasonableAdjustments } from './interfaces/prisonApi/ReasonableAdjustment'
import { formatDateISO } from '../utils/dateHelpers'
import CourtDateResults from './interfaces/prisonApi/CourtDateResults'
import MainOffence from './interfaces/prisonApi/MainOffence'
import FullStatus from './interfaces/prisonApi/FullStatus'
import SentenceSummary from './interfaces/prisonApi/SentenceSummary'
import OffenderIdentifier from './interfaces/prisonApi/OffenderIdentifier'
import StaffRole from './interfaces/prisonApi/StaffRole'
import { AgenciesEmail, AgencyDetails } from './interfaces/prisonApi/Agency'
import StaffDetails from './interfaces/prisonApi/StaffDetails'
import OffenderBooking from './interfaces/prisonApi/OffenderBooking'
import OffenderCellHistory from './interfaces/prisonApi/OffenderCellHistoryInterface'
import Alert, { AlertChanges, AlertForm, AlertType } from './interfaces/prisonApi/Alert'
import CsraAssessment, { CsraAssessmentSummary } from './interfaces/prisonApi/CsraAssessment'
import Transaction from './interfaces/prisonApi/Transaction'
import { DamageObligationContainer } from './interfaces/prisonApi/DamageObligation'
import Movement from './interfaces/prisonApi/Movement'
import { MovementType } from './enums/movementType'
import OffenderSentenceDetail from './interfaces/prisonApi/OffenderSentenceDetail'
import PrisonerSchedule, { PrisonerPrisonSchedule, TimeSlot } from './interfaces/prisonApi/PrisonerSchedule'
import Location from './interfaces/prisonApi/Location'
import Details from './interfaces/prisonApi/Details'
import AttributesForLocation from './interfaces/prisonApi/AttributesForLocation'
import HistoryForLocationItem from './interfaces/prisonApi/HistoryForLocationItem'
import CellMoveReasonType from './interfaces/prisonApi/CellMoveReasonTypes'
import Telephone from './interfaces/prisonApi/Telephone'
import Belief from './interfaces/prisonApi/Belief'
import Reception from './interfaces/prisonApi/Reception'
import { OffenderContacts } from './interfaces/prisonApi/OffenderContact'
import PagedList, { AlertsListQueryParams } from './interfaces/prisonApi/PagedList'
import PrisonDetails from './interfaces/prisonApi/PrisonDetails'
import VisitWithVisitors from './interfaces/prisonApi/VisitWithVisitors'

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
    return this.restClient.stream({
      path: `/api/bookings/offenderNo/${offenderNumber}/image/data?fullSizeImage=${fullSizeImage}`,
    })
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

  async getAlerts(bookingId: number, queryParams?: AlertsListQueryParams): Promise<PagedList<Alert>> {
    // Set defaults then apply queryParams
    const params: AlertsListQueryParams = {
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

  // NB: This can return 404 for released prisoners
  async getAddresses(prisonerNumber: string): Promise<Address[]> {
    return this.restClient.get<Address[]>({ path: `/api/offenders/${prisonerNumber}/addresses`, ignore404: true })
  }

  async getAddressesForPerson(personId: number): Promise<Address[]> {
    return this.restClient.get<Address[]>({ path: `/api/persons/${personId}/addresses` })
  }

  async getOffenderContacts(prisonerNumber: string): Promise<OffenderContacts> {
    return this.restClient.get<OffenderContacts>({ path: `/api/offenders/${prisonerNumber}/contacts` })
  }

  async getImage(imageId: string, getFullSizedImage: boolean): Promise<Readable> {
    return this.restClient.stream({
      path: `/api/images/${imageId}/data?fullSizeImage=${getFullSizedImage}`,
    })
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

  async getAgencyDetails(agencyId: string): Promise<AgencyDetails | null> {
    return this.restClient.get<AgencyDetails>({
      path: `/api/agencies/${agencyId}?activeOnly=false`,
      ignore404: true,
    })
  }

  async getOffenderCellHistory(bookingId: number, params: object): Promise<OffenderCellHistory> {
    return this.restClient.get<OffenderCellHistory>({
      path: `/api/bookings/${bookingId}/cell-history?${mapToQueryString(params)}`,
    })
  }

  async getStaffDetails(username: string): Promise<StaffDetails> {
    return this.restClient.get<StaffDetails>({ path: `/api/users/${username}`, ignore404: true })
  }

  async getInmatesAtLocation(locationId: number, params: object): Promise<OffenderBooking[]> {
    return this.restClient.get<OffenderBooking[]>({
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
    return this.restClient.post<Alert>({
      path: `/api/bookings/${bookingId}/alert`,
      data: alert,
    })
  }

  async updateAlert(bookingId: number, alertId: number, alertChanges: AlertChanges): Promise<Alert> {
    return (await this.restClient.put({
      path: `/api/bookings/${bookingId}/alert/${alertId}`,
      data: alertChanges,
    })) as Alert
  }

  async getCsraAssessment(bookingId: number, assessmentSeq: number): Promise<CsraAssessment> {
    return this.restClient.get<CsraAssessment>({
      path: `/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`,
    })
  }

  async getCsraAssessmentsForPrisoner(prisonerNumber: string): Promise<CsraAssessmentSummary[]> {
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

  async getDetails(prisonerNumber: string, fullInfo: boolean): Promise<Details> {
    return this.restClient.get<Details>({
      path: `/api/bookings/offenderNo/${prisonerNumber}?fullInfo=${fullInfo}&csraSummary=${fullInfo}`,
    })
  }

  async getAttributesForLocation(locationId: string): Promise<AttributesForLocation> {
    return this.restClient.get<AttributesForLocation>({ path: `/api/cell/${locationId}/attributes` })
  }

  async getHistoryForLocation(locationId: string, fromDate: string, toDate: string): Promise<HistoryForLocationItem[]> {
    return this.restClient.get<HistoryForLocationItem[]>({
      path: `/api/cell/${locationId}/history?fromDate=${fromDate}&toDate=${toDate}`,
    })
  }

  async getCellMoveReasonTypes(): Promise<CellMoveReasonType[]> {
    return this.restClient.get<CellMoveReasonType[]>({ path: '/api/reference-domains/domains/CHG_HOUS_RSN' })
  }

  async getPersonEmails(personId: number): Promise<AgenciesEmail[]> {
    return this.restClient.get<AgenciesEmail[]>({
      path: `/api/persons/${personId}/emails`,
    })
  }

  async getPersonPhones(personId: number): Promise<Telephone[]> {
    return this.restClient.get<Telephone[]>({
      path: `/api/persons/${personId}/phones`,
    })
  }

  async getScheduledTransfers(prisonerNumber: string): Promise<PrisonerPrisonSchedule[]> {
    return this.restClient.get<PrisonerPrisonSchedule[]>({
      path: `/api/schedules/${prisonerNumber}/scheduled-transfers`,
      ignore404: true,
    })
  }

  async getAlertDetails(bookingId: number, alertId: number): Promise<Alert> {
    return this.restClient.get<Alert>({
      path: `/api/bookings/${bookingId}/alerts/${alertId}`,
    })
  }

  async getReceptionsWithCapacity(agencyId: string, attribute: string): Promise<Reception[]> {
    return this.restClient.get<Reception[]>({
      path: `/api/agencies/${agencyId}/receptionsWithCapacity${attribute ? `?attribute=${attribute}` : ''}`,
    })
  }

  async getBeliefHistory(prisonerNumber: string, bookingId?: number): Promise<Belief[]> {
    return this.restClient.get<Belief[]>({
      path: `/api/offenders/${prisonerNumber}/belief-history`,
      query: bookingId ? `bookingId=${bookingId}` : undefined,
    })
  }

  async getVisitsForBookingWithVisitors(_bookingId: number, _params: object): Promise<PagedList<VisitWithVisitors>> {
    return null
  }

  async getVisitsPrisons(_bookingId: number): Promise<PrisonDetails[]> {
    return null
  }
}
