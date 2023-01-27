export type CaseLoad = {
  caseLoadId: string
  description: string
  type: string
  caseloadFunction: string
  currentlyActive: boolean
}

export const CaseLoadsDummyDataA: CaseLoad[] = [
  {
    caseLoadId: 'MDI',
    description: 'Moorland Closed (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: false,
  },
]

export const CaseLoadsDummyDataB: CaseLoad[] = [
  {
    caseLoadId: 'MDI',
    description: 'Moorland Closed (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: false,
  },
  {
    caseLoadId: 'ABC',
    description: 'Hyland Closed (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: false,
  },
]
