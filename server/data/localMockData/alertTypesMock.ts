import { AlertType } from '../interfaces/alertsApi/Alert'
import { PrisonApiAlertType } from '../interfaces/prisonApi/PrisonApiAlert'

export const prisonApiAlertTypesMock: PrisonApiAlertType[] = [
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
      {
        code: 'DOCGM',
        description: 'OCG Nominal - Do not share',
        activeFlag: 'Y',
        parentCode: 'C',
      },
    ],
  },
]

export const alertTypesMock: AlertType[] = [
  {
    code: 'A',
    description: 'AAA',
    isActive: true,
    alertCodes: [
      {
        code: 'A1',
        description: 'AAA111',
        isActive: true,
        alertTypeCode: 'A',
      },
    ],
  },
  {
    code: 'B',
    description: 'BBB',
    isActive: true,
    alertCodes: [
      {
        code: 'B1',
        description: 'BBB111',
        isActive: true,
        alertTypeCode: 'B',
      },
    ],
  },
  {
    code: 'C',
    description: 'CCC',
    isActive: true,
    alertCodes: [
      {
        code: 'C1',
        description: 'CCC111',
        isActive: true,
        alertTypeCode: 'C',
      },
      {
        code: 'DOCGM',
        description: 'OCG Nominal - Do not share',
        isActive: true,
        alertTypeCode: 'C',
      },
    ],
  },
]
