import { Alert } from '../../interfaces/alertsApi/Alert'

export const alertsMock: Alert[] = [
  {
    alertUuid: '8cdadcf3-b003-4116-9956-c99bd8df6a00',
    prisonNumber: 'A1234AA',
    alertCode: {
      alertTypeCode: 'A',
      alertTypeDescription: 'Alert type description',
      code: 'ABC',
      description: 'Alert code description',
      canBeAdministered: true,
    },
    description: 'Alert description',
    authorisedBy: 'A. Nurse, An Agency',
    activeFrom: '2021-09-27',
    activeTo: '2022-07-15',
    isActive: true,
    comments: [
      {
        commentUuid: '476939e3-7cc1-4c5f-8f54-e7d055d1d50c',
        comment: 'Additional user comment on the alert comment thread',
        createdAt: '2024-04-24T09:18:55.862Z',
        createdBy: 'USER1234',
        createdByDisplayName: 'Firstname Lastname',
      },
    ],
    createdAt: '2024-04-24T09:18:55.862Z',
    createdBy: 'USER1234',
    createdByDisplayName: 'Firstname Lastname',
    lastModifiedAt: '2024-04-24T09:18:55.862Z',
    lastModifiedBy: 'USER1234',
    lastModifiedByDisplayName: 'Firstname Lastname',
  },
]

export default { alertsMock }
