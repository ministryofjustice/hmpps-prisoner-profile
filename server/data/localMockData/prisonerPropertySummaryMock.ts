import type { PrisonerPropertySummary } from '../interfaces/prisonerPropertyApi/prisonerPropertyApiClient'

/** Scenario 1: Prisoner held at this prison with some property held and some due for disposal */
export const propertySummaryAtPrisonMock = (prisonId: string, prisonName: string): PrisonerPropertySummary => ({
  prisonId,
  prisonName,
  prisonerHeldHere: true,
  currentEstablishmentId: prisonId,
  currentEstablishmentName: prisonName,
  heldAtThisPrison: 5,
  dueToTransferOut: 2,
  dueToBeReturned: 1,
  dueToBeDisposed: 2,
  heldAtOtherPrisons: 0,
  dueToTransferIn: 1,
  hasEverHadProperty: true,
})

export const propertySummaryMock = propertySummaryAtPrisonMock('MDI', 'Moorland (HMP & YOI)')
