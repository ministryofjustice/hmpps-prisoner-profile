import type CaseLoad from '../interfaces/prisonApi/CaseLoad'

export const CaseLoadsDummyDataA: CaseLoad[] = [
  {
    caseLoadId: 'MDI',
    description: 'Moorland (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: true,
  },
]

export const CaseLoadsDummyDataB: CaseLoad[] = [
  {
    caseLoadId: 'BAI',
    description: 'Belmarsh (HMP)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: true,
  },
  {
    caseLoadId: 'BLI',
    description: 'Bristol (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: false,
  },
]
