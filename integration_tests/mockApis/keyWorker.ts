import { stubFor } from './wiremock'
import { ComplexityLevel } from '../../server/data/interfaces/complexityApi/ComplexityOfNeed'

export default {
  stubCurrentAllocations: ({ prisonerNumber, complexityLevel, notFound = false }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/prisoners/${prisonerNumber}/allocations/current.*`,
      },
      response: notFound
        ? {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: {
              hasHighComplexityOfNeeds: complexityLevel === ComplexityLevel.High,
              allocations: [],
              latestRecordedEvents: [],
            },
          }
        : {
            status: 200,
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
            },
            jsonBody:
              complexityLevel === ComplexityLevel.High
                ? {
                    hasHighComplexityOfNeeds: true,
                    allocations: [],
                    latestRecordedEvents: [],
                  }
                : {
                    hasHighComplexityOfNeeds: false,
                    allocations: [
                      {
                        policy: {
                          code: 'KEY_WORKER',
                          description: 'Key worker',
                        },
                        prison: {
                          code: 'CODE',
                          description: 'Description',
                        },
                        staffMember: {
                          staffId: 3532453,
                          firstName: 'DAVE',
                          lastName: 'STEVENS',
                          emailAddresses: ['dave@steve.ns'],
                        },
                      },
                    ],
                    latestRecordedEvents: [
                      {
                        prison: {
                          code: 'CODE',
                          description: 'Description',
                        },
                        policy: 'KEY_WORKER',
                        type: 'SESSION',
                        occurredAt: '2025-06-24T12:00:00',
                      },
                    ],
                  },
          },
    }),

  stubCurrentAllocationsFail: prisonerNumber =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/prisoners/${prisonerNumber}/allocations/current`,
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
    }),
}
