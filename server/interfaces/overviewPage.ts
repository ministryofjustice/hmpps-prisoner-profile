import { MiniSummary } from './miniSummary'
import { PersonalDetails } from './personalDetails'
import CourtCase, { CourtHearing } from '../data/interfaces/prisonApi/CourtCase'
import FullStatus from '../data/interfaces/prisonApi/FullStatus'
import { Status } from './status'
import { NonAssociationSummary } from './nonAssociationSummary'

export interface OverviewScheduleItem {
  name: string
  startTime?: string
  endTime?: string
}

export interface OverviewSchedule {
  morning: OverviewScheduleItem[]
  afternoon: OverviewScheduleItem[]
  evening: OverviewScheduleItem[]
  linkUrl: string
}

export interface OverviewNonAssociation {
  nonAssociationName: string
  offenderNo: string
  assignedLivingUnitDescription: string
  reasonDescription: string
  agencyId: string
}

export interface AlertsSummary {
  activeAlertCount: number
  nonAssociationsCount: number
  nonAssociationsUrl: string
}

export interface OverviewPage {
  miniSummaryGroupA: MiniSummary[]
  miniSummaryGroupB: MiniSummary[]
  statuses: Status[]
  nonAssociationSummary: NonAssociationSummary
  personalDetails: PersonalDetails
  staffContacts: object
  schedule: OverviewSchedule
  offencesOverview: {
    mainOffenceDescription: string
    courtCaseData: CourtCase[]
    fullStatus: FullStatus
    imprisonmentStatusDescription: string
    conditionalReleaseDate: string
    confirmedReleaseDate: string
    nextCourtAppearance: CourtHearing
  }
  prisonName: string
  staffRoles: string[]
}
