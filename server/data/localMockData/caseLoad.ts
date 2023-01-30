import { CaseLoad } from '../../interfaces/caseLoad'

export const CaseLoadsDummyDataA: CaseLoad[] = [
  {
    caseLoadId: 'BAI',
    description: 'Moorland Closed (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: true,
  },
]

export const CaseLoadsDummyDataB: CaseLoad[] = [
  {
    caseLoadId: 'BAI',
    description: 'Moorland Closed (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: true,
  },
  {
    caseLoadId: 'BAI',
    description: 'Hyland Closed (HMP & YOI)',
    type: 'INST',
    caseloadFunction: 'GENERAL',
    currentlyActive: false,
  },
]
