export interface DamageObligationContainer {
  damageObligations: DamageObligation[]
}

export interface DamageObligation {
  id: number
  offenderNo: string
  referenceNumber: string
  startDateTime: string
  endDateTime: string
  prisonId: string
  amountToPay: number // pounds
  amountPaid: number // pounds
  status: 'ACTIVE' | 'INACTIVE'
  comment: string
  currency: string
}
