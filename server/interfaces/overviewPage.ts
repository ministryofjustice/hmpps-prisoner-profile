import { MiniSummary } from './miniSummary'
import { PersonalDetails } from './personalDetails'
import { CourtCase } from './prisonApi/courtCase'
import { CourtHearing } from './prisonApi/courtHearing'
import { FullStatus } from './prisonApi/fullStatus'
import { MainOffence } from './prisonApi/mainOffence'
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
  linkUrl: string
}

export type OverviewNonAssociation = {
  html?: string
  text?: string
}[]

export interface OverviewPage {
  miniSummaryGroupA: MiniSummary[]
  miniSummaryGroupB: MiniSummary[]
  statuses: Status[]
  nonAssociations: OverviewNonAssociation[]
  personalDetails: PersonalDetails
  staffContacts: object
  schedule: OverviewSchedule
  offencesOverview: {
    mainOffence: MainOffence
    courtCaseData: CourtCase[]
    fullStatus: FullStatus
    imprisonmentStatusDescription: string
    conditionalReleaseDate: string
    confirmedReleaseDate: string
    nextCourtAppearance: CourtHearing
  }
  prisonName: string
}
