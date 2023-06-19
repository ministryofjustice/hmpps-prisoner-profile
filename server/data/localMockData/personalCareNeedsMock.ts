import { addDays, startOfYear } from 'date-fns'

import { PersonalCareNeed, PersonalCareNeeds } from '../../interfaces/personalCareNeeds'

export const pregnantCareNeedMock: PersonalCareNeed = {
  problemType: 'MATSTAT',
  problemCode: 'ACCU9',
  problemStatus: 'ON',
  problemDescription: 'Preg, acc under 9mths',
  commentText: 'a comment',
  startDate: '2010-06-21',
}

export const notPregnantCareNeedMock: PersonalCareNeed = {
  problemType: 'MATSTAT',
  problemCode: 'NU9',
  problemStatus: 'I',
  problemDescription: 'Not Preg, acc under 9mths',
  commentText: 'a comment',
  startDate: '2010-06-21',
  endDate: '2010-06-21',
}

export const personalCareNeedsMock: PersonalCareNeeds = {
  offenderNo: 'A1234BC',
  personalCareNeeds: [pregnantCareNeedMock],
}

const xrayNeed = (daysAfterStartOfYear: number): PersonalCareNeed => ({
  commentText: 'There was a body scan',
  problemCode: 'BSC5.5',
  problemDescription: 'Body scan',
  problemStatus: 'ON',
  problemType: 'BSCAN',
  startDate: addDays(startOfYear(new Date()), daysAfterStartOfYear).toISOString(),
})

export const xrayCareNeeds = (numberOfXrays: number): PersonalCareNeeds => ({
  offenderNo: 'A1234BC',
  personalCareNeeds: Array.from(Array(numberOfXrays)).map(() => xrayNeed(10)),
})
