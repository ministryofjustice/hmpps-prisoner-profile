import { format, startOfToday, subMonths } from 'date-fns'
import { LearnerEductionPagedResponse } from '../interfaces/curiousApi/LearnerEducation'
import {
  aValidEnglishLearnerEducation,
  aValidMathsLearnerEducation,
  aValidWoodWorkingLearnerEducation,
} from './learnerEducation'

const learnerEducationPagedResponse = (prisonNumber = 'A1234BC'): LearnerEductionPagedResponse => {
  const completedEnglishCourse = aValidEnglishLearnerEducation(prisonNumber)
  completedEnglishCourse.completionStatus =
    'The learner has completed the learning activities leading to the learning aim'
  completedEnglishCourse.learningActualEndDate = '2021-12-13'
  const completedWoodworkCourseInLast12Months = aValidWoodWorkingLearnerEducation(prisonNumber)
  completedWoodworkCourseInLast12Months.completionStatus =
    'The learner has completed the learning activities leading to the learning aim'
  completedWoodworkCourseInLast12Months.learningActualEndDate = format(subMonths(startOfToday(), 3), 'yyyy-MM-dd')
  const inProgressEnglishCourse = aValidEnglishLearnerEducation(prisonNumber)
  const withdrawnMathsCourse = aValidMathsLearnerEducation(prisonNumber)
  const temporarilyWithdrawnMathsCourse = aValidMathsLearnerEducation(prisonNumber)
  temporarilyWithdrawnMathsCourse.completionStatus =
    'Learner has temporarily withdrawn from the aim due to an agreed break in learning'

  return {
    content: [
      inProgressEnglishCourse,
      withdrawnMathsCourse,
      completedEnglishCourse,
      completedWoodworkCourseInLast12Months,
      temporarilyWithdrawnMathsCourse,
    ],
    empty: false,
    first: true,
    last: true,
    number: 0,
    numberOfElements: 5,
    pageable: {
      sort: {},
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      unpaged: false,
      paged: true,
    },
    size: 10,
    sort: {},
    totalElements: 5,
    totalPages: 1,
  }
}

const learnerEducationPagedResponsePage1Of1 = (prisonNumber = 'A1234BC'): LearnerEductionPagedResponse => {
  return {
    content: [aValidEnglishLearnerEducation(prisonNumber), aValidMathsLearnerEducation(prisonNumber)],
    empty: false,
    first: true,
    last: true,
    number: 0,
    numberOfElements: 2,
    pageable: {
      sort: {},
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      unpaged: false,
      paged: true,
    },
    size: 10,
    sort: {},
    totalElements: 2,
    totalPages: 1,
  }
}

const learnerEducationPagedResponsePage1Of2 = (prisonNumber = 'A1234BC'): LearnerEductionPagedResponse => {
  return {
    content: [aValidEnglishLearnerEducation(prisonNumber), aValidMathsLearnerEducation(prisonNumber)],
    empty: false,
    first: true,
    last: false,
    number: 0,
    numberOfElements: 2,
    pageable: {
      sort: {},
      pageNumber: 0,
      pageSize: 2,
      offset: 0,
      unpaged: false,
      paged: true,
    },
    size: 2,
    sort: {},
    totalElements: 3,
    totalPages: 1,
  }
}

const learnerEducationPagedResponsePage2Of2 = (prisonNumber = 'A1234BC'): LearnerEductionPagedResponse => {
  return {
    content: [aValidWoodWorkingLearnerEducation(prisonNumber)],
    empty: false,
    first: false,
    last: true,
    number: 0,
    numberOfElements: 1,
    pageable: {
      sort: {},
      pageNumber: 1,
      pageSize: 2,
      offset: 1,
      unpaged: false,
      paged: true,
    },
    size: 2,
    sort: {},
    totalElements: 3,
    totalPages: 1,
  }
}

export {
  learnerEducationPagedResponse,
  learnerEducationPagedResponsePage1Of1,
  learnerEducationPagedResponsePage1Of2,
  learnerEducationPagedResponsePage2Of2,
}
