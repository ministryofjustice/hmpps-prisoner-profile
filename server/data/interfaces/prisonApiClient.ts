import { Readable } from 'stream'
import { CaseLoad } from '../../interfaces/caseLoad'
import { AccountBalances } from '../../interfaces/accountBalances'
import { VisitSummary } from '../../interfaces/visitSummary'
import { VisitBalances } from '../../interfaces/visitBalances'
import { Assessment } from '../../interfaces/prisonApi/assessment'
import { ContactDetail } from '../../interfaces/staffContacts'
import { CaseNote } from '../../interfaces/caseNote'
import { ScheduledEvent } from '../../interfaces/scheduledEvent'
import { PrisonerDetail } from '../../interfaces/prisonerDetail'
import { InmateDetail } from '../../interfaces/prisonApi/inmateDetail'
import { PersonalCareNeeds } from '../../interfaces/personalCareNeeds'
import { OffenderActivitiesHistory } from '../../interfaces/offenderActivitiesHistory'
import { OffenderAttendanceHistory } from '../../interfaces/offenderAttendanceHistory'
import { SecondaryLanguage } from '../../interfaces/prisonApi/secondaryLanguage'
import { PagedList, PagedListQueryParams } from '../../interfaces/prisonApi/pagedList'
import { PropertyContainer } from '../../interfaces/prisonApi/propertyContainer'
import { CourtCase } from '../../interfaces/prisonApi/courtCase'
import { OffenderSentenceTerms } from '../../interfaces/prisonApi/offenderSentenceTerms'
import { OffenceHistoryDetail } from '../../interfaces/prisonApi/offenceHistoryDetail'
import { PrisonerSentenceDetails } from '../../interfaces/prisonerSentenceDetails'
import { Address } from '../../interfaces/prisonApi/address'
import { OffenderContacts } from '../../interfaces/prisonApi/offenderContacts'
import { ReferenceCode, ReferenceCodeDomain } from '../../interfaces/prisonApi/referenceCode'
import { ReasonableAdjustments } from '../../interfaces/prisonApi/reasonableAdjustment'
import { CaseNoteUsage } from '../../interfaces/prisonApi/caseNoteUsage'
import { CaseNoteCount } from '../../interfaces/prisonApi/caseNoteCount'
import { CourtDateResults } from '../../interfaces/courtDateResults'
import { MainOffence } from '../../interfaces/prisonApi/mainOffence'
import { FullStatus } from '../../interfaces/prisonApi/fullStatus'
import { SentenceSummary } from '../../interfaces/prisonApi/sentenceSummary'
import { OffenderIdentifier } from '../../interfaces/prisonApi/offenderIdentifier'
import { StaffRole } from '../../interfaces/prisonApi/staffRole'
import { AgenciesEmail, AgencyLocationDetails } from '../../interfaces/prisonApi/agencies'
import { OffenderCellHistory } from '../../interfaces/prisonApi/offenderCellHistoryInterface'
import { StaffDetails } from '../../interfaces/prisonApi/staffDetails'
import { OffenderBooking } from '../../interfaces/prisonApi/offenderBooking'
import { Alert, AlertForm, AlertType } from '../../interfaces/prisonApi/alert'
import { CsraAssessment } from '../../interfaces/prisonApi/csraAssessment'
import { Transaction } from '../../interfaces/prisonApi/transaction'
import { DamageObligationContainer } from '../../interfaces/prisonApi/damageObligation'
import { Movement } from '../../interfaces/prisonApi/movement'
import { MovementType } from '../enums/movementType'
import { OffenderSentenceDetail } from '../../interfaces/prisonApi/offenderSentenceDetail'
import { PrisonerPrisonSchedule, PrisonerSchedule, TimeSlot } from '../../interfaces/prisonApi/prisonerSchedule'
import { Location } from '../../interfaces/prisonApi/location'
import { Telephone } from '../../interfaces/prisonApi/telephone'

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getAccountBalances(bookingId: number): Promise<AccountBalances>
  getVisitSummary(bookingId: number): Promise<VisitSummary>
  getVisitBalances(prisonerNumber: string): Promise<VisitBalances | null>
  getAssessments(bookingId: number): Promise<Assessment[]>
  getBookingContacts(bookingId: number): Promise<ContactDetail>
  getCaseNoteSummaryByTypes(params: object): Promise<CaseNote[]>
  getEventsScheduledForToday(bookingId: number): Promise<ScheduledEvent[]>
  getPrisoner(prisonerNumber: string): Promise<PrisonerDetail>
  getInmateDetail(bookingId: number): Promise<InmateDetail>
  getPersonalCareNeeds(bookingId: number, types?: string[]): Promise<PersonalCareNeeds>
  getOffenderActivitiesHistory(prisonerNumber: string, earliestEndDate: string): Promise<OffenderActivitiesHistory>
  getOffenderAttendanceHistory(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
  ): Promise<OffenderAttendanceHistory>
  getSecondaryLanguages(bookingId: number): Promise<SecondaryLanguage[]>
  getAlerts(bookingId: number, queryParams: PagedListQueryParams): Promise<PagedList<Alert>>
  getProperty(bookingId: number): Promise<PropertyContainer[]>
  getCourtCases(bookingId: number): Promise<CourtCase[]>
  getOffenceHistory(prisonerNumber: string): Promise<OffenceHistoryDetail[]>
  getSentenceTerms(bookingId: number): Promise<OffenderSentenceTerms[]>
  getPrisonerSentenceDetails(prisonerNumber: string): Promise<PrisonerSentenceDetails>
  getAddresses(prisonerNumber: string): Promise<Address[]>
  getAddressesForPerson(personId: number): Promise<Address[]>
  getOffenderContacts(prisonerNumber: string): Promise<OffenderContacts>
  getPrisonerImage(offenderNumber: string, fullSizeImage: boolean): Promise<Readable>
  getImage(imageId: string, getFullSizedImage: boolean): Promise<Readable>
  getReferenceCodesByDomain(domain: ReferenceCodeDomain): Promise<ReferenceCode[]>
  getReasonableAdjustments(bookingId: number, treatmentCodes: string[]): Promise<ReasonableAdjustments>
  getCaseNotesUsage(offenderNumber: string): Promise<CaseNoteUsage[]>
  getCaseNoteCount(
    bookingId: number,
    type: string,
    subType: string,
    fromDate: string,
    toDate: string,
  ): Promise<CaseNoteCount>
  getMainOffence(bookingId: number): Promise<MainOffence[]>
  getFullStatus(prisonerNumber: string): Promise<FullStatus>
  getCourtDateResults(offenderNumber: string): Promise<CourtDateResults[]>
  getSentenceSummary(prisonerNumber: string): Promise<SentenceSummary>
  getIdentifiers(bookingId: number): Promise<OffenderIdentifier[]>
  getStaffRoles(staffId: number, agencyId: string): Promise<StaffRole[]>
  getAgencyDetails(agencyId: string): Promise<AgencyLocationDetails>
  getOffenderCellHistory(bookingId: number, params: object): Promise<OffenderCellHistory>
  getStaffDetails(staffId: string): Promise<StaffDetails>
  getInmatesAtLocation(locationId: number, params: object): Promise<OffenderBooking[]>
  getAlertTypes(): Promise<AlertType[]>
  createAlert(bookingId: number, alert: AlertForm): Promise<Alert>
  getScheduledEventsForThisWeek(bookingId: number): Promise<ScheduledEvent[]>
  getScheduledEventsForNextWeek(bookingId: number): Promise<ScheduledEvent[]>
  getCsraAssessment(bookingId: number, assessmentSeq: number): Promise<CsraAssessment>
  getCsraAssessmentsForPrisoner(prisonerNumber: string): Promise<CsraAssessment[]>
  getTransactionHistory(prisonerNumber: string, params: object): Promise<Transaction[]>
  getDamageObligations(prisonerNumber: string, status?: string): Promise<DamageObligationContainer>
  getMovements(prisonerNumbers: string[], movementTypes: MovementType[], latestOnly?: boolean): Promise<Movement[]>
  getLocationsForAppointments(agencyId: string): Promise<Location[]>
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
  getLocation(locationId: number): Promise<Location>
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
  getPersonEmails(personId: number): Promise<AgenciesEmail[]>
  getPersonPhones(personId: number): Promise<Telephone[]>
  getScheduledTransfers(prisonerNumber: string): Promise<PrisonerPrisonSchedule[]>
  getAlertDetails(bookingId: number, alertId: number): Promise<Alert>
}
