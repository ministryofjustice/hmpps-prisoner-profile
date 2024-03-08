import CaseNoteType from '../interfaces/caseNotesApi/CaseNoteType'

export const caseNoteTypesMock: CaseNoteType[] = [
  {
    code: 'ACP',
    description: 'Accredited Programme',
    activeFlag: 'Y',
    subCodes: [
      {
        code: 'ASSESSMENT',
        description: 'Assessment',
        activeFlag: 'Y',
        subCodes: [],
        sensitive: false,
        restrictedUse: false,
      },
    ],
    sensitive: false,
    restrictedUse: false,
  },
  {
    code: 'OMIC',
    description: 'OMiC',
    activeFlag: 'Y',
    subCodes: [
      {
        code: 'OPEN_COMM',
        description: 'Open Case Note',
        activeFlag: 'Y',
        subCodes: [],
        sensitive: true,
        restrictedUse: false,
      },
    ],
    sensitive: true,
    restrictedUse: false,
  },
  {
    code: 'POS',
    description: 'Positive Behaviour',
    activeFlag: 'Y',
    subCodes: [
      {
        code: 'IEP_ENC',
        description: 'Incentive Encouragement',
        activeFlag: 'Y',
        subCodes: [],
        sensitive: false,
        restrictedUse: false,
      },
    ],
    sensitive: false,
    restrictedUse: false,
  },
  {
    code: 'NEG',
    description: 'Negative Behaviour',
    activeFlag: 'Y',
    subCodes: [
      {
        code: 'IEP_WARN',
        description: 'Incentive warning',
        activeFlag: 'Y',
        subCodes: [],
        sensitive: false,
        restrictedUse: false,
      },
    ],
    sensitive: false,
    restrictedUse: false,
  },
]
