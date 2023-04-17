import { CaseLoad } from '../../interfaces/caseLoad'
import { Location } from '../../interfaces/location'
import { NonAssociationDetails } from '../../interfaces/nonAssociationDetails'
import { AccountBalances } from '../../interfaces/accountBalances'
import { AdjudicationSummary } from '../../interfaces/adjudicationSummary'
import { VisitSummary } from '../../interfaces/visitSummary'
import { VisitBalances } from '../../interfaces/visitBalances'
import { Assessment } from '../../interfaces/prisonApi/assessment'
import { OffenderContact } from '../../interfaces/staffContacts'
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

export interface PrisonApiClient {
  getUserLocations(): Promise<Location[]>
  getUserCaseLoads(): Promise<CaseLoad[]>
  getNonAssociationDetails(prisonerNumber: string): Promise<NonAssociationDetails>
  getAccountBalances(bookingId: number): Promise<AccountBalances>
  getAdjudications(bookingId: number): Promise<AdjudicationSummary>
  getVisitSummary(bookingId: number): Promise<VisitSummary>
  getVisitBalances(prisonerNumber: string): Promise<VisitBalances>
  getAssessments(bookingId: number): Promise<Assessment[]>
  getOffenderContacts(bookingId: number): Promise<OffenderContact>
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
}
