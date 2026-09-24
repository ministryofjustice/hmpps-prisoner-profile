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

export const pastCareNeedsMock: PersonalCareNeeds = {
  offenderNo: 'G6123VU',
  personalCareNeeds: [
    {
      personalCareNeedId: 9,
      problemCode: 'BSC5.5',
      problemStatus: 'ON',
      commentText: 'Xray scan',
      problemType: 'BSCAN',
      startDate: '2024-06-06',
      problemDescription: 'problem description',
    },
    {
      personalCareNeedId: 1,
      problemType: 'PHY',
      problemCode: 'FALS',
      problemStatus: 'I',
      problemDescription: 'False Limbs',
      commentText: 'Peg leg',
      startDate: '2023-05-19',
      endDate: null,
    },
    {
      personalCareNeedId: 2,
      problemType: 'SC',
      problemCode: 'BAC',
      problemStatus: 'I',
      problemDescription: 'Being Appropriately Clothed',
      commentText: 'Double denim',
      startDate: '2020-06-09',
      endDate: null,
    },
    {
      personalCareNeedId: 99,
      problemType: 'PHY',
      problemCode: 'DI',
      problemStatus: 'ON',
      problemDescription: 'Diabetic',
      commentText: 'fdfdfdfd',
      startDate: '2021-07-02',
      endDate: null,
    },
  ],
}

export const onlyPastCareNeedsMock: PersonalCareNeeds = {
  offenderNo: 'G6123VU',
  personalCareNeeds: [
    {
      personalCareNeedId: 1,
      problemType: 'PHY',
      problemCode: 'FALS',
      problemStatus: 'I',
      problemDescription: 'False Limbs',
      commentText: 'Peg leg',
      startDate: '2023-05-19',
      endDate: null,
    },
    {
      personalCareNeedId: 2,
      problemType: 'SC',
      problemCode: 'BAC',
      problemStatus: 'I',
      problemDescription: 'Being Appropriately Clothed',
      commentText: 'Double denim',
      startDate: '2020-06-09',
      endDate: null,
    },
  ],
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
