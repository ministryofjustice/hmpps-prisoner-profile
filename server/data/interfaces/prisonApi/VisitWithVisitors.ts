import { PagedListItem } from './PagedList'

// eslint-disable-next-line no-shadow
export enum VisitType {
  Social = 'SCON',
  Official = 'OFFI',
}

export default interface VisitWithVisitors extends PagedListItem {
  visitors: Visitor[]
  visitDetails: VisitDetails
}

export interface Visitor {
  attended: boolean
  dateOfBirth: string
  firstName: string
  lastName: string
  leadVisitor: boolean
  personId: number
  relationship: string
}

export interface VisitDetails {
  attended: boolean
  cancellationReason?: string
  cancelReasonDescription?: string
  completionStatusDescription?: string
  completionStatus: 'NORM' | 'SCH' | 'VDE' | 'OFFEND' | 'VISITOR' | 'CANC' | 'HMPOP'
  endTime?: string
  eventOutcome: 'ATT' | 'ABS'
  eventOutcomeDescription?: string
  eventStatusDescription?: string
  eventStatus: 'EXP' | 'SCH' | 'COMP' | 'CANC'
  leadVisitor?: string
  location?: string
  prison?: string
  relationshipDescription?: string
  relationship?: string
  searchTypeDescription?: string
  searchType?: string
  startTime: string
  visitors?: Visitor[]
  visitTypeDescription?: 'Official Visit' | 'Social Contact'
  visitType: 'OFFI' | 'SCON'
}
