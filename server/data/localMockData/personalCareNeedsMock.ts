import { addDays, startOfYear } from 'date-fns'

import PersonalCareNeeds, { PersonalCareNeed } from '../interfaces/prisonApi/PersonalCareNeeds'

export const pregnantCareNeedMock: PersonalCareNeed = {
  personalCareNeedId: 1,
  problemType: 'MATSTAT',
  problemCode: 'ACCU9',
  problemStatus: 'ON',
  problemDescription: 'Preg, acc under 9mths',
  commentText: 'a comment',
  startDate: '2010-06-21',
}

export const notPregnantCareNeedMock: PersonalCareNeed = {
  personalCareNeedId: 1,
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
  personalCareNeedId: 1,
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

export const xrayCareNeedsMock: PersonalCareNeeds = {
  offenderNo: 'string',
  personalCareNeeds: [
    {
      personalCareNeedId: 1,
      problemType: 'MATSTAT',
      problemCode: 'ACCU9',
      problemStatus: 'ON',
      problemDescription: 'Preg, acc under 9mths',
      commentText: 'a comment',
      startDate: '2010-06-21',
      endDate: '2010-06-21',
    },
    {
      personalCareNeedId: 2,
      problemType: 'MATSTAT',
      problemCode: 'ACCU9',
      problemStatus: 'ON',
      problemDescription: 'Preg, acc under 9mths',
      commentText: 'a comment',
      startDate: '2012-08-23',
      endDate: '2010-06-21',
    },
    {
      personalCareNeedId: 3,
      problemType: 'MATSTAT',
      problemCode: 'ACCU9',
      problemStatus: 'ON',
      problemDescription: 'Preg, acc under 9mths',
      commentText: 'a comment',
      startDate: '2011-07-22',
      endDate: '2010-06-21',
    },
    {
      personalCareNeedId: 4,
      problemType: 'MATSTAT',
      problemCode: 'ACCU9',
      problemStatus: 'ON',
      problemDescription: 'Preg, acc under 9mths',
      commentText: 'a comment',
      startDate: '2007-04-17',
      endDate: '2010-06-21',
    },
  ],
}

export const xrayCareNeedsASCMock: PersonalCareNeeds = {
  offenderNo: 'string',
  personalCareNeeds: [
    {
      personalCareNeedId: 4,
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2007-04-17',
    },
    {
      personalCareNeedId: 1,
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2010-06-21',
    },
    {
      personalCareNeedId: 3,
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2011-07-22',
    },
    {
      personalCareNeedId: 2,
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2012-08-23',
    },
  ],
}

export const xrayCareNeedsDESCMock: PersonalCareNeeds = {
  offenderNo: 'string',
  personalCareNeeds: [
    {
      personalCareNeedId: 2,
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2012-08-23',
    },
    {
      personalCareNeedId: 3,
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2011-07-22',
    },
    {
      personalCareNeedId: 1,
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2010-06-21',
    },
    {
      personalCareNeedId: 4,
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2007-04-17',
    },
  ],
}
