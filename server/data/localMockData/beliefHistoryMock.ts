import Belief from '../interfaces/prisonApi/Belief'

export const beliefHistoryMock: Belief[] = [
  {
    beliefCode: 'SCIE',
    beliefDescription: 'Scientologist',
    startDate: '2024-01-01',
    changeReason: true,
    comments: 'Comments',
    addedByFirstName: 'James',
    addedByLastName: 'Kirk',
  },
  {
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

export const beliefHistoryOverrideMock: Belief[] = [
  {
    beliefCode: 'OTH',
    beliefDescription: 'Other',
    startDate: '2024-01-01',
    changeReason: true,
    comments: 'Comments',
    addedByFirstName: 'James',
    addedByLastName: 'Kirk',
  },
  {
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

export const beliefHistoryAllBookingsMock: Belief[] = [
  {
    beliefCode: 'CCOG',
    beliefDescription: 'Celestial Church of God',
    startDate: '2022-01-01',
    changeReason: true,
    comments: 'Comments',
    addedByFirstName: 'James',
    addedByLastName: 'Kirk',
  },
  {
    beliefCode: 'SCIE',
    beliefDescription: 'Scientologist',
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
  {
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
