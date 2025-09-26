import { Readable } from 'stream'
import CaseLoad from './CaseLoad'
import AccountBalances from './AccountBalances'
import VisitSummary from './VisitSummary'
import VisitBalances from './VisitBalances'
import Assessment from './Assessment'
import { ContactDetail } from './StaffContacts'
import ScheduledEvent from './ScheduledEvent'
import PrisonerDetail from './PrisonerDetail'
import InmateDetail from './InmateDetail'
import PersonalCareNeeds from './PersonalCareNeeds'
import OffenderActivitiesHistory from './OffenderActivitiesHistory'
import OffenderAttendanceHistory from './OffenderAttendanceHistory'
import SecondaryLanguage from './SecondaryLanguage'
import PropertyContainer from './PropertyContainer'
import CourtCase from './CourtCase'
import OffenderSentenceTerms from './OffenderSentenceTerms'
import OffenceHistoryDetail from './OffenceHistoryDetail'
import PrisonerSentenceDetails from './PrisonerSentenceDetails'
import Address from './Address'
import ReferenceCode, { ReferenceCodeDomain } from './ReferenceCode'
import { ReasonableAdjustments } from './ReasonableAdjustment'
import CourtDateResults from './CourtDateResults'
import MainOffence from './MainOffence'
import FullStatus from './FullStatus'
import SentenceSummary from './SentenceSummary'
import OffenderIdentifier from './OffenderIdentifier'
import { AgenciesEmail, AgencyDetails } from './Agency'
import OffenderCellHistory from './OffenderCellHistoryInterface'
import StaffDetails from './StaffDetails'
import OffenderBooking from './OffenderBooking'
import CsraAssessment, { CsraAssessmentSummary } from './CsraAssessment'
import Transaction from './Transaction'
import { DamageObligationContainer } from './DamageObligation'
import Movement from './Movement'
import { MovementType } from '../../enums/movementType'
import OffenderSentenceDetail from './OffenderSentenceDetail'
import PrisonerSchedule, { PrisonerPrisonSchedule, TimeSlot } from './PrisonerSchedule'
import Details from './Details'
import HistoryForLocationItem from './HistoryForLocationItem'
import CellMoveReasonType from './CellMoveReasonTypes'
import Telephone from './Telephone'
import Belief from './Belief'
import Reception from './Reception'
import { OffenderContacts } from './OffenderContact'
import PagedList, { VisitsListQueryParams } from './PagedList'
import VisitWithVisitors from './VisitWithVisitors'
import PrisonDetails from './PrisonDetails'
import CourtEvent from './CourtEvent'
import { QueryParams } from '../../../interfaces/QueryParams'
import ImageDetails from './ImageDetails'

export interface CaseNoteSummaryByTypesParams extends QueryParams {
  type: string
  subType: string
  numMonths: number
  bookingId: number
}

