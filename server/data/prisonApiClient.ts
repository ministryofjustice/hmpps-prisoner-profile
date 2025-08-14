import { Readable } from 'stream'
import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import CaseLoad from './interfaces/prisonApi/CaseLoad'
import { TransactionHistoryParams } from './interfaces/prisonApi/prisonApiClient'
import AccountBalances from './interfaces/prisonApi/AccountBalances'
import VisitSummary from './interfaces/prisonApi/VisitSummary'
import VisitBalances from './interfaces/prisonApi/VisitBalances'
import Assessment from './interfaces/prisonApi/Assessment'
import { ContactDetail } from './interfaces/prisonApi/StaffContacts'
import { mapToQueryString } from '../utils/utils'
import { CaseNoteCount } from './interfaces/prisonApi/CaseNote'
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
import CourtDateResults from './interfaces/prisonApi/CourtDateResults'
import MainOffence from './interfaces/prisonApi/MainOffence'
import FullStatus from './interfaces/prisonApi/FullStatus'
import SentenceSummary from './interfaces/prisonApi/SentenceSummary'
import OffenderIdentifier from './interfaces/prisonApi/OffenderIdentifier'
import { AgenciesEmail, AgencyDetails } from './interfaces/prisonApi/Agency'
import StaffDetails from './interfaces/prisonApi/StaffDetails'
import OffenderBooking from './interfaces/prisonApi/OffenderBooking'
import OffenderCellHistory from './interfaces/prisonApi/OffenderCellHistoryInterface'
import CsraAssessment, { CsraAssessmentSummary } from './interfaces/prisonApi/CsraAssessment'
import Transaction from './interfaces/prisonApi/Transaction'
import { DamageObligationContainer } from './interfaces/prisonApi/DamageObligation'
import Movement from './interfaces/prisonApi/Movement'
import { MovementType } from './enums/movementType'
import OffenderSentenceDetail from './interfaces/prisonApi/OffenderSentenceDetail'
import PrisonerSchedule, { PrisonerPrisonSchedule, TimeSlot } from './interfaces/prisonApi/PrisonerSchedule'
import Details from './interfaces/prisonApi/Details'
import HistoryForLocationItem from './interfaces/prisonApi/HistoryForLocationItem'
import CellMoveReasonType from './interfaces/prisonApi/CellMoveReasonTypes'
import Telephone from './interfaces/prisonApi/Telephone'
import Belief from './interfaces/prisonApi/Belief'
import Reception from './interfaces/prisonApi/Reception'
import { OffenderContacts } from './interfaces/prisonApi/OffenderContact'
import PagedList, { VisitsListQueryParams } from './interfaces/prisonApi/PagedList'
import PrisonDetails from './interfaces/prisonApi/PrisonDetails'
import VisitWithVisitors from './interfaces/prisonApi/VisitWithVisitors'
import CourtEvent from './interfaces/prisonApi/CourtEvent'
import ImageDetails from './interfaces/prisonApi/ImageDetails'
import logger from '../../logger'

export default class PrisonApiRestClient extends RestClient {
  private token: string

  constructor(token: string) {
    super('Prison API', config.apis.prisonApi, logger)
    this.token = token
  }

  async getAndIgnore404<T>(options: Parameters<typeof this.get>[0]): Promise<T> {
    return this.get<T>(
      {
        ...options,
        errorHandler: (_path, _method, error): null => {
          if (error.responseStatus === 404) return null
          throw error
        },
      },
      this.token,
    )
  }

  async getOffenderAttendanceHistory(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
  ): Promise<OffenderAttendanceHistory> {
    return this.get<OffenderAttendanceHistory>(
      {
        path: `/api/offender-activities/${prisonerNumber}/attendance-history?fromDate=${fromDate}&toDate=${toDate}&page=0&size=1000`,
      },
      this.token,
    )
  }

