import { Readable } from 'stream'
import CircuitBreaker from 'opossum'
import config from '../config'
import { PrisonApiClient, TransactionHistoryParams } from './interfaces/prisonApi/prisonApiClient'
import AccountBalances from './interfaces/prisonApi/AccountBalances'
import VisitSummary from './interfaces/prisonApi/VisitSummary'
import VisitBalances from './interfaces/prisonApi/VisitBalances'
import Assessment from './interfaces/prisonApi/Assessment'
import { ContactDetail } from './interfaces/prisonApi/StaffContacts'
import { mapToQueryString } from '../utils/utils'
import ScheduledEvent from './interfaces/prisonApi/ScheduledEvent'
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
import OffenderSentenceDetail from './interfaces/prisonApi/OffenderSentenceDetail'
import PrisonerSchedule, { PrisonerPrisonSchedule, TimeSlot } from './interfaces/prisonApi/PrisonerSchedule'
import HistoryForLocationItem from './interfaces/prisonApi/HistoryForLocationItem'
import CellMoveReasonType from './interfaces/prisonApi/CellMoveReasonTypes'
import Telephone, { AddressPhoneNumberRequest } from './interfaces/prisonApi/Telephone'
import Belief from './interfaces/prisonApi/Belief'
import Reception from './interfaces/prisonApi/Reception'
import { OffenderContacts } from './interfaces/prisonApi/OffenderContact'
import PagedList, { VisitsListQueryParams } from './interfaces/prisonApi/PagedList'
import PrisonDetails from './interfaces/prisonApi/PrisonDetails'
import VisitWithVisitors from './interfaces/prisonApi/VisitWithVisitors'
import CourtEvent from './interfaces/prisonApi/CourtEvent'
import ImageDetails from './interfaces/prisonApi/ImageDetails'
import RestClient, { Request } from './restClient'

