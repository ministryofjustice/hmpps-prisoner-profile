import CaseNoteType from '../interfaces/caseNotesApi/CaseNoteType'

export const caseNoteTypesMock: CaseNoteType[] = [
  {
    code: 'ACP',
    description: 'Accredited Programme',
    subCodes: [
      {
        code: 'ASSESSMENT',
        description: 'Assessment',
        activeFlag: 'Y',
        sensitive: false,
        restrictedUse: false,
      },
    ],
  },
  {
    code: 'OMIC',
    description: 'OMiC',
    subCodes: [
      {
        code: 'OPEN_COMM',
        description: 'Open Case Note',
        activeFlag: 'Y',
        sensitive: true,
        restrictedUse: false,
      },
    ],
  },
  {
    code: 'POS',
    description: 'Positive Behaviour',
    subCodes: [
      {
        code: 'IEP_ENC',
        description: 'Incentive Encouragement',
        activeFlag: 'Y',
        sensitive: false,
        restrictedUse: false,
      },
    ],
  },
  {
    code: 'NEG',
    description: 'Negative Behaviour',
    subCodes: [
      {
        code: 'IEP_WARN',
        description: 'Incentive warning',
        activeFlag: 'Y',
        sensitive: false,
        restrictedUse: false,
      },
    ],
  },
]
