import type { PrisonerPropertySummary } from '../interfaces/prisonerPropertyApi'

/** Design state 1: property held here, more due in, one overdue for disposal. */
export const propertySummaryMock: PrisonerPropertySummary = {
  currentEstablishmentId: 'IWI',
  currentEstablishmentName: 'Isle of Wight (HMP)',
  heldInCurrentEstablishment: 2,
  heldInOtherEstablishments: 3,
  dueForTransferIn: 3,
  dueForTransferOut: 0,
  overdueForDisposal: 1,
  overdueForReturn: 0,
  hasEverHadProperty: true,
}

/** Design state 2: property due out, overdue for both disposal and return. */
export const propertySummaryDueOutMock: PrisonerPropertySummary = {
  currentEstablishmentId: 'IWI',
  currentEstablishmentName: 'Isle of Wight (HMP)',
  heldInCurrentEstablishment: 3,
  heldInOtherEstablishments: 0,
  dueForTransferIn: 0,
  dueForTransferOut: 5,
  overdueForDisposal: 1,
  overdueForReturn: 1,
  hasEverHadProperty: true,
}

/** Design state 3: no property anywhere, so the card links to the history instead. */
export const propertySummaryEmptyMock: PrisonerPropertySummary = {
  currentEstablishmentId: 'IWI',
  currentEstablishmentName: 'Isle of Wight (HMP)',
  heldInCurrentEstablishment: 0,
  heldInOtherEstablishments: 0,
  dueForTransferIn: 0,
  dueForTransferOut: 0,
  overdueForDisposal: 0,
  overdueForReturn: 0,
  hasEverHadProperty: false,
}

/** Released or in transit, so there is no establishment to name. */
export const propertySummaryNoEstablishmentMock: PrisonerPropertySummary = {
  ...propertySummaryEmptyMock,
  currentEstablishmentId: null,
  currentEstablishmentName: null,
  heldInOtherEstablishments: 1,
  overdueForReturn: 1,
  hasEverHadProperty: true,
}
