import { subMonths } from 'date-fns'
import { InPrisonCourse } from '../../services/interfaces/curiousService/CuriousInPrisonCourses'

const aValidEnglishInPrisonCourse = (): InPrisonCourse => {
  return {
    prisonId: 'MDI',
    prisonName: 'Moorland (HMP & YOI)',
    courseName: 'GCSE English',
    courseCode: '008ENGL06',
    courseStartDate: new Date('2021-06-01'),
    coursePlannedEndDate: new Date('2022-06-01'),
    courseStatus: 'IN_PROGRESS',
    courseCompletionDate: null,
    isAccredited: true,
    grade: null,
    source: 'CURIOUS',
  }
}

const aValidMathsInPrisonCourse = (): InPrisonCourse => {
  return {
    prisonId: 'WDI',
    prisonName: 'Wakefield (HMP)',
    courseName: 'GCSE Maths',
    courseCode: '246674',
    courseStartDate: new Date('2016-05-18'),
    coursePlannedEndDate: new Date('2016-07-31'),
    courseStatus: 'COMPLETED',
    courseCompletionDate: new Date('2016-07-15'),
    isAccredited: true,
    grade: 'No achievement',
    source: 'CURIOUS',
  }
}

const aValidWoodWorkingInPrisonCourse = (): InPrisonCourse => {
  return {
    prisonId: 'MDI',
    prisonName: 'Moorland (HMP & YOI)',
    courseName: 'City & Guilds Wood Working',
    courseCode: '008WOOD06',
    courseStartDate: new Date('2021-06-01'),
    coursePlannedEndDate: new Date('2022-06-01'),
    courseStatus: 'IN_PROGRESS',
    courseCompletionDate: null,
    isAccredited: true,
    grade: null,
    source: 'CURIOUS',
  }
}

const aValidEnglishInPrisonCourseCompletedWithinLast12Months = (): InPrisonCourse => {
  return {
    prisonId: 'MDI',
    prisonName: 'Moorland (HMP & YOI)',
    courseName: 'GCSE English',
    courseCode: '008ENGL06',
    courseStartDate: new Date('2023-10-01'),
    coursePlannedEndDate: new Date('2024-01-01'),
    courseStatus: 'COMPLETED',
    courseCompletionDate: subMonths(new Date(), 3),
    isAccredited: true,
    grade: 'Achieved at Level 2',
    source: 'CURIOUS',
  }
}

export {
  aValidEnglishInPrisonCourse,
  aValidMathsInPrisonCourse,
  aValidWoodWorkingInPrisonCourse,
  aValidEnglishInPrisonCourseCompletedWithinLast12Months,
}
