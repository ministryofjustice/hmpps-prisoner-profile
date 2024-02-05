import { format, startOfToday, sub } from 'date-fns'
import { stubFor } from './wiremock'
import { learnerEmployabilitySkills } from '../../server/data/localMockData/learnerEmployabilitySkills'
import { learnerEducation } from '../../server/data/localMockData/learnerEducation'
import { LearnerProfiles } from '../../server/data/localMockData/learnerProfiles'
import { LearnerLatestAssessmentsMock } from '../../server/data/localMockData/learnerLatestAssessmentsMock'
import { LearnerGoalsMock, LearnerGoalsMockB } from '../../server/data/localMockData/learnerGoalsMock'
import { LearnerNeurodivergenceMock } from '../../server/data/localMockData/learnerNeurodivergenceMock'
import { OffenderAttendanceHistoryMock } from '../../server/data/localMockData/offenderAttendanceHistoryMock'
import {
  OffenderActivitiesEmptyMock,
  OffenderActivitiesMock,
} from '../../server/data/localMockData/offenderActivitiesMock'
import { LearnerGoalsTestParams } from '../../server/interfaces/learnerGoals'

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
  stubGetCuriousGoals: (params: LearnerGoalsTestParams) => {
    let jsonResp
    if (params.emptyStates === false) {
      jsonResp = LearnerGoalsMock
    } else if (params.emptyStates === true) {
      jsonResp = LearnerGoalsMockB
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/curiousApi/learnerGoals/${params.prisonerNumber}`,
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
