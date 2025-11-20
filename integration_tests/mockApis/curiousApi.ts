import { format, startOfToday, sub } from 'date-fns'
import { stubFor } from './wiremock'
import { learnerEmployabilitySkills } from '../../server/data/localMockData/learnerEmployabilitySkills'
import { LearnerLatestAssessmentsMock } from '../../server/data/localMockData/learnerLatestAssessmentsMock'
import aValidLearnerGoals from '../../server/data/localMockData/learnerGoalsMock'
import { LearnerNeurodivergenceMock } from '../../server/data/localMockData/learnerNeurodivergenceMock'
import { OffenderAttendanceHistoryMock } from '../../server/data/localMockData/offenderAttendanceHistoryMock'
import {
  OffenderActivitiesEmptyMock,
  OffenderActivitiesMock,
} from '../../server/data/localMockData/offenderActivitiesMock'
import {
  learnerEducationPagedResponse,
  learnerEducationPagedResponseContainingCompletedCourseNotInLast12Months,
  learnerEducationPagedResponseContainingNoCourses,
  learnerEducationPagedResponsePage1Of1,
} from '../../server/data/localMockData/learnerEducationPagedResponse'

export default {
  stubGetLearnerEmployabilitySkills: ({
    prisonerNumber,
    error = false,
  }: {
    prisonerNumber: string
    error: boolean
  }) => {
    const response = error
      ? {
          status: 500,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: {
            errorCode: 'VC5001',
            errorMessage: 'Service unavailable',
            httpStatusCode: 500,
          },
        }
      : {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: learnerEmployabilitySkills,
        }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerEmployabilitySkills/${prisonerNumber}`,
      },
      response,
    })
  },
  stubGetLearnerEducation: (prisonerNumber: string, page = 0) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/curiousApi/learnerEducation/${prisonerNumber}`,
        queryParameters: {
          page: { equalTo: `${page}` },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: learnerEducationPagedResponse(prisonerNumber),
      },
    })
  },
  stubGetLearnerEducationForPrisonWithCoursesButNoneCompleteInTheLast12Months: (prisonerNumber: string, page = 0) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/curiousApi/learnerEducation/${prisonerNumber}`,
        queryParameters: {
          page: { equalTo: `${page}` },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: learnerEducationPagedResponseContainingCompletedCourseNotInLast12Months(prisonerNumber),
      },
    })
  },
  stubGetLearnerEducationForPrisonWithCoursesButNoneComplete: (prisonerNumber: string, page = 0) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/curiousApi/learnerEducation/${prisonerNumber}`,
        queryParameters: {
          page: { equalTo: `${page}` },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: learnerEducationPagedResponsePage1Of1(prisonerNumber),
      },
    })
  },
  stubGetLearnerEducationForPrisonerWithNoCourses: (prisonerNumber: string, page = 0) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/curiousApi/learnerEducation/${prisonerNumber}`,
        queryParameters: {
          page: { equalTo: `${page}` },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: learnerEducationPagedResponseContainingNoCourses(),
      },
    })
  },
  stubGetLearnerEducation404Error: (prisonerNumber: string, page = 0) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/curiousApi/learnerEducation/${prisonerNumber}`,
        queryParameters: {
          page: { equalTo: `${page}` },
        },
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          errorCode: 'VC4004',
          errorMessage: 'Resource not found',
          httpStatusCode: 404,
        },
      },
    })
  },
  stubGetLearnerEducation401Error: (prisonerNumber: string, page = 0) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/curiousApi/learnerEducation/${prisonerNumber}`,
        queryParameters: {
          page: { equalTo: `${page}` },
        },
      },
      response: {
        status: 401,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          errorCode: 'VC4001',
          errorMessage: 'Invalid token',
          httpStatusCode: 401,
        },
      },
    })
  },
  stubGetLearnerLatestAssessments: ({ prisonerNumber, error = false }: { prisonerNumber: string; error: boolean }) => {
    const response = error
      ? {
          status: 500,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: {
            errorCode: 'VC5001',
            errorMessage: 'Service unavailable',
            httpStatusCode: 500,
          },
        }
      : {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: LearnerLatestAssessmentsMock,
        }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/latestLearnerAssessments/${prisonerNumber}`,
      },
      response,
    })
  },

  stubGetCuriousGoals: (prisonerNumber = 'G6123VU') => {
    const responseBodyForPrisonerWithGoals = aValidLearnerGoals({ prn: prisonerNumber })

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerGoals/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: responseBodyForPrisonerWithGoals,
      },
    })
  },

  stubGetCuriousGoalsForPrisonerWithNoGoals: (prisonerNumber = 'G6123VU') => {
    const responseBodyForPrisonerWithNoGoals = aValidLearnerGoals({
      prn: prisonerNumber,
      employmentGoals: [],
      personalGoals: [],
      longTermGoals: [],
      shortTermGoals: [],
    })

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerGoals/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: responseBodyForPrisonerWithNoGoals,
      },
    })
  },

  stubGetCuriousGoals404Error: (prisonerNumber = 'G6123VU') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerGoals/${prisonerNumber}`,
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          errorCode: 'VC4004',
          errorMessage: 'Resource not found',
          httpStatusCode: 404,
        },
      },
    })
  },

  stubGetCuriousGoals500Error: (prisonerNumber = 'G6123VU') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerGoals/${prisonerNumber}`,
      },
      response: {
        status: 500,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          errorCode: 'VC5001',
          errorMessage: 'Service unavailable',
          httpStatusCode: 500,
        },
      },
    })
  },

  stubGetLearnerNeurodivergence: ({ prisonerNumber, error = false }: { prisonerNumber: string; error: boolean }) => {
    const response = error
      ? {
          status: 500,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: {
            errorCode: 'VC5001',
            errorMessage: 'Service unavailable',
            httpStatusCode: 500,
          },
        }
      : {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: LearnerNeurodivergenceMock,
        }

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerNeurodivergence/${prisonerNumber}`,
      },
      response,
    })
  },

  stubGetOffenderAttendanceHistory: (prisonerNumber: string) => {
    const todaysDate = format(startOfToday(), 'yyyy-MM-dd')
    const sixMonthsAgo = format(sub(startOfToday(), { months: 6 }), 'yyyy-MM-dd')
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offender-activities/${prisonerNumber}/attendance-history\\?fromDate=${sixMonthsAgo}&toDate=${todaysDate}&page=0&size=20`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: OffenderAttendanceHistoryMock(),
      },
    })
  },
  stubGetOffenderActivities: (params: { prisonerNumber; emptyStates }) => {
    let jsonResp
    if (params.emptyStates === false) {
      jsonResp = OffenderActivitiesMock
    } else if (params.emptyStates === true) {
      jsonResp = OffenderActivitiesEmptyMock
    }
    const today = format(startOfToday(), 'yyyy-MM-dd')
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offender-activities/${params.prisonerNumber}/activities-history\\?earliestEndDate=${today}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: jsonResp,
      },
    })
  },
}
