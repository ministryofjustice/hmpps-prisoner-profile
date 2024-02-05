import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubGetPlpActionPlan = (prisonerNumber = 'G6123VU'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/plpApi/action-plans/${prisonerNumber}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        prisonerNumber: `${prisonerNumber}`,
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

const stubGetPlpActionPlanForPrisonerWithNoGoals = (prisonerNumber = 'G6123VU'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/plpApi/action-plans/${prisonerNumber}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        prisonerNumber: `${prisonerNumber}`,
        goals: [],
      },
    },
  })

const stubGetPlpActionPlan500Error = (prisonerNumber = 'G6123VU'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/plpApi/action-plans/${prisonerNumber}`,
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

export default { stubGetPlpActionPlan, stubGetPlpActionPlanForPrisonerWithNoGoals, stubGetPlpActionPlan500Error }
