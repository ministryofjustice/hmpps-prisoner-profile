import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubGetPlpAllGoals = (prisonerNumber = 'G6123VU'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `/plpApi/action-plans/${prisonerNumber}/goals`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        goals: [
          {
            goalReference: '10efc562-be8f-4675-9283-9ede0c19dade',
            title: 'Learn French',
            status: 'ACTIVE',
            steps: [
              {
                stepReference: '177e45eb-c8fe-438b-aa81-1bf9157efa05',
                title: 'Book French course',
                status: 'NOT_STARTED',
                sequenceNumber: 1,
              },
              {
                stepReference: '32992dd1-7dc6-4480-b2fc-61bc36a6a775',
                title: 'Complete French course',
                status: 'NOT_STARTED',
                sequenceNumber: 2,
              },
            ],
            createdBy: 'auser_gen',
            createdAt: '2023-07-20T09:29:15.386Z',
            updatedBy: 'auser_gen',
            updatedAt: '2023-07-20T09:29:15.386Z',
            targetCompletionDate: '2024-02-29',
            notes: 'Billy will struggle to concentrate for long periods.',
          },
        ],
      },
    },
  })

const stubGetPlpAllGoalsForPrisonerWithNoGoals = (prisonerNumber = 'G6123VU'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `/plpApi/action-plans/${prisonerNumber}/goals`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        goals: [],
      },
    },
  })

const stubGetPlpAllGoals500Error = (prisonerNumber = 'G6123VU'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `/plpApi/action-plans/${prisonerNumber}/goals`,
    },
    response: {
      status: 500,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        status: 500,
        errorCode: null,
        userMessage: 'An unexpected error occurred',
        developerMessage: 'An unexpected error occurred',
        moreInfo: null,
      },
    },
  })

const stubGetPlpAllGoalsPrisonerHasNoPlanYet = (prisonerNumber = 'G6123VU'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `/plpApi/action-plans/${prisonerNumber}/goals`,
    },
    response: {
      status: 404,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        status: 404,
        errorCode: null,
        userMessage: 'Prisoner has no plan',
        developerMessage: 'Prisoner has no plan',
        moreInfo: null,
      },
    },
  })

export default {
  stubGetPlpAllGoals,
  stubGetPlpAllGoalsForPrisonerWithNoGoals,
  stubGetPlpAllGoals500Error,
  stubGetPlpAllGoalsPrisonerHasNoPlanYet,
}