export default class PrisonApiRestClient extends RestClient implements PrisonApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Prison API', config.apis.prisonApi, token, circuitBreaker)
  }

  getOffenderAttendanceHistory(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
  ): Promise<OffenderAttendanceHistory> {
    return this.get(
      {
        path: `/api/offender-activities/${prisonerNumber}/attendance-history?fromDate=${fromDate}&toDate=${toDate}&page=0&size=1000`,
      },
      this.token,
    )
  }

  getPrisonerImage(offenderNumber: string, fullSizeImage: boolean): Promise<Readable> {
    return this.stream(
      {
        path: `/api/bookings/offenderNo/${offenderNumber}/image/data?fullSizeImage=${fullSizeImage}`,
      },
      this.token,
    )
  }

  getAccountBalances(bookingId: number): Promise<AccountBalances> {
    return this.get(
      {
        path: `/api/bookings/${bookingId}/balances`,
      },
      this.token,
    )
  }

  getVisitSummary(bookingId: number): Promise<VisitSummary> {
    return this.get({ path: `/api/bookings/${bookingId}/visits/summary` }, this.token)
  }

  getVisitBalances(prisonerNumber: string): Promise<VisitBalances | null> {
    return this.getAndIgnore404({
      path: `/api/bookings/offenderNo/${prisonerNumber}/visit/balances`,
    })
  }

  getAssessments(bookingId: number): Promise<Assessment[]> {
    return this.get({ path: `/api/bookings/${bookingId}/assessments` }, this.token)
  }

  getEventsScheduledForToday(bookingId: number): Promise<ScheduledEvent[]> {
    return this.get(
      {
        path: `/api/bookings/${bookingId}/events/today`,
      },
      this.token,
    )
  }

  getBookingContacts(bookingId: number): Promise<ContactDetail> {
    return this.get({ path: `/api/bookings/${bookingId}/contacts` }, this.token)
  }

  async getInmateDetail(bookingId: number): Promise<InmateDetail> {
    const detail = await this.get<InmateDetail>({ path: `/api/bookings/${bookingId}` }, this.token)
    return detail?.physicalAttributes?.ethnicity === 'Prefer not to say'
      ? {
          ...detail,
          physicalAttributes: {
            ...detail.physicalAttributes,
            ethnicity: 'They prefer not to say',
          },
        }
      : detail
  }

  getPersonalCareNeeds(bookingId: number, types?: string[]): Promise<PersonalCareNeeds> {
    let query
    if (types?.length) {
      query = `type=${types.join()}`
    }
    return this.get({ path: `/api/bookings/${bookingId}/personal-care-needs`, query }, this.token)
  }

  getAllPersonalCareNeeds(bookingId: number): Promise<PersonalCareNeeds> {
    return this.get({ path: `/api/bookings/${bookingId}/personal-care-needs/all` }, this.token)
  }

  getOffenderActivitiesHistory(prisonerNumber: string, earliestEndDate: string): Promise<OffenderActivitiesHistory> {
    return this.get(
      {
        path: `/api/offender-activities/${prisonerNumber}/activities-history?earliestEndDate=${earliestEndDate}`,
      },
      this.token,
    )
  }

  getSecondaryLanguages(bookingId: number): Promise<SecondaryLanguage[]> {
    return this.get({ path: `/api/bookings/${bookingId}/secondary-languages` }, this.token)
  }

  getProperty(bookingId: number): Promise<PropertyContainer[]> {
    return this.get({ path: `/api/bookings/${bookingId}/property` }, this.token)
  }

  getCourtCases(bookingId: number): Promise<CourtCase[]> {
    return this.get({ path: `/api/bookings/${bookingId}/court-cases` }, this.token)
  }

  getOffenceHistory(prisonerNumber: string): Promise<OffenceHistoryDetail[]> {
    return this.get(
      {
        path: `/api/bookings/offenderNo/${prisonerNumber}/offenceHistory`,
      },
      this.token,
    )
  }

  getSentenceTerms(bookingId: number): Promise<OffenderSentenceTerms[]> {
    return this.get(
      {
        path: `/api/offender-sentences/booking/${bookingId}/sentenceTerms?filterBySentenceTermCodes=IMP&filterBySentenceTermCodes=LIC`,
      },
      this.token,
    )
  }

  getPrisonerSentenceDetails(prisonerNumber: string): Promise<PrisonerSentenceDetails> {
    return this.get({ path: `/api/offenders/${prisonerNumber}/sentences` }, this.token)
  }

  // NB: This can return 404 for released prisoners
  getAddresses(prisonerNumber: string): Promise<Address[] | null> {
    return this.getAndIgnore404({ path: `/api/offenders/${prisonerNumber}/addresses` })
  }

  addAddressPhoneNumbers(
    prisonerNumber: string,
    addressId: number,
    phoneNumbers: AddressPhoneNumberRequest[],
  ): Promise<Telephone[]> {
    return this.post(
      {
        path: `/api/offenders/${prisonerNumber}/addresses/${addressId}/phone-numbers`,
        data: phoneNumbers,
      },
      this.token,
    )
  }

  updateAddressPhoneNumber(
    prisonerNumber: string,
    addressId: number,
    phoneId: number,
    phoneNumber: AddressPhoneNumberRequest,
  ): Promise<Telephone> {
    return this.put(
      {
        path: `/api/offenders/${prisonerNumber}/addresses/${addressId}/phone-numbers/${phoneId}`,
        data: phoneNumber,
      },
      this.token,
    )
  }

  getAddressesForPerson(personId: number): Promise<Address[]> {
    return this.get({ path: `/api/persons/${personId}/addresses` }, this.token)
  }

  getOffenderContacts(prisonerNumber: string): Promise<OffenderContacts> {
    return this.get({ path: `/api/offenders/${prisonerNumber}/contacts` }, this.token)
  }

  getImage(imageId: string, getFullSizedImage: boolean): Promise<Readable> {
    return this.stream(
      {
        path: `/api/images/${imageId}/data?fullSizeImage=${getFullSizedImage}`,
      },
      this.token,
    )
  }

  getReferenceCodesByDomain(domain: ReferenceCodeDomain | string): Promise<ReferenceCode[]> {
    return this.get(
      {
        path: `/api/reference-domains/domains/${domain}`,
        headers: { 'page-limit': '1000' },
      },
      this.token,
    )
  }

  getReasonableAdjustments(bookingId: number, treatmentCodes: string[]): Promise<ReasonableAdjustments> {
    return this.get(
      {
        path: `/api/bookings/${bookingId}/reasonable-adjustments?type=${treatmentCodes.join()}`,
      },
      this.token,
    )
  }

  getAllReasonableAdjustments(bookingId: number): Promise<ReasonableAdjustments> {
    return this.get(
      {
        path: `/api/bookings/${bookingId}/reasonable-adjustments/all`,
      },
      this.token,
    )
  }

  getMainOffence(bookingId: number): Promise<MainOffence[]> {
    return this.get({ path: `/api/bookings/${bookingId}/mainOffence` }, this.token)
  }

  getFullStatus(prisonerNumber: string): Promise<FullStatus> {
    return this.get({ path: `/api/prisoners/${prisonerNumber}/full-status` }, this.token)
  }

  getCourtDateResults(prisonerNumber: string): Promise<CourtDateResults[]> {
    return this.get(
      {
        path: `/api/court-date-results/${prisonerNumber}`,
      },
      this.token,
    )
  }

  getIdentifier(offenderId: number, seqId: number): Promise<OffenderIdentifier> {
    return this.get(
      {
        path: `/api/aliases/${offenderId}/offender-identifiers/${seqId}`,
      },
      this.token,
    )
  }

  getIdentifiers(prisonerNumber: string, includeAliases: boolean = false): Promise<OffenderIdentifier[]> {
    return this.get(
      {
        path: `/api/offenders/${prisonerNumber}/offender-identifiers?includeAliases=${includeAliases}`,
      },
      this.token,
    )
  }

  getSentenceSummary(prisonerNumber: string): Promise<SentenceSummary> {
    return this.get(
      {
        path: `/api/offenders/${prisonerNumber}/booking/latest/sentence-summary`,
      },
      this.token,
    )
  }

  getAgencyDetails(agencyId: string): Promise<AgencyDetails | null> {
    return this.getAndIgnore404({
      path: `/api/agencies/${agencyId}?activeOnly=false`,
    })
  }

  getOffenderCellHistory(bookingId: number, params: { page?: number; size?: number }): Promise<OffenderCellHistory> {
    return this.get(
      {
        path: `/api/bookings/${bookingId}/cell-history?${mapToQueryString(params)}`,
      },
      this.token,
    )
  }

  getStaffDetails(username: string): Promise<StaffDetails | null> {
    return this.getAndIgnore404({ path: `/api/users/${username}` })
  }

  getInmatesAtLocation(locationId: number): Promise<OffenderBooking[]> {
    return this.get(
      {
        path: `/api/locations/${locationId}/inmates`,
      },
      this.token,
    )
  }

  getCsraAssessment(bookingId: number, assessmentSeq: number): Promise<CsraAssessment> {
    return this.get(
      {
        path: `/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`,
      },
      this.token,
    )
  }

  getCsraAssessmentsForPrisoner(prisonerNumber: string): Promise<CsraAssessmentSummary[]> {
    return this.get<CsraAssessment[]>(
      {
        path: `/api/offender-assessments/csra/${prisonerNumber}`,
      },
      this.token,
    )
  }

  getTransactionHistory(prisonerNumber: string, params: TransactionHistoryParams): Promise<Transaction[]> {
    return this.get(
      {
        path: `/api/offenders/${prisonerNumber}/transaction-history`,
        query: mapToQueryString(params),
      },
      this.token,
    )
  }

  getDamageObligations(prisonerNumber: string, status?: string): Promise<DamageObligationContainer> {
    return this.get(
      {
        path: `/api/offenders/${prisonerNumber}/damage-obligations`,
        query: mapToQueryString({ status: status || 'ACTIVE' }),
      },
      this.token,
    )
  }

  getScheduledEventsForThisWeek(bookingId: number): Promise<ScheduledEvent[]> {
    return this.get({ path: `/api/bookings/${bookingId}/events/thisWeek` }, this.token)
  }

  getScheduledEventsForNextWeek(bookingId: number): Promise<ScheduledEvent[]> {
    return this.get({ path: `/api/bookings/${bookingId}/events/nextWeek` }, this.token)
  }

  getAppointmentTypes(): Promise<ReferenceCode[]> {
    return this.get({ path: '/api/reference-domains/scheduleReasons?eventType=APP' }, this.token)
  }

  getSentenceData(offenderNumbers: string[]): Promise<OffenderSentenceDetail[]> {
    return this.post(
      {
        path: '/api/offender-sentences',
        data: offenderNumbers,
      },
      this.token,
    )
  }

  getCourtEvents(offenderNumbers: string[], agencyId: string, date: string): Promise<PrisonerSchedule[]> {
    return this.post(
      {
        path: `/api/schedules/${agencyId}/courtEvents?date=${date}`,
        data: offenderNumbers,
      },
      this.token,
    )
  }

  getVisits(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return this.post(
      {
        path: `/api/schedules/${agencyId}/visits`,
        query: mapToQueryString({ date, timeSlot }),
        data: offenderNumbers,
      },
      this.token,
    )
  }

  getAppointments(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return this.post(
      {
        path: `/api/schedules/${agencyId}/appointments`,
        query: mapToQueryString({ date, timeSlot }),
        data: offenderNumbers,
      },
      this.token,
    )
  }

  getActivities(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return this.post(
      {
        path: `/api/schedules/${agencyId}/activities`,
        query: mapToQueryString({ date, timeSlot }),
        data: offenderNumbers,
      },
      this.token,
    )
  }

  getExternalTransfers(offenderNumbers: string[], agencyId: string, date: string): Promise<PrisonerSchedule[]> {
    return this.post(
      {
        path: `/api/schedules/${agencyId}/externalTransfers?date=${date}`,
        data: offenderNumbers,
      },
      this.token,
    )
  }

  getActivitiesAtLocation(
    locationId: number,
    date: string,
    timeSlot?: TimeSlot,
    includeSuspended = false,
  ): Promise<PrisonerSchedule[]> {
    return this.get(
      {
        path: `/api/schedules/locations/${locationId}/activities`,
        query: mapToQueryString({ date, timeSlot, includeSuspended }),
      },
      this.token,
    )
  }

  getActivityList(
    agencyId: string,
    locationId: number,
    usage: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]> {
    return this.get(
      {
        path: `/api/schedules/${agencyId}/locations/${locationId}/usage/${usage}`,
        query: mapToQueryString({ date, timeSlot }),
      },
      this.token,
    )
  }

  getHistoryForLocation(locationId: string, fromDate: string, toDate: string): Promise<HistoryForLocationItem[]> {
    return this.get(
      {
        path: `/api/cell/${locationId}/history?fromDate=${fromDate}&toDate=${toDate}`,
      },
      this.token,
    )
  }

  getCellMoveReasonTypes(): Promise<CellMoveReasonType[]> {
    return this.get({ path: '/api/reference-domains/domains/CHG_HOUS_RSN' }, this.token)
  }

  getPersonEmails(personId: number): Promise<AgenciesEmail[]> {
    return this.get(
      {
        path: `/api/persons/${personId}/emails`,
      },
      this.token,
    )
  }

  getPersonPhones(personId: number): Promise<Telephone[]> {
    return this.get(
      {
        path: `/api/persons/${personId}/phones`,
      },
      this.token,
    )
  }

  getScheduledTransfers(prisonerNumber: string): Promise<PrisonerPrisonSchedule[] | null> {
    return this.getAndIgnore404({
      path: `/api/schedules/${prisonerNumber}/scheduled-transfers`,
    })
  }

  getReceptionsWithCapacity(agencyId: string, attribute: string): Promise<Reception[]> {
    return this.get(
      {
        path: `/api/agencies/${agencyId}/receptionsWithCapacity${attribute ? `?attribute=${attribute}` : ''}`,
      },
      this.token,
    )
  }

  getBeliefHistory(prisonerNumber: string): Promise<Belief[]> {
    return this.get(
      {
        path: `/api/offenders/${prisonerNumber}/belief-history`,
      },
      this.token,
    )
  }

  getVisitsForBookingWithVisitors(
    bookingId: number,
    params: VisitsListQueryParams,
  ): Promise<PagedList<VisitWithVisitors>> {
    return this.get(
      {
        path: `/api/bookings/${bookingId}/visits-with-visitors`,
        query: mapToQueryString(params),
      },
      this.token,
    )
  }

  getVisitsPrisons(bookingId: number): Promise<PrisonDetails[]> {
    return this.get(
      {
        path: `/api/bookings/${bookingId}/visits/prisons`,
      },
      this.token,
    )
  }

  getNextCourtEvent(bookingId: number): Promise<CourtEvent> {
    return this.get({ path: `/api/court/${bookingId}/next-court-event` }, this.token)
  }

  getActiveCourtCasesCount(bookingId: number): Promise<number> {
    return this.get({ path: `/api/court/${bookingId}/count-active-cases` }, this.token)
  }

  getLatestArrivalDate(prisonerNumber: string): Promise<string> {
    return this.get(
      {
        path: `/api/movements/offenders/${prisonerNumber}/latest-arrival-date`,
      },
      this.token,
    )
  }

  getImagesForPrisoner(prisonerNumber: string): Promise<ImageDetails[]> {
    return this.get(
      {
        path: `/api/images/offenders/${prisonerNumber}`,
      },
      this.token,
    )
  }

  getImageDetail(imageId: number): Promise<ImageDetails> {
    return this.get(
      {
        path: `/api/images/${imageId}`,
      },
      this.token,
    )
  }
}
