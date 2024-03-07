import { AlertType } from '../interfaces/prisonApi/Alert'

export const alertTypesMock: AlertType[] = [
  {
    code: 'A',
    description: 'AAA',
    activeFlag: 'Y',
    subCodes: [
      {
        code: 'A1',
        description: 'AAA111',
        activeFlag: 'Y',
        parentCode: 'A',
      },
    ],
  },
  {
    code: 'B',
    description: 'BBB',
    activeFlag: 'Y',
    subCodes: [
      {
        code: 'B1',
        description: 'BBB111',
        activeFlag: 'Y',
        parentCode: 'B',
      },
    ],
  },
  {
    code: 'C',
    description: 'CCC',
    activeFlag: 'Y',
    subCodes: [
      {
        code: 'C1',
        description: 'CCC111',
        activeFlag: 'Y',
        parentCode: 'C',
      },
    ],
  },
]
