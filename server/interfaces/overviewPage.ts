import { MiniSummary } from './miniSummary'
import { PersonalDetails } from './personalDetails'

export type OverviewScheduleItem = {
  name: string
  startTime?: string
  endTime?: string
}

export type OverviewSchedule = {
  morning: OverviewScheduleItem[]
  afternoon: OverviewScheduleItem[]
  evening: OverviewScheduleItem[]
}

export type OverviewNonAssociation = {
  text: string
}[]

export type OverviewPage = {
  miniSummaryGroupA: MiniSummary[]
  miniSummaryGroupB: MiniSummary[]
  statuses: object
  nonAssociations: OverviewNonAssociation[]
  personalDetails: PersonalDetails
  staffContacts: object
  schedule: OverviewSchedule
}
