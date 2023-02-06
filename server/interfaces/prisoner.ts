export type Prisoner = {
  prisonerNumber: string
  pncNumber: string
  pncNumberCanonicalShort: string
  pncNumberCanonicalLong: string
  croNumber: string
  firstName?: string
  lastName?: string
  currentIncentive?: {
    level: { code: string; description: string }
    dateTime: string
    nextReviewDate: string
  }
}
