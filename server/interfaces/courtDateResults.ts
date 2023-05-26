export interface CourtDateResults {
  id: number
  date: string
  resultCode?: string
  resultDescription?: string
  resultDispositionCode?: string
  charge?: Charge
  bookingId: number
}

interface Charge {
  chargeId: number
  offenceCode: string
  offenceStatue: string
  offenceDescription: string
  offenceDate?: string
  offenceEndDate?: string
  guilty: boolean
  courtCaseId: number
  courtCaseRef?: string
  courtLocation: string
  sentenceSequence?: number
  sentenceDate?: string
  resultDescription: string
}