export interface TransactionHistoryParams extends QueryParams {
  account_code: string
  from_date?: string
  to_date?: string
  transaction_type?: string
}

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>

  getAccountBalances(bookingId: number): Promise<AccountBalances>

  getVisitSummary(bookingId: number): Promise<VisitSummary>

  getVisitBalances(prisonerNumber: string): Promise<VisitBalances | null>

  getAssessments(bookingId: number): Promise<Assessment[]>

  getBookingContacts(bookingId: number): Promise<ContactDetail>

  getEventsScheduledForToday(bookingId: number): Promise<ScheduledEvent[]>

  getPrisoner(prisonerNumber: string): Promise<PrisonerDetail>

  getInmateDetail(bookingId: number): Promise<InmateDetail>

  getPersonalCareNeeds(bookingId: number, types?: string[]): Promise<PersonalCareNeeds>
  getAllPersonalCareNeeds(bookingId: number): Promise<PersonalCareNeeds>

  getOffenderActivitiesHistory(prisonerNumber: string, earliestEndDate: string): Promise<OffenderActivitiesHistory>

  getOffenderAttendanceHistory(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
  ): Promise<OffenderAttendanceHistory>

  getSecondaryLanguages(bookingId: number): Promise<SecondaryLanguage[]>

  getProperty(bookingId: number): Promise<PropertyContainer[]>

  getCourtCases(bookingId: number): Promise<CourtCase[]>

  getOffenceHistory(prisonerNumber: string): Promise<OffenceHistoryDetail[]>

  getSentenceTerms(bookingId: number): Promise<OffenderSentenceTerms[]>

  getPrisonerSentenceDetails(prisonerNumber: string): Promise<PrisonerSentenceDetails>

  getAddresses(prisonerNumber: string): Promise<Address[] | null>

  getAddressesForPerson(personId: number): Promise<Address[]>

  getOffenderContacts(prisonerNumber: string): Promise<OffenderContacts>

  getPrisonerImage(offenderNumber: string, fullSizeImage: boolean): Promise<Readable>

  getImage(imageId: string, getFullSizedImage: boolean): Promise<Readable>

  getReferenceCodesByDomain(domain: ReferenceCodeDomain | string): Promise<ReferenceCode[]>

  getAllReasonableAdjustments(bookingId: number): Promise<ReasonableAdjustments>

  getMainOffence(bookingId: number): Promise<MainOffence[]>

  getFullStatus(prisonerNumber: string): Promise<FullStatus>

  getCourtDateResults(offenderNumber: string): Promise<CourtDateResults[]>

  getSentenceSummary(prisonerNumber: string): Promise<SentenceSummary>

  getIdentifier(offenderId: number, seqId: number): Promise<OffenderIdentifier>

  getIdentifiers(prisonerNumber: string, includeAliases: boolean): Promise<OffenderIdentifier[]>

  hasStaffRole(staffId: number, agencyId: string, roleType: string): Promise<boolean | null>

  getAgencyDetails(agencyId: string): Promise<AgencyDetails | null>

  getOffenderCellHistory(bookingId: number, params: { page?: number; size?: number }): Promise<OffenderCellHistory>

  getReceptionsWithCapacity(agencyId: string, attribute?: string): Promise<Reception[]>

  getStaffDetails(username: string): Promise<StaffDetails | null>

  getInmatesAtLocation(locationId: number, params: object): Promise<OffenderBooking[]>

  getScheduledEventsForThisWeek(bookingId: number): Promise<ScheduledEvent[]>

  getScheduledEventsForNextWeek(bookingId: number): Promise<ScheduledEvent[]>

  getCsraAssessment(bookingId: number, assessmentSeq: number): Promise<CsraAssessment>

  getCsraAssessmentsForPrisoner(prisonerNumber: string): Promise<CsraAssessmentSummary[]>

  getTransactionHistory(prisonerNumber: string, params: TransactionHistoryParams): Promise<Transaction[]>

  getDamageObligations(prisonerNumber: string, status?: string): Promise<DamageObligationContainer>

  getMovements(prisonerNumbers: string[], movementTypes: MovementType[], latestOnly?: boolean): Promise<Movement[]>

  getAppointmentTypes(): Promise<ReferenceCode[]>

  getSentenceData(offenderNumbers: string[]): Promise<OffenderSentenceDetail[]>

  getCourtEvents(offenderNumbers: string[], agencyId: string, date: string): Promise<PrisonerSchedule[]>

  getVisits(offenderNumbers: string[], agencyId: string, date: string, timeSlot?: TimeSlot): Promise<PrisonerSchedule[]>

  getAppointments(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]>

  getActivities(
    offenderNumbers: string[],
    agencyId: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]>

  getExternalTransfers(offenderNumbers: string[], agencyId: string, date: string): Promise<PrisonerSchedule[]>

  getActivitiesAtLocation(
    locationId: number,
    date: string,
    timeSlot?: TimeSlot,
    includeSuspended?: boolean,
  ): Promise<PrisonerSchedule[]>

  getActivityList(
    agencyId: string,
    locationId: number,
    usage: string,
    date: string,
    timeSlot?: TimeSlot,
  ): Promise<PrisonerSchedule[]>

  getDetails(prisonerNumber: string, fullInfo: boolean): Promise<Details>

  getHistoryForLocation(locationId: string, fromDate: string, toDate: string): Promise<HistoryForLocationItem[]>

  getCellMoveReasonTypes(): Promise<CellMoveReasonType[]>

  getPersonEmails(personId: number): Promise<AgenciesEmail[]>

  getPersonPhones(personId: number): Promise<Telephone[]>

  getScheduledTransfers(prisonerNumber: string): Promise<PrisonerPrisonSchedule[] | null>

  getBeliefHistory(prisonerNumber: string, bookingId?: number): Promise<Belief[]>

  getVisitsForBookingWithVisitors(
    bookingId: number,
    params: VisitsListQueryParams,
  ): Promise<PagedList<VisitWithVisitors>>

  getVisitsPrisons(bookingId: number): Promise<PrisonDetails[]>

  getNextCourtEvent(bookingId: number): Promise<CourtEvent>

  getActiveCourtCasesCount(bookingId: number): Promise<number>

  getLatestArrivalDate(prisonerNumber: string): Promise<string>

  getImagesForPrisoner(prisonerNumber: string): Promise<ImageDetails[]>

  getImageDetail(imageId: number): Promise<ImageDetails>
}
