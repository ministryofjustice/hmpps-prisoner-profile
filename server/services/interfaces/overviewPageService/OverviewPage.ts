import MiniSummary from './MiniSummary'
import PersonalDetails from './PersonalDetails'
import FullStatus from '../../../data/interfaces/prisonApi/FullStatus'
import Status from './Status'
import NonAssociationSummary from './NonAssociationSummary'

export default interface OverviewPage {
  moneyVisitsAdjudicationsGroup: MiniSummary[]
  categoryIncentiveCsraGroup: MiniSummary[]
  statuses: Status[]
  nonAssociationSummary: NonAssociationSummary
  personalDetails: PersonalDetails
  staffContacts: object
  schedule: OverviewSchedule
  offencesOverview: {
    mainOffenceDescription: string
    fullStatus: FullStatus
    imprisonmentStatusDescription: string
    conditionalReleaseDate: string
    confirmedReleaseDate: string
  }
  prisonName: string
  staffRoles: string[]
  isYouthPrisoner: boolean
}

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