  async getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' }, this.token)
  }

  async getPrisonerImage(offenderNumber: string, fullSizeImage: boolean): Promise<Readable> {
    return this.stream(
      {
        path: `/api/bookings/offenderNo/${offenderNumber}/image/data?fullSizeImage=${fullSizeImage}`,
      },
      this.token,
    )
  }

  async getAccountBalances(bookingId: number): Promise<AccountBalances> {
    return this.get<AccountBalances>(
      {
        path: `/api/bookings/${bookingId}/balances`,
      },
      this.token,
    )
  }

  async getVisitSummary(bookingId: number): Promise<VisitSummary> {
    return this.get<VisitSummary>({ path: `/api/bookings/${bookingId}/visits/summary` }, this.token)
  }

  async getVisitBalances(prisonerNumber: string): Promise<VisitBalances | null> {
    return this.getAndIgnore404<VisitBalances | null>({
      path: `/api/bookings/offenderNo/${prisonerNumber}/visit/balances`,
    })
  }

  async getAssessments(bookingId: number): Promise<Assessment[]> {
    return this.get<Assessment[]>({ path: `/api/bookings/${bookingId}/assessments` }, this.token)
  }

  async getEventsScheduledForToday(bookingId: number): Promise<ScheduledEvent[]> {
    return this.get<ScheduledEvent[]>(
      {
        path: `/api/bookings/${bookingId}/events/today`,
      },
      this.token,
    )
  }

  async getBookingContacts(bookingId: number): Promise<ContactDetail> {
    try {
      return await this.get<ContactDetail>({ path: `/api/bookings/${bookingId}/contacts` }, this.token)
    } catch (error) {
      return error
    }
  }

  async getPrisoner(prisonerNumber: string): Promise<PrisonerDetail> {
    const prisoner = await this.get<PrisonerDetail>({ path: `/api/prisoners/${prisonerNumber}` }, this.token)
    // API returns array with one entry, so extract this to return a single object
    if (Array.isArray(prisoner)) {
      return prisoner[0]
    }
    return prisoner
  }

  async getInmateDetail(bookingId: number): Promise<InmateDetail> {
    return this.get<InmateDetail>({ path: `/api/bookings/${bookingId}` }, this.token)
  }

  async getPersonalCareNeeds(bookingId: number, types?: string[]): Promise<PersonalCareNeeds> {
    let query
    if (types?.length) {
      query = `type=${types.join()}`
    }
    return this.get<PersonalCareNeeds>({ path: `/api/bookings/${bookingId}/personal-care-needs`, query }, this.token)
  }

  async getAllPersonalCareNeeds(bookingId: number): Promise<PersonalCareNeeds> {
    return this.get<PersonalCareNeeds>({ path: `/api/bookings/${bookingId}/personal-care-needs/all` }, this.token)
  }

  async getOffenderActivitiesHistory(
    prisonerNumber: string,
    earliestEndDate: string,
  ): Promise<OffenderActivitiesHistory> {
    try {
      return await this.get<OffenderActivitiesHistory>(
        {
          path: `/api/offender-activities/${prisonerNumber}/activities-history?earliestEndDate=${earliestEndDate}`,
        },
        this.token,
      )
    } catch (error) {
      return error
    }
  }

  async getSecondaryLanguages(bookingId: number): Promise<SecondaryLanguage[]> {
    return this.get<SecondaryLanguage[]>({ path: `/api/bookings/${bookingId}/secondary-languages` }, this.token)
  }

  async getProperty(bookingId: number): Promise<PropertyContainer[]> {
    return this.get<PropertyContainer[]>({ path: `/api/bookings/${bookingId}/property` }, this.token)
  }

  async getCourtCases(bookingId: number): Promise<CourtCase[]> {
    return this.get<CourtCase[]>({ path: `/api/bookings/${bookingId}/court-cases` }, this.token)
  }

  async getOffenceHistory(prisonerNumber: string): Promise<OffenceHistoryDetail[]> {
    return this.get<OffenceHistoryDetail[]>(
      {
        path: `/api/bookings/offenderNo/${prisonerNumber}/offenceHistory`,
      },
      this.token,
    )
  }

  async getSentenceTerms(bookingId: number): Promise<OffenderSentenceTerms[]> {
    return this.get<OffenderSentenceTerms[]>(
      {
        path: `/api/offender-sentences/booking/${bookingId}/sentenceTerms?filterBySentenceTermCodes=IMP&filterBySentenceTermCodes=LIC`,
      },
      this.token,
    )
  }

  async getPrisonerSentenceDetails(prisonerNumber: string): Promise<PrisonerSentenceDetails> {
    try {
      return this.get<PrisonerSentenceDetails>({ path: `/api/offenders/${prisonerNumber}/sentences` }, this.token)
    } catch (error) {
      return error
    }
  }

  // NB: This can return 404 for released prisoners
  async getAddresses(prisonerNumber: string): Promise<Address[]> {
    return this.getAndIgnore404<Address[]>({ path: `/api/offenders/${prisonerNumber}/addresses` })
  }

  async getAddressesForPerson(personId: number): Promise<Address[]> {
    return this.get<Address[]>({ path: `/api/persons/${personId}/addresses` }, this.token)
  }

  async getOffenderContacts(prisonerNumber: string): Promise<OffenderContacts> {
    return this.get<OffenderContacts>({ path: `/api/offenders/${prisonerNumber}/contacts` }, this.token)
  }

  async getImage(imageId: string, getFullSizedImage: boolean): Promise<Readable> {
    return this.stream(
      {
        path: `/api/images/${imageId}/data?fullSizeImage=${getFullSizedImage}`,
      },
      this.token,
    )
  }

  async getReferenceCodesByDomain(domain: ReferenceCodeDomain | string): Promise<ReferenceCode[]> {
    return this.get<ReferenceCode[]>(
      {
        path: `/api/reference-domains/domains/${domain}`,
        headers: { 'page-limit': '1000' },
      },
      this.token,
    )
  }

  async getReasonableAdjustments(bookingId: number, treatmentCodes: string[]): Promise<ReasonableAdjustments> {
    return this.get<ReasonableAdjustments>(
      {
        path: `/api/bookings/${bookingId}/reasonable-adjustments?type=${treatmentCodes.join()}`,
      },
      this.token,
    )
  }

  async getAllReasonableAdjustments(bookingId: number): Promise<ReasonableAdjustments> {
    return this.get<ReasonableAdjustments>(
      {
        path: `/api/bookings/${bookingId}/reasonable-adjustments/all`,
      },
      this.token,
    )
  }

  async getCaseNoteCount(
    bookingId: number,
    type: string,
    subType: string,
    fromDate: string,
    toDate: string,
  ): Promise<CaseNoteCount> {
    return this.get(
      {
        path: `/api/bookings/${bookingId}/caseNotes/${type}/${subType}/count`,
        query: `fromDate=${fromDate}&toDate=${toDate}`,
      },
      this.token,
    )
  }

  async getMainOffence(bookingId: number): Promise<MainOffence[]> {
    return this.get({ path: `/api/bookings/${bookingId}/mainOffence` }, this.token)
  }

  async getFullStatus(prisonerNumber: string): Promise<FullStatus> {
    return this.get({ path: `/api/prisoners/${prisonerNumber}/full-status` }, this.token)
  }

  async getCourtDateResults(prisonerNumber: string): Promise<CourtDateResults[]> {
    return this.get<CourtDateResults[]>(
      {
        path: `/api/court-date-results/${prisonerNumber}`,
      },
      this.token,
    )
  }

  async getIdentifier(offenderId: number, seqId: number): Promise<OffenderIdentifier> {
    return this.get<OffenderIdentifier>(
      {
        path: `/api/aliases/${offenderId}/offender-identifiers/${seqId}`,
      },
      this.token,
    )
  }

  async getIdentifiers(prisonerNumber: string, includeAliases: boolean = false): Promise<OffenderIdentifier[]> {
    return this.get<OffenderIdentifier[]>(
      {
        path: `/api/offenders/${prisonerNumber}/offender-identifiers?includeAliases=${includeAliases}`,
      },
      this.token,
    )
  }

  async getSentenceSummary(prisonerNumber: string): Promise<SentenceSummary> {
    return this.get<SentenceSummary>(
      {
        path: `/api/offenders/${prisonerNumber}/booking/latest/sentence-summary`,
      },
      this.token,
    )
  }

  async hasStaffRole(staffId: number, agencyId: string, roleType: string): Promise<boolean> {
    return this.getAndIgnore404<boolean>({
      path: `/api/staff/${staffId}/${agencyId}/roles/${roleType}`,
    })
  }

  async getAgencyDetails(agencyId: string): Promise<AgencyDetails | null> {
    return this.getAndIgnore404<AgencyDetails>({
      path: `/api/agencies/${agencyId}?activeOnly=false`,
    })
  }

  async getOffenderCellHistory(
    bookingId: number,
    params: { page?: number; size?: number },
  ): Promise<OffenderCellHistory> {
    return this.get<OffenderCellHistory>(
      {
        path: `/api/bookings/${bookingId}/cell-history?${mapToQueryString(params)}`,
      },
      this.token,
    )
  }

  async getStaffDetails(username: string): Promise<StaffDetails> {
    return this.getAndIgnore404<StaffDetails>({ path: `/api/users/${username}` })
  }

  async getInmatesAtLocation(locationId: number): Promise<OffenderBooking[]> {
    return this.get<OffenderBooking[]>(
      {
        path: `/api/locations/${locationId}/inmates`,
      },
      this.token,
    )
  }

  async getCsraAssessment(bookingId: number, assessmentSeq: number): Promise<CsraAssessment> {
    return this.get<CsraAssessment>(
      {
        path: `/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`,
      },
      this.token,
    )
  }

  async getCsraAssessmentsForPrisoner(prisonerNumber: string): Promise<CsraAssessmentSummary[]> {
    return this.get<CsraAssessment[]>(
      {
        path: `/api/offender-assessments/csra/${prisonerNumber}`,
      },
      this.token,
    )
  }

  async getTransactionHistory(prisonerNumber: string, params: TransactionHistoryParams): Promise<Transaction[]> {
    return this.get<Transaction[]>(
      {
        path: `/api/offenders/${prisonerNumber}/transaction-history`,
        query: mapToQueryString(params),
      },
      this.token,
    )
  }

  async getDamageObligations(prisonerNumber: string, status?: string): Promise<DamageObligationContainer> {
    return this.get<DamageObligationContainer>(
      {
        path: `/api/offenders/${prisonerNumber}/damage-obligations`,
        query: mapToQueryString({ status: status || 'ACTIVE' }),
      },
      this.token,
    )
  }

  async getScheduledEventsForThisWeek(bookingId: number): Promise<ScheduledEvent[]> {
    return this.get<ScheduledEvent[]>({ path: `/api/bookings/${bookingId}/events/thisWeek` }, this.token)
  }

  async getScheduledEventsForNextWeek(bookingId: number): Promise<ScheduledEvent[]> {
    return this.get<ScheduledEvent[]>({ path: `/api/bookings/${bookingId}/events/nextWeek` }, this.token)
  }

  async getMovements(
    prisonerNumbers: string[],
    movementTypes: MovementType[],
    latestOnly: boolean = true,
  ): Promise<Movement[]> {
    return (await this.post(
      {
        path: `/api/movements/offenders`,
        query: mapToQueryString({ movementTypes, latestOnly }),
        data: prisonerNumbers,
      },
      this.token,
    )) as Movement[]
  }

  async getAppointmentTypes(): Promise<ReferenceCode[]> {
    return this.get<ReferenceCode[]>({ path: '/api/reference-domains/scheduleReasons?eventType=APP' }, this.token)
  }

  async getSentenceData(offenderNumbers: string[]): Promise<OffenderSentenceDetail[]> {
    return (await this.post(
      {
        path: '/api/offender-sentences',
        data: offenderNumbers,
      },
      this.token,
    )) as OffenderSentenceDetail[]
  }

  async getCourtEvents(offenderNumbers: string[], agencyId: string, date: string): Promise<PrisonerSchedule[]> {
    return (await this.post(
      {
        path: `/api/schedules/${agencyId}/courtEvents?date=${date}`,
        data: offenderNumbers,
      },
      this.token,
    )) as PrisonerSchedule[]
  }

  async getVisits(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return (await this.post(
      {
        path: `/api/schedules/${agencyId}/visits`,
        query: mapToQueryString({ date, timeSlot }),
        data: offenderNumbers,
      },
      this.token,
    )) as PrisonerSchedule[]
  }

  async getAppointments(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return (await this.post(
      {
        path: `/api/schedules/${agencyId}/appointments`,
        query: mapToQueryString({ date, timeSlot }),
        data: offenderNumbers,
      },
      this.token,
    )) as PrisonerSchedule[]
  }

  async getActivities(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return (await this.post(
      {
        path: `/api/schedules/${agencyId}/activities`,
        query: mapToQueryString({ date, timeSlot }),
        data: offenderNumbers,
      },
      this.token,
    )) as PrisonerSchedule[]
  }

  async getExternalTransfers(offenderNumbers: string[], agencyId: string, date: string): Promise<PrisonerSchedule[]> {
    return (await this.post(
      {
        path: `/api/schedules/${agencyId}/externalTransfers?date=${date}`,
        data: offenderNumbers,
      },
      this.token,
    )) as PrisonerSchedule[]
  }

  async getActivitiesAtLocation(
    locationId: number,
    date: string,
    timeSlot?: TimeSlot,
    includeSuspended = false,
  ): Promise<PrisonerSchedule[]> {
    return this.get<PrisonerSchedule[]>(
      {
        path: `/api/schedules/locations/${locationId}/activities`,
        query: mapToQueryString({ date, timeSlot, includeSuspended }),
      },
      this.token,
    )
  }

  async getActivityList(
    agencyId: string,
    locationId: number,
    usage: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return this.get<PrisonerSchedule[]>(
      {
        path: `/api/schedules/${agencyId}/locations/${locationId}/usage/${usage}`,
        query: mapToQueryString({ date, timeSlot }),
      },
      this.token,
    )
  }

  async getDetails(prisonerNumber: string, fullInfo: boolean): Promise<Details> {
    return this.get<Details>(
      {
        path: `/api/bookings/offenderNo/${prisonerNumber}?fullInfo=${fullInfo}&csraSummary=${fullInfo}`,
      },
      this.token,
    )
  }

  async getHistoryForLocation(locationId: string, fromDate: string, toDate: string): Promise<HistoryForLocationItem[]> {
    return this.get<HistoryForLocationItem[]>(
      {
        path: `/api/cell/${locationId}/history?fromDate=${fromDate}&toDate=${toDate}`,
      },
      this.token,
    )
  }

  async getCellMoveReasonTypes(): Promise<CellMoveReasonType[]> {
    return this.get<CellMoveReasonType[]>({ path: '/api/reference-domains/domains/CHG_HOUS_RSN' }, this.token)
  }

  async getPersonEmails(personId: number): Promise<AgenciesEmail[]> {
    return this.get<AgenciesEmail[]>(
      {
        path: `/api/persons/${personId}/emails`,
      },
      this.token,
    )
  }

  async getPersonPhones(personId: number): Promise<Telephone[]> {
    return this.get<Telephone[]>(
      {
        path: `/api/persons/${personId}/phones`,
      },
      this.token,
    )
  }

  async getScheduledTransfers(prisonerNumber: string): Promise<PrisonerPrisonSchedule[]> {
    return this.getAndIgnore404<PrisonerPrisonSchedule[]>({
      path: `/api/schedules/${prisonerNumber}/scheduled-transfers`,
    })
  }

  async getReceptionsWithCapacity(agencyId: string, attribute: string): Promise<Reception[]> {
    return this.get<Reception[]>(
      {
        path: `/api/agencies/${agencyId}/receptionsWithCapacity${attribute ? `?attribute=${attribute}` : ''}`,
      },
      this.token,
    )
  }

  async getBeliefHistory(prisonerNumber: string, bookingId?: number): Promise<Belief[]> {
    return this.get<Belief[]>(
      {
        path: `/api/offenders/${prisonerNumber}/belief-history`,
        query: bookingId ? `bookingId=${bookingId}` : undefined,
      },
      this.token,
    )
  }

  async getVisitsForBookingWithVisitors(
    bookingId: number,
    params: VisitsListQueryParams,
  ): Promise<PagedList<VisitWithVisitors>> {
    return this.get<PagedList<VisitWithVisitors>>(
      {
        path: `/api/bookings/${bookingId}/visits-with-visitors`,
        query: mapToQueryString(params),
      },
      this.token,
    )
  }

  async getVisitsPrisons(bookingId: number): Promise<PrisonDetails[]> {
    return this.get<PrisonDetails[]>(
      {
        path: `/api/bookings/${bookingId}/visits/prisons`,
      },
      this.token,
    )
  }

  async getNextCourtEvent(bookingId: number): Promise<CourtEvent> {
    return this.get<CourtEvent>({ path: `/api/court/${bookingId}/next-court-event` }, this.token)
  }

  async getActiveCourtCasesCount(bookingId: number): Promise<number> {
    return this.get<number>({ path: `/api/court/${bookingId}/count-active-cases` }, this.token)
  }

  async getLatestArrivalDate(prisonerNumber: string): Promise<string> {
    return this.get<string>(
      {
        path: `/api/movements/offenders/${prisonerNumber}/latest-arrival-date`,
      },
      this.token,
    )
  }

  async getImagesForPrisoner(prisonerNumber: string): Promise<ImageDetails[]> {
    return this.get<ImageDetails[]>(
      {
        path: `/api/images/offenders/${prisonerNumber}`,
      },
      this.token,
    )
  }

  async getImageDetail(imageId: number): Promise<ImageDetails> {
    return this.get<ImageDetails>(
      {
        path: `/api/images/${imageId}`,
      },
      this.token,
    )
  }
}
