export default interface Movement {
  offenderNo: string
  createDateTime: string
  fromAgency: string
  fromAgencyDescription: string
  toAgency: string
  toAgencyDescription: string
  fromCity?: string
  toCity?: string
  movementType: 'ADM' | 'CRT' | 'REL' | 'TAP' | 'TRN'
  movementTypeDescription: string
  directionCode: string
  movementDate: string
  movementTime: string
  movementReason: string
  commentText?: string
}
