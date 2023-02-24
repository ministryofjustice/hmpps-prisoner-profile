import { MiniSummary } from './miniSummary'
import { PersonalDetails } from './personalDetails'
import { Status } from './status'

export interface OverviewScheduleItem {
  name: string
  startTime?: string
  endTime?: string
}

export interface OverviewSchedule {
  morning: OverviewScheduleItem[]
  afternoon: OverviewScheduleItem[]
  evening: OverviewScheduleItem[]
}

export type OverviewNonAssociation = {
  text: string
}[]

export interface OverviewPage {
  miniSummaryGroupA: MiniSummary[]
  miniSummaryGroupB: MiniSummary[]
  statuses: Status[]
  nonAssociations: OverviewNonAssociation[]
  personalDetails: PersonalDetails
  staffContacts: object
  schedule: OverviewSchedule
}
