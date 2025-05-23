import CaseNoteType from '../interfaces/caseNotesApi/CaseNoteType'

export const caseNoteTypesMock: CaseNoteType[] = [
  {
    code: 'ACP',
    description: 'Accredited Programme',
    subCodes: [
      {
        code: 'ASSESSMENT',
        description: 'Assessment',
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
        sensitive: false,
        restrictedUse: false,
      },
    ],
  },
  {
    code: 'KA',
    description: 'Key Worker Activity',
    subCodes: [
      {
        code: 'KE',
        description: 'Key Worker Entry',
        active: true,
        sensitive: false,
        restrictedUse: false,
      },
      {
        code: 'KS',
        description: 'Key Worker Session',
        active: true,
        sensitive: false,
        restrictedUse: false,
      },
    ],
  },
]
