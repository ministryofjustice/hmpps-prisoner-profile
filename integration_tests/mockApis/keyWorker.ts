import { stubFor } from './wiremock'
import { keyWorkerMock } from '../../server/data/localMockData/keyWorker'
import { ComplexityLevel } from '../../server/data/interfaces/complexityApi/ComplexityOfNeed'

export default {
  stubKeyWorkerData: ({
    prisonerNumber,
    notFound = false,
    error = false,
  }: {
    prisonerNumber: string
    notFound: boolean
    error: boolean
  }) => {
    // eslint-disable-next-line no-nested-ternary
    const response = error
      ? {
          status: 500,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: {
            errorMessage: 'Service unavailable',
            httpStatusCode: 500,
          },
        }
      : notFound
        ? {
            status: 404,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: {
              errorMessage: 'Not found',
              httpStatusCode: 404,
            },
          }
        : {
            status: 200,
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
            },
            jsonBody: keyWorkerMock,
          }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/key-worker/offender/${prisonerNumber}`,
      },
      response,
    })
  },
  stubCurrentAllocations: ({ prisonerNumber, complexityLevel }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/prisoners/${prisonerNumber}/allocations/current`,
      },
      response: {
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
