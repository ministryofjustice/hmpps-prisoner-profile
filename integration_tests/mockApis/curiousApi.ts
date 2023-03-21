// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment'

import { stubFor } from './wiremock'
import { learnerEmployabilitySkills } from '../../server/data/localMockData/learnerEmployabilitySkills'
import { learnerEducation } from '../../server/data/localMockData/learnerEducation'
import { LearnerProfiles } from '../../server/data/localMockData/learnerProfiles'
import { LearnerLatestAssessmentsMock } from '../../server/data/localMockData/learnerLatestAssessmentsMock'
import { LearnerGoalsMock } from '../../server/data/localMockData/learnerGoalsMock'
import { LearnerNeurodivergenceMock } from '../../server/data/localMockData/learnerNeurodivergenceMock'
import { OffenderAttendanceHistoryMock } from '../../server/data/localMockData/offenderAttendanceHistoryMock'
import { OffenderActivitiesMock } from '../../server/data/localMockData/offenderActivitiesMock'

export default {
  stubGetLearnerEmployabilitySkills: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerEmployabilitySkills/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: learnerEmployabilitySkills,
      },
    })
  },
  stubGetLearnerEducation: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerEducation/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: learnerEducation,
      },
    })
  },
  stubGetLearnerProfile: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerProfile/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: LearnerProfiles,
      },
    })
  },
  stubGetLearnerLatestAssessments: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/latestLearnerAssessments/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: LearnerLatestAssessmentsMock,
      },
    })
  },
  stubGetLearnerGoals: (prisonerNumber: string) => {
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
        jsonBody: LearnerGoalsMock,
      },
    })
  },
  stubGetLearnerNeurodivergence: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerNeurodivergence/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: LearnerNeurodivergenceMock,
      },
    })
  },
  stubGetOffenderAttendanceHistory: (prisonerNumber: string) => {
    const todaysDate = moment().startOf('day').format('YYYY-MM-DD')
    const sixMonthsAgo = moment().startOf('day').subtract(6, 'month').format('YYYY-MM-DD')

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
        jsonBody: OffenderAttendanceHistoryMock,
      },
    })
  },
  stubGetOffenderActivities: (prisonerNumber: string) => {
    const oneYearAgo = moment().startOf('day').subtract(12, 'month').format('YYYY-MM-DD')
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offender-activities/${prisonerNumber}/activities-history\\?earliestEndDate=${oneYearAgo}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: OffenderActivitiesMock,
      },
    })
  },
}
