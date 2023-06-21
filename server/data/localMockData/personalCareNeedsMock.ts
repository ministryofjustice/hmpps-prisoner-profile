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

export const xrayCareNeedsMock: PersonalCareNeeds = {
  offenderNo: 'string',
  personalCareNeeds: [
    {
      problemType: 'MATSTAT',
      problemCode: 'ACCU9',
      problemStatus: 'ON',
      problemDescription: 'Preg, acc under 9mths',
      commentText: 'a comment',
      startDate: '2010-06-21',
      endDate: '2010-06-21',
    },
    {
      problemType: 'MATSTAT',
      problemCode: 'ACCU9',
      problemStatus: 'ON',
      problemDescription: 'Preg, acc under 9mths',
      commentText: 'a comment',
      startDate: '2012-08-23',
      endDate: '2010-06-21',
    },
    {
      problemType: 'MATSTAT',
      problemCode: 'ACCU9',
      problemStatus: 'ON',
      problemDescription: 'Preg, acc under 9mths',
      commentText: 'a comment',
      startDate: '2011-07-22',
      endDate: '2010-06-21',
    },
    {
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
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2007-04-17',
    },
    {
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2010-06-21',
    },
    {
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2011-07-22',
    },
    {
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
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2012-08-23',
    },
    {
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2011-07-22',
    },
    {
      commentText: 'a comment',
      endDate: '2010-06-21',
      problemCode: 'ACCU9',
      problemDescription: 'Preg, acc under 9mths',
      problemStatus: 'ON',
      problemType: 'MATSTAT',
      startDate: '2010-06-21',
    },
    {
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
