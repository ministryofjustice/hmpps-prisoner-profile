import { Readable } from 'stream'
import { CaseLoad } from '../../interfaces/caseLoad'
import { NonAssociationDetails } from '../../interfaces/nonAssociationDetails'
import { AccountBalances } from '../../interfaces/accountBalances'
import { AdjudicationSummary } from '../../interfaces/adjudicationSummary'
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
import { PagedListQueryParams, PagedList } from '../../interfaces/prisonApi/pagedList'
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

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getNonAssociationDetails(prisonerNumber: string): Promise<NonAssociationDetails>
  getAccountBalances(bookingId: number): Promise<AccountBalances>
  getAdjudications(bookingId: number): Promise<AdjudicationSummary>
  getVisitSummary(bookingId: number): Promise<VisitSummary>
  getVisitBalances(prisonerNumber: string): Promise<VisitBalances>
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
  getAlerts(bookingId: number, queryParams: PagedListQueryParams): Promise<PagedList>
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
}
