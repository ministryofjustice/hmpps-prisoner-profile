// eslint-disable-next-line import/prefer-default-export
import { CaseNoteType } from '../../interfaces/caseNoteType'

// eslint-disable-next-line import/prefer-default-export
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
        code: 'OMiC',
        description: 'OMiC',
        activeFlag: 'Y',
        subCodes: [],
        sensitive: true,
        restrictedUse: false,
      },
    ],
    sensitive: true,
    restrictedUse: false,
  },
]
