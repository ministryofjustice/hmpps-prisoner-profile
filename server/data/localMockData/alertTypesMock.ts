import { AlertType } from '../../interfaces/prisonApi/alert'

// eslint-disable-next-line import/prefer-default-export
export const alertTypesMock: AlertType[] = [
  {
    code: 'A',
    description: 'AAA',
    activeFlag: true,
    subCodes: [
      {
        code: 'A1',
        description: 'AAA111',
        activeFlag: true,
        parentCode: 'A',
      },
    ],
  },
  {
    code: 'B',
    description: 'BBB',
    activeFlag: true,
    subCodes: [
      {
        code: 'B1',
        description: 'BBB111',
        activeFlag: true,
        parentCode: 'B',
      },
    ],
  },
  {
    code: 'C',
    description: 'CCC',
    activeFlag: true,
    subCodes: [
      {
        code: 'C1',
        description: 'CCC111',
        activeFlag: true,
        parentCode: 'C',
      },
    ],
  },
]
