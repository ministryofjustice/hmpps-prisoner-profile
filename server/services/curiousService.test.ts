import { parseISO, startOfDay, subMonths } from 'date-fns'
import CuriousService from './curiousService'
import {
  learnerEducationPagedResponse,
  learnerEducationPagedResponsePage1Of1,
  learnerEducationPagedResponsePage1Of2,
  learnerEducationPagedResponsePage2Of2,
} from '../data/localMockData/learnerEducationPagedResponse'
import PrisonService from './prisonService'
import { LearnerEductionPagedResponse } from '../data/interfaces/curiousApi/LearnerEducation'
import { Prison } from './interfaces/prisonService/PrisonServicePrisons'
import { InPrisonCourseRecords } from './interfaces/curiousService/CuriousInPrisonCourses'
import CuriousRestApiClient from '../data/curiousApiClient'

jest.mock('../data/curiousApiClient')
jest.mock('./prisonService')

describe('curiousService', () => {
  const prisonNumber = 'A1234BC'
  const systemToken = 'a-system-token'
  const curiousApiToken = { curiousApiToken: 'curious-api-token' }

  const curiousApiClient = new CuriousRestApiClient(null) as jest.Mocked<CuriousRestApiClient>
  const curiousClientBuilder = jest.fn()
  const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
  const curiousService = new CuriousService(curiousClientBuilder, prisonService, () => Promise.resolve(curiousApiToken))

  const mockPrisonLookup = (prisonId: string): Promise<Prison> => {
    let prisonName: string
    if (prisonId === 'MDI') {
      prisonName = 'Moorland (HMP & YOI)'
    } else if (prisonId === 'WDI') {
      prisonName = 'Wakefield (HMP)'
    } else {
      return undefined
    }
    return Promise.resolve({ prisonId, prisonName })
  }

  beforeEach(() => {
    jest.resetAllMocks()
    curiousClientBuilder.mockReturnValue(curiousApiClient)
    prisonService.getPrisonByPrisonId.mockImplementation(mockPrisonLookup)
  })

  describe('getPrisonerInPrisonCourses', () => {
    it('should get In Prison Courses', async () => {
      // Given
      const learnerEducationPage1Of1: LearnerEductionPagedResponse = learnerEducationPagedResponse(prisonNumber)
      curiousApiClient.getLearnerEducationPage.mockResolvedValue(learnerEducationPage1Of1)

      const expected: InPrisonCourseRecords = {
        problemRetrievingData: false,
        prisonNumber,
        totalRecords: 5,
        coursesByStatus: {
          COMPLETED: [
            {
              courseCode: '008WOOD06',
              courseCompletionDate: subMonths(startOfDay(new Date()), 3),
              courseName: 'City & Guilds Wood Working',
              courseStartDate: startOfDay(parseISO('2021-06-01')),
              coursePlannedEndDate: startOfDay(parseISO('2021-08-06')),
              courseStatus: 'COMPLETED',
              grade: null,
              isAccredited: false,
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              withdrawalReason: null,
              source: 'CURIOUS',
            },
            {
              courseCode: '008ENGL06',
              courseCompletionDate: startOfDay(parseISO('2021-12-13')),
              courseName: 'GCSE English',
              courseStartDate: startOfDay(parseISO('2021-06-01')),
              courseStatus: 'COMPLETED',
              coursePlannedEndDate: startOfDay(parseISO('2021-08-06')),
              grade: null,
              isAccredited: false,
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              withdrawalReason: null,
              source: 'CURIOUS',
            },
          ],
          IN_PROGRESS: [
            {
              courseCode: '008ENGL06',
              courseName: 'GCSE English',
              courseStartDate: startOfDay(parseISO('2021-06-01')),
              coursePlannedEndDate: startOfDay(parseISO('2021-08-06')),
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              courseStatus: 'IN_PROGRESS',
              courseCompletionDate: null,
              isAccredited: false,
              grade: null,
              withdrawalReason: null,
              source: 'CURIOUS',
            },
          ],
          WITHDRAWN: [
            {
              courseCode: '246674',
              courseName: 'GCSE Maths',
              courseStartDate: startOfDay(parseISO('2016-05-18')),
              prisonId: 'WDI',
              prisonName: 'Wakefield (HMP)',
              courseStatus: 'WITHDRAWN',
              courseCompletionDate: startOfDay(parseISO('2016-07-15')),
              coursePlannedEndDate: startOfDay(parseISO('2016-12-23')),
              isAccredited: true,
              grade: 'No achievement',
              withdrawalReason: 'Significant ill health causing them to be unable to attend education',
              source: 'CURIOUS',
            },
          ],
          TEMPORARILY_WITHDRAWN: [
            {
              courseCode: '246674',
              courseCompletionDate: startOfDay(parseISO('2016-07-15')),
              courseName: 'GCSE Maths',
              courseStartDate: startOfDay(parseISO('2016-05-18')),
              coursePlannedEndDate: startOfDay(parseISO('2016-12-23')),
              courseStatus: 'TEMPORARILY_WITHDRAWN',
              grade: 'No achievement',
              isAccredited: true,
              prisonId: 'WDI',
              prisonName: 'Wakefield (HMP)',
              withdrawalReason: 'Significant ill health causing them to be unable to attend education',
              source: 'CURIOUS',
            },
          ],
        },
        coursesCompletedInLast12Months: [
          {
            courseCode: '008WOOD06',
            courseCompletionDate: subMonths(startOfDay(new Date()), 3),
            courseName: 'City & Guilds Wood Working',
            courseStartDate: startOfDay(parseISO('2021-06-01')),
            coursePlannedEndDate: startOfDay(parseISO('2021-08-06')),
            courseStatus: 'COMPLETED',
            grade: null,
            isAccredited: false,
            prisonId: 'MDI',
            prisonName: 'Moorland (HMP & YOI)',
            withdrawalReason: null,
            source: 'CURIOUS',
          },
        ],
      }

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber, systemToken)

      // Then
      expect(actual).toEqual(expected)
      expect(curiousApiClient.getLearnerEducationPage).toHaveBeenCalledWith(prisonNumber, 0)
      expect(prisonService.getPrisonByPrisonId).toHaveBeenCalledWith('MDI', systemToken)
      expect(prisonService.getPrisonByPrisonId).toHaveBeenCalledWith('WDI', systemToken)
    })

    it('should get In Prison Courses given there is only 1 page of data in Curious for the prisoner', async () => {
      // Given
      const learnerEducationPage1Of1: LearnerEductionPagedResponse = learnerEducationPagedResponsePage1Of1(prisonNumber)
      curiousApiClient.getLearnerEducationPage.mockResolvedValue(learnerEducationPage1Of1)

      const expected: InPrisonCourseRecords = {
        problemRetrievingData: false,
        prisonNumber,
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [],
          IN_PROGRESS: [
            {
              courseCode: '008ENGL06',
              courseName: 'GCSE English',
              courseStartDate: startOfDay(parseISO('2021-06-01')),
              coursePlannedEndDate: startOfDay(parseISO('2021-08-06')),
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              courseStatus: 'IN_PROGRESS',
              courseCompletionDate: null,
              isAccredited: false,
              grade: null,
              withdrawalReason: null,
              source: 'CURIOUS',
            },
          ],
          WITHDRAWN: [
            {
              courseCode: '246674',
              courseName: 'GCSE Maths',
              courseStartDate: startOfDay(parseISO('2016-05-18')),
              prisonId: 'WDI',
              prisonName: 'Wakefield (HMP)',
              courseStatus: 'WITHDRAWN',
              courseCompletionDate: startOfDay(parseISO('2016-07-15')),
              coursePlannedEndDate: startOfDay(parseISO('2016-12-23')),
              isAccredited: true,
              grade: 'No achievement',
              withdrawalReason: 'Significant ill health causing them to be unable to attend education',
              source: 'CURIOUS',
            },
          ],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
      }

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber, systemToken)

      // Then
      expect(actual).toEqual(expected)
      expect(curiousApiClient.getLearnerEducationPage).toHaveBeenCalledWith(prisonNumber, 0)
    })

    it('should get In Prison Courses given there are 2 pages of data in Curious for the prisoner', async () => {
      // Given
      const learnerEducationPage1Of2: LearnerEductionPagedResponse = learnerEducationPagedResponsePage1Of2(prisonNumber)
      curiousApiClient.getLearnerEducationPage.mockResolvedValueOnce(learnerEducationPage1Of2)
      const learnerEducationPage2Of2: LearnerEductionPagedResponse = learnerEducationPagedResponsePage2Of2(prisonNumber)
      curiousApiClient.getLearnerEducationPage.mockResolvedValueOnce(learnerEducationPage2Of2)

      const expected: InPrisonCourseRecords = {
        problemRetrievingData: false,
        prisonNumber,
        totalRecords: 3,
        coursesByStatus: {
          COMPLETED: [],
          IN_PROGRESS: [
            {
              courseCode: '008ENGL06',
              courseName: 'GCSE English',
              courseStartDate: startOfDay(parseISO('2021-06-01')),
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              courseStatus: 'IN_PROGRESS',
              courseCompletionDate: null,
              coursePlannedEndDate: startOfDay(parseISO('2021-08-06')),
              isAccredited: false,
              grade: null,
              withdrawalReason: null,
              source: 'CURIOUS',
            },
            {
              courseCode: '008WOOD06',
              courseName: 'City & Guilds Wood Working',
              courseStartDate: startOfDay(parseISO('2021-06-01')),
              coursePlannedEndDate: startOfDay(parseISO('2021-08-06')),
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              courseStatus: 'IN_PROGRESS',
              courseCompletionDate: null,
              isAccredited: false,
              grade: null,
              withdrawalReason: null,
              source: 'CURIOUS',
            },
          ],
          WITHDRAWN: [
            {
              courseCode: '246674',
              courseName: 'GCSE Maths',
              courseStartDate: startOfDay(parseISO('2016-05-18')),
              prisonId: 'WDI',
              prisonName: 'Wakefield (HMP)',
              courseStatus: 'WITHDRAWN',
              courseCompletionDate: startOfDay(parseISO('2016-07-15')),
              coursePlannedEndDate: startOfDay(parseISO('2016-12-23')),
              isAccredited: true,
              grade: 'No achievement',
              withdrawalReason: 'Significant ill health causing them to be unable to attend education',
              source: 'CURIOUS',
            },
          ],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
      }

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber, systemToken)

      // Then
      expect(actual).toEqual(expected)
      expect(curiousApiClient.getLearnerEducationPage).toHaveBeenCalledWith(prisonNumber, 0)
      expect(curiousApiClient.getLearnerEducationPage).toHaveBeenCalledWith(prisonNumber, 1)
    })

    it('should not get In Prison Courses given the curious API request for page 1 returns an error response', async () => {
      // Given
      const curiousApiError = {
        message: 'Internal Server Error',
        status: 500,
        text: { errorCode: 'VC5000', errorMessage: 'Internal server error', httpStatusCode: 500 },
      }
      curiousApiClient.getLearnerEducationPage.mockRejectedValue(curiousApiError)

      const expected = {
        problemRetrievingData: true,
      } as InPrisonCourseRecords

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber, systemToken)

      // Then
      expect(actual).toEqual(expected)
      expect(curiousApiClient.getLearnerEducationPage).toHaveBeenCalledWith(prisonNumber, 0)
      expect(prisonService.getPrisonByPrisonId).not.toHaveBeenCalled()
    })

    it('should not get In Prison Courses given the Curious API request for page 2 returns an error response', async () => {
      // Given
      const learnerEducationPage1Of2: LearnerEductionPagedResponse = learnerEducationPagedResponsePage1Of2(prisonNumber)
      curiousApiClient.getLearnerEducationPage.mockResolvedValueOnce(learnerEducationPage1Of2)

      const curiousApiError = {
        message: 'Internal Server Error',
        status: 500,
        text: { errorCode: 'VC5000', errorMessage: 'Internal server error', httpStatusCode: 500 },
      }
      curiousApiClient.getLearnerEducationPage.mockRejectedValueOnce(curiousApiError)

      const expected = {
        problemRetrievingData: true,
      } as InPrisonCourseRecords

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber, systemToken)

      // Then
      expect(actual).toEqual(expected)
      expect(curiousApiClient.getLearnerEducationPage).toHaveBeenCalledWith(prisonNumber, 0)
      expect(curiousApiClient.getLearnerEducationPage).toHaveBeenCalledWith(prisonNumber, 1)
      expect(prisonService.getPrisonByPrisonId).not.toHaveBeenCalled()
    })

    it('should handle retrieval of In Prison Courses given Curious returns not found error for the learner education', async () => {
      // Given
      curiousApiClient.getLearnerEducationPage.mockResolvedValue(null) // Curious API client method has `ignore404: true` which means the client method will return null in place of a 404 exception

      const expected: InPrisonCourseRecords = {
        problemRetrievingData: false, // A 404 from Curious is not considered an error; it simply means there is no data for the prisoner
        prisonNumber,
        totalRecords: 0,
        coursesByStatus: {
          COMPLETED: [],
          IN_PROGRESS: [],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
      }

      // When
      const actual = await curiousService.getPrisonerInPrisonCourses(prisonNumber, systemToken)

      // Then
      expect(actual).toEqual(expected)
      expect(curiousApiClient.getLearnerEducationPage).toHaveBeenCalledWith(prisonNumber, 0)
      expect(prisonService.getPrisonByPrisonId).not.toHaveBeenCalled()
    })
  })
})
