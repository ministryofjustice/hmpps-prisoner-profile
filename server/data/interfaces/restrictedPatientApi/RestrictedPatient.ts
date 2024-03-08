export interface Agency {
  agencyId: string
  description?: string
  longDescription?: string
  agencyType?: string
  active?: boolean
}

export default interface RestrictedPatient {
  prisonerNumber: string
  fromLocation?: Agency
  hospitalLocation?: Agency
  supportingPrison?: Agency
  dischargeTime: string
  commentText?: string
  createDateTime?: string
  createUserId?: string
}
