import type { BeliefHistoryItem } from '../interfaces/beliefService/BeliefHistoryItem'

// mocks for mapped data as returned by belief service
// see also /server/data/localMockData/beliefHistoryMock.ts

export const beliefServiceMock: BeliefHistoryItem[] = [
  {
    current: true,
    religionCode: 'SCIE',
    religionDescription: 'Scientologist',
    startDate: '2024-01-01',
    changeReasonKnown: true,
    comments: 'Comments',
    createUserFirstName: 'James',
    createUserLastName: 'Kirk',
  },
  {
    current: false,
    religionCode: 'RC',
    religionDescription: 'Roman Catholic',
    startDate: '2024-01-01',
    endDate: '2024-02-02',
    changeReasonKnown: true,
    comments: 'Comments',
    createUserFirstName: 'James',
    createUserLastName: 'Kirk',
    modifyUserFirstName: 'Jean-Luc',
    modifyUserLastName: 'Picard',
    modifyDate: '2024-02-03',
  },
]

export const beliefServiceOverrideMock: BeliefHistoryItem[] = [
  {
    current: true,
    religionCode: 'OTH',
    religionDescription: 'Other',
    startDate: '2024-01-01',
    changeReasonKnown: true,
    comments: 'Comments',
    createUserFirstName: 'James',
    createUserLastName: 'Kirk',
  },
  {
    current: false,
    religionCode: 'RC',
    religionDescription: 'Roman Catholic',
    startDate: '2024-01-01',
    endDate: '2024-02-02',
    changeReasonKnown: true,
    comments: 'Comments',
    createUserFirstName: 'James',
    createUserLastName: 'Kirk',
    modifyUserFirstName: 'Jean-Luc',
    modifyUserLastName: 'Picard',
    modifyDate: '2024-02-03',
  },
]
