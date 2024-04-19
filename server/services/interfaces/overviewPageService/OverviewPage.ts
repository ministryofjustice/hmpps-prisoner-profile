import FullStatus from '../../../data/interfaces/prisonApi/FullStatus'

export default interface OverviewPage {
  statuses: OverviewStatus[]
  nonAssociationSummary: NonAssociationSummary
  personalDetails: PersonalDetails
  staffContacts: object
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

interface NonAssociationSummary {
  prisonName: string
  prisonCount: number
  otherPrisonsCount: number
}

interface PersonalDetails {
  personalDetailsMain: {
    preferredName: string
    dateOfBirth: string
    age: { years: number; months: number } | null
    nationality: string
    spokenLanguage: string
  }
  personalDetailsSide: {
    ethnicGroup: string
    religionOrBelief: string
    croNumber: string
    pncNumber: string
  }
}

interface OverviewStatus {
  label: string
  date?: string
  subText?: string
  error?: boolean
}
