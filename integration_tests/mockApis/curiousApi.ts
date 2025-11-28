import { format, startOfToday, sub } from 'date-fns'
import type { AllQualificationsDTO } from 'curiousApiClient'
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
import { LearnerAssessmentsMock } from '../../server/data/localMockData/learnerAssessmentsMock'
import { LearnerQualificationsMock } from '../../server/data/localMockData/learnerQualificationsMock'

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

  // @deprecated
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

  stubGetLearnerAssessments: ({ prisonerNumber, error = undefined }: { prisonerNumber: string; error: 404 | 500 }) => {
    let response
    if (!error) {
      response = {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: LearnerAssessmentsMock,
      }
    } else {
      response =
        error === 404
          ? {
              status: 404,
              headers: { 'Content-Type': 'application/json;charset=UTF-8' },
              jsonBody: {
                errorCode: 'VC4004',
                errorMessage: 'Not found',
                httpStatusCode: 404,
              },
            }
          : {
              status: 500,
              headers: { 'Content-Type': 'application/json;charset=UTF-8' },
              jsonBody: {
                errorCode: 'VC5001',
                errorMessage: 'Service unavailable',
                httpStatusCode: 500,
              },
            }
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerAssessments/v2/${prisonerNumber}`,
      },
      response,
    })
  },

  stubGetLearnerQualifications: ({
    prisonerNumber,
    error = undefined,
    qualifications = undefined,
  }: {
    prisonerNumber: string
    error: 404 | 500
    qualifications: AllQualificationsDTO
  }) => {
    let response
    if (!error) {
      response = {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: qualifications || LearnerQualificationsMock,
      }
    } else {
      response =
        error === 404
          ? {
              status: 404,
              headers: { 'Content-Type': 'application/json;charset=UTF-8' },
              jsonBody: {
                errorCode: 'VC4004',
                errorMessage: 'Not found',
                httpStatusCode: 404,
              },
            }
          : {
              status: 500,
              headers: { 'Content-Type': 'application/json;charset=UTF-8' },
              jsonBody: {
                errorCode: 'VC5001',
                errorMessage: 'Service unavailable',
                httpStatusCode: 500,
              },
            }
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerQualifications/v2/${prisonerNumber}`,
      },
      response,
    })
  },
}
