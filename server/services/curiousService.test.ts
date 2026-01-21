import { startOfDay } from 'date-fns'
import type { AllAssessmentDTO } from 'curiousApiClient'
import CuriousService from './curiousService'
import { InPrisonCourse } from './interfaces/curiousService/CuriousInPrisonCourses'
import CuriousRestApiClient from '../data/curiousApiClient'
import { anAllQualificationsDTO } from '../data/localMockData/curiousApi/curiousQualifications'
import { Assessment } from './interfaces/curiousService/CuriousFunctionalSkillsAssessments'

jest.mock('../data/curiousApiClient')
jest.mock('./prisonService')
jest.mock('../config')

describe('curiousService', () => {
  const prisonNumber = 'A1234BC'
  const curiousApiToken = { curiousApiToken: 'curious-api-token' }

  const curiousApiClient = new CuriousRestApiClient(null) as jest.Mocked<CuriousRestApiClient>
  const curiousClientBuilder = jest.fn()
  const curiousService = new CuriousService(curiousClientBuilder, () => Promise.resolve(curiousApiToken))

  beforeEach(() => {
    jest.resetAllMocks()
    curiousClientBuilder.mockReturnValue(curiousApiClient)
  })

  describe('getPrisonerInPrisonCourses', () => {
    it('should get In Prison Courses', async () => {
      // Given
      const allPrisonerQualifications = anAllQualificationsDTO()
      curiousApiClient.getLearnerQualifications.mockResolvedValue(allPrisonerQualifications)

      const expected = expect.objectContaining({
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [
            {
              courseCode: '101448',
              courseCompletionDate: startOfDay('2024-01-24'),
              courseName: 'Certificate of Management',
              courseStartDate: startOfDay('2023-10-13'),
              courseStatus: 'COMPLETED',
              coursePlannedEndDate: startOfDay('2023-12-29'),
              grade: 'Achieved',
              isAccredited: true,
              prisonId: 'BXI',
              prisonName: null,
              withdrawalReason: null,
              source: 'CURIOUS1',
            } as InPrisonCourse,
          ],
          IN_PROGRESS: [
            {
              prisonId: 'BXI',
              prisonName: null,
              courseCode: '270828',
              courseName: 'CIMA Strategic Level',
              courseStartDate: startOfDay('2024-06-01'),
              courseStatus: 'IN_PROGRESS',
              courseCompletionDate: null,
              coursePlannedEndDate: startOfDay('2024-06-30'),
              isAccredited: true,
              grade: null,
              withdrawalReason: null,
              source: 'CURIOUS2',
            } as InPrisonCourse,
          ],
          WITHDRAWN: [] as Array<InPrisonCourse>,
          TEMPORARILY_WITHDRAWN: [] as Array<InPrisonCourse>,
        },
        coursesCompletedInLast12Months: [] as Array<InPrisonCourse>,
        hasCoursesCompletedMoreThan12MonthsAgo: expect.any(Function),
        hasWithdrawnOrInProgressCourses: expect.any(Function),
      })

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber)

      // Then
      expect(actual).toEqual(expected)
      expect(curiousApiClient.getLearnerQualifications).toHaveBeenCalledWith(prisonNumber)
    })

    it('should rethrow error given the curious API returns an error response', async () => {
      // Given
      const curiousApiError = {
        message: 'Internal Server Error',
        status: 500,
        text: { errorCode: 'VC5000', errorMessage: 'Internal server error', httpStatusCode: 500 },
      }
      curiousApiClient.getLearnerQualifications.mockRejectedValue(curiousApiError)

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber).catch(error => error)

      // Then
      expect(actual).toEqual(curiousApiError)
      expect(curiousApiClient.getLearnerQualifications).toHaveBeenCalledWith(prisonNumber)
    })

    it('should handle retrieval of In Prison Courses given Curious API client returns null indicating not found error for the learner education', async () => {
      // Given
      curiousApiClient.getLearnerQualifications.mockResolvedValue(null)

      const expected = expect.objectContaining({
        totalRecords: 0,
        coursesByStatus: {
          COMPLETED: [] as Array<InPrisonCourse>,
          IN_PROGRESS: [] as Array<InPrisonCourse>,
          WITHDRAWN: [] as Array<InPrisonCourse>,
          TEMPORARILY_WITHDRAWN: [] as Array<InPrisonCourse>,
        },
        coursesCompletedInLast12Months: [] as Array<InPrisonCourse>,
        hasCoursesCompletedMoreThan12MonthsAgo: expect.any(Function),
        hasWithdrawnOrInProgressCourses: expect.any(Function),
      })

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber)

      // Then
      expect(actual).toEqual(expected)
      expect(curiousApiClient.getLearnerQualifications).toHaveBeenCalledWith(prisonNumber)
    })
  })

  describe('getPrisonerFunctionalSkills', () => {
    it('should get prisoner functional skills given a known prison number', async () => {
      // Given
      const allAssessments: AllAssessmentDTO = {
        v1: [
          {
            prisonNumber,
            qualifications: [
              {
                establishmentId: 'MDI',
                qualification: {
                  qualificationType: 'English',
                  qualificationGrade: 'Level 1',
                  assessmentDate: '2012-02-16',
                },
              },
            ],
          },
        ],
        v2: {
          assessments: {
            englishFunctionalSkills: [],
            mathsFunctionalSkills: [
              {
                establishmentId: 'MDI',
                assessmentDate: '2025-10-01',
                workingTowardsLevel: 'Level 2',
                levelBanding: '2.1',
                assessmentNextStep: 'Progress to course at level consistent with assessment result',
                stakeholderReferral: 'Education Specialist',
              },
            ],
            digitalSkillsFunctionalSkills: [],
            reading: [],
            esol: [],
          },
        },
      }
      curiousApiClient.getLearnerAssessments.mockResolvedValue(allAssessments)

      // We expect the returned Functional Skills to be those mapped from the Curious 2 endpoint assessment data.
      // Even though it is a Curious 2 endpoint, it returns both Curious 1 and Curious 2 functional skills, hence we
      // expect both types.
      const expectedFunctionalSkills = {
        assessments: [
          // The Curious 2 Maths assessment
          {
            prisonId: 'MDI',
            type: 'MATHS',
            assessmentDate: startOfDay('2025-10-01'),
            level: 'Level 2',
            levelBanding: '2.1',
            nextStep: 'Progress to course at level consistent with assessment result',
            referral: ['Education Specialist'],
            source: 'CURIOUS2',
          },
          // The Curious 1 English assessment
          {
            prisonId: 'MDI',
            type: 'ENGLISH',
            assessmentDate: startOfDay('2012-02-16'),
            level: 'Level 1',
            levelBanding: null,
            nextStep: null,
            referral: null,
            source: 'CURIOUS1',
          },
        ],
      }

      // When
      const actual = await curiousService.getPrisonerFunctionalSkills(prisonNumber)

      // Then
      expect(actual).toEqual(expectedFunctionalSkills)
      expect(curiousApiClient.getLearnerAssessments).toHaveBeenCalledWith(prisonNumber)
    })

    it('should handle retrieval of prisoner functional skills given Curious client returns null indicating not found error for the assessments', async () => {
      // Given
      curiousApiClient.getLearnerAssessments.mockResolvedValue(null)

      const expectedFunctionalSkills = {
        assessments: [] as Array<Assessment>,
      }

      // When
      const actual = await curiousService.getPrisonerFunctionalSkills(prisonNumber)

      // Then
      expect(actual).toEqual(expectedFunctionalSkills)
      expect(curiousApiClient.getLearnerAssessments).toHaveBeenCalledWith(prisonNumber)
    })

    it('should rethrow error given Curious API returns an unexpected error', async () => {
      // Given
      const curiousApiError = {
        message: 'Internal Server Error',
        status: 500,
        text: { errorCode: 'VC5000', errorMessage: 'Internal server error', httpStatusCode: 500 },
      }
      curiousApiClient.getLearnerAssessments.mockRejectedValue(curiousApiError)

      // When
      const actual = await curiousService.getPrisonerFunctionalSkills(prisonNumber).catch(error => error)

      // Then
      expect(actual).toEqual(curiousApiError)
      expect(curiousApiClient.getLearnerAssessments).toHaveBeenCalledWith(prisonNumber)
    })
  })
})
