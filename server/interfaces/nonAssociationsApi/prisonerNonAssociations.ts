export interface PrisonerNonAssociations {
  prisonerNumber: string
  firstName: string
  lastName: string
  prisonId: string
  prisonName: string
  cellLocation: string
  openCount: number
  closedCount: number
  nonAssociations: PrisonerNonAssociation[]
}

export interface PrisonerNonAssociation {
  id: number
  role: string
  roleDescription: string
  reason: string
  reasonDescription: string
  restrictionType: string
  restrictionTypeDescription: string
  comment: string
  authorisedBy: string
  whenCreated: string
  whenUpdated: string
  updatedBy: string
  isClosed: boolean
  closedBy: string
  closedReason: string
  closedAt: string
  otherPrisonerDetails: OtherPrisonerDetails
  isOpen: boolean
}

export interface OtherPrisonerDetails {
  prisonerNumber: string
  role: string
  roleDescription: string
  firstName: string
  lastName: string
  prisonId: string
  prisonName: string
  cellLocation: string
}
