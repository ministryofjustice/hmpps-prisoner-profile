import { toInPrisonCourse, toCourseStatus } from './inPrisonCourseMapper'
import { InPrisonCourse } from '../interfaces/curiousService/CuriousInPrisonCourses'
import { aValidEnglishLearnerEducation, aValidMathsLearnerEducation } from '../../data/localMockData/learnerEducation'

describe('inPrisonCourseMapper', () => {
  describe('toInPrisonCourse', () => {
    it('should map a Curious LearnerEducation to an InPrisonCourse view model given LearnerEducation does not have an actualEndDate value', () => {
      // Given
      const apiLearnerEducation = { ...aValidEnglishLearnerEducation() }

      const expectedInPrisonCourse: InPrisonCourse = {
        prisonId: 'MDI',
        prisonName: 'MOORLAND (HMP & YOI)',
        courseCode: '008ENGL06',
        courseName: 'GCSE English',
        courseStartDate: new Date('2021-06-01'),
        courseStatus: 'IN_PROGRESS',
        courseCompletionDate: null,
        coursePlannedEndDate: new Date('2021-08-06'),
        isAccredited: false,
        grade: null,
        withdrawalReason: null,
        source: 'CURIOUS',
      }

      // When
      const actual = toInPrisonCourse(apiLearnerEducation)

      // Then
      expect(actual).toEqual(expectedInPrisonCourse)
    })

    it('should map a Curious LearnerEducation to an InPrisonCourse view model given LearnerEducation has an actualEndDate value', () => {
      // Given
      const apiLearnerEducation = { ...aValidMathsLearnerEducation() }
      apiLearnerEducation.learningActualEndDate = '2016-07-15'
      apiLearnerEducation.outcome = undefined
      apiLearnerEducation.outcomeGrade = undefined

      const expectedInPrisonCourse: InPrisonCourse = {
        prisonId: 'WDI',
        prisonName: 'WAKEFIELD (HMP)',
        courseCode: '246674',
        courseName: 'GCSE Maths',
        courseStartDate: new Date('2016-05-18'),
        courseStatus: 'WITHDRAWN',
        courseCompletionDate: new Date('2016-07-15'),
        coursePlannedEndDate: new Date('2016-12-23'),
        isAccredited: true,
        grade: null,
        withdrawalReason: 'Significant ill health causing them to be unable to attend education',
        source: 'CURIOUS',
      }

      // When
      const actual = toInPrisonCourse(apiLearnerEducation)

      // Then
      expect(actual).toEqual(expectedInPrisonCourse)
    })

    it('should map a Curious LearnerEducation to an InPrisonCourse view model given LearnerEducation has an outcome and outcome grade', () => {
      // Given
      const apiLearnerEducation = { ...aValidMathsLearnerEducation() }
      apiLearnerEducation.outcome = 'Passed'
      apiLearnerEducation.outcomeGrade = 'A'

      const expectedInPrisonCourse: InPrisonCourse = {
        prisonId: 'WDI',
        prisonName: 'WAKEFIELD (HMP)',
        courseCode: '246674',
        courseName: 'GCSE Maths',
        courseStartDate: new Date('2016-05-18'),
        courseStatus: 'WITHDRAWN',
        courseCompletionDate: new Date('2016-07-15'),
        coursePlannedEndDate: new Date('2016-12-23'),
        isAccredited: true,
        grade: 'A', // expect grade to be the value of outcomeGrade (as preference over outcome)
        withdrawalReason: 'Significant ill health causing them to be unable to attend education',
        source: 'CURIOUS',
      }

      // When
      const actual = toInPrisonCourse(apiLearnerEducation)

      // Then
      expect(actual).toEqual(expectedInPrisonCourse)
    })

    it('should map a Curious LearnerEducation to an InPrisonCourse view model given LearnerEducation has an outcome but no outcome grade', () => {
      // Given
      const apiLearnerEducation = { ...aValidMathsLearnerEducation() }
      apiLearnerEducation.outcome = 'Passed'
      apiLearnerEducation.outcomeGrade = undefined

      const expectedInPrisonCourse: InPrisonCourse = {
        prisonId: 'WDI',
        prisonName: 'WAKEFIELD (HMP)',
        courseCode: '246674',
        courseName: 'GCSE Maths',
        courseStartDate: new Date('2016-05-18'),
        courseStatus: 'WITHDRAWN',
        courseCompletionDate: new Date('2016-07-15'),
        coursePlannedEndDate: new Date('2016-12-23'),
        isAccredited: true,
        grade: 'Passed', // expect grade to be the value of outcome (because there is no outcome grade)
        withdrawalReason: 'Significant ill health causing them to be unable to attend education',
        source: 'CURIOUS',
      }

      // When
      const actual = toInPrisonCourse(apiLearnerEducation)

      // Then
      expect(actual).toEqual(expectedInPrisonCourse)
    })

    it('should map a Curious LearnerEducation to an InPrisonCourse view model given LearnerEducation has neither outcome or outcome grade', () => {
      // Given
      const apiLearnerEducation = { ...aValidMathsLearnerEducation() }
      apiLearnerEducation.outcome = undefined
      apiLearnerEducation.outcomeGrade = undefined

      const expectedInPrisonCourse: InPrisonCourse = {
        prisonId: 'WDI',
        prisonName: 'WAKEFIELD (HMP)',
        courseCode: '246674',
        courseName: 'GCSE Maths',
        courseStartDate: new Date('2016-05-18'),
        courseStatus: 'WITHDRAWN',
        courseCompletionDate: new Date('2016-07-15'),
        coursePlannedEndDate: new Date('2016-12-23'),
        isAccredited: true,
        grade: null, // expect grade to be null (because there is no outcome grade or outcome)
        withdrawalReason: 'Significant ill health causing them to be unable to attend education',
        source: 'CURIOUS',
      }

      // When
      const actual = toInPrisonCourse(apiLearnerEducation)

      // Then
      expect(actual).toEqual(expectedInPrisonCourse)
    })
  })

  describe('toCourseStatus', () => {
    Array.of(
      {
        curiousScreenLabel:
          'The learner is continuing or intending to continue the learning activities leading to the learning aim',
        expected: 'IN_PROGRESS',
      },
      {
        curiousScreenLabel: 'The learner has completed the learning activities leading to the learning aim',
        expected: 'COMPLETED',
      },
      {
        curiousScreenLabel: 'The learner has withdrawn from the learning activities leading to the learning aim',
        expected: 'WITHDRAWN',
      },
      {
        curiousScreenLabel: 'Learner has temporarily withdrawn from the aim due to an agreed break in learning',
        expected: 'TEMPORARILY_WITHDRAWN',
      },
    ).forEach(spec => {
      it(`should map '${spec.curiousScreenLabel}' to '${spec.expected}'`, () => {
        // Given

        // When
        const actual = toCourseStatus(spec.curiousScreenLabel)

        // Then
        expect(actual).toEqual(spec.expected)
      })
    })
  })
})
