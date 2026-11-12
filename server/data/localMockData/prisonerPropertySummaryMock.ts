import type { PrisonerPropertySummary } from '../interfaces/prisonerPropertyApi/prisonerPropertyApiClient'

/** Scenario 1: Prisoner held at this prison with some property held and some due for disposal */
export const propertySummaryAtPrisonMock = (prisonId: string, prisonName: string): PrisonerPropertySummary => ({
  prisonId,
  prisonName,
  prisonerHeldHere: true,
  currentEstablishmentId: prisonId,
  currentEstablishmentName: prisonName,
  heldAtThisPrison: 10,
  dueToTransferIn: 1,
  dueToTransferOut: 2,
  dueToBeDisposed: 3,
  dueToBeReturned: 4,
  heldAtOtherPrisons: 0,
  hasEverHadProperty: true,
})

export const propertySummaryMock = propertySummaryAtPrisonMock('MDI', 'Moorland (HMP & YOI)')
