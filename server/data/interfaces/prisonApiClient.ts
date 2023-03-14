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
import { SecondaryLanguage } from '../../interfaces/prisonApi/secondaryLanguage'

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
  getSecondaryLanguages(bookingId: number): Promise<SecondaryLanguage[]>
}
