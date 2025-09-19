import { AlertType } from '../interfaces/alertsApi/Alert'

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
      {
        code: 'DRONE',
        description: 'Drone Nominal - Do not share',
        isActive: true,
        alertTypeCode: 'C',
      },
    ],
  },
]

export default { alertTypesMock }
