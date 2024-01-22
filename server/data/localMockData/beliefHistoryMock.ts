import { Belief } from '../../interfaces/prisonApi/belief'

// eslint-disable-next-line import/prefer-default-export
export const beliefHistoryMock: Belief[] = [
  {
    bookingId: 1,
    beliefId: 1,
    beliefCode: 'SCIE',
    beliefDescription: 'Scientologist',
    startDate: '2024-01-01',
    changeReason: true,
    comments: 'Comments',
    addedByFirstName: 'James',
    addedByLastName: 'Kirk',
  },
  {
    bookingId: 1,
    beliefId: 1,
    beliefCode: 'RC',
    beliefDescription: 'Roman Catholic',
    startDate: '2024-01-01',
    endDate: '2024-02-02',
    changeReason: true,
    comments: 'Comments',
    addedByFirstName: 'James',
    addedByLastName: 'Kirk',
    updatedByFirstName: 'Jean-Luc',
    updatedByLastName: 'Picard',
    updatedDate: '2024-02-03',
  },
]
