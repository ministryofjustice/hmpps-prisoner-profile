export type NonAssociation = {
  offenderNo: string
  firstName: string
  lastName: string
  agencyDescription: string
  assignedLivingUnitDescription: string
  assignedLivingUnitId: number
  reasonCode: string
  reasonDescription: string
}

export type NonAssociationDetail = {
  reasonCode: string
  reasonDescription: string
  typeCode: string
  typeDescription: string
  effectiveDate: string
  expiryDate: string
  authorisedBy: string
  comments: string
  offenderNonAssociation: NonAssociation
}

export type NonAssociationDetails = {
  offenderNo: string
  firstName: string
  lastName: string
  agencyDescription: string
  assignedLivingUnitDescription: string
  nonAssociations: NonAssociationDetail[]
  assignedLivingUnitId: number
}
