import { stubFor } from './wiremock'
import { communityManagerMock } from '../../server/data/localMockData/communityManagerMock'
import { mockProbationDocumentsResponse } from '../../server/data/localMockData/deliusApi/probationDocuments'
import CommunityManager from '../../server/data/interfaces/deliusApi/CommunityManager'

export default {
  stubGetCommunityManager: (resp: CommunityManager = communityManagerMock) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/delius/probation-cases/G6123VU/community-manager`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },

  stubGetCommunityManagerNotFound: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/delius/probation-cases/G6123VU/community-manager`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          errorMessage: 'Not found',
          httpStatusCode: 404,
        },
      },
    })
  },

  stubGetProbationDocuments: ({ notFound = false } = { notFound: false }) => {
    if (notFound) {
      return stubFor({
        request: {
          method: 'GET',
          urlPattern: `/delius/probation-cases/G6123VU/documents`,
        },
        response: {
          status: 404,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: {},
        },
      })
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/delius/probation-cases/G6123VU/documents`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockProbationDocumentsResponse,
      },
    })
  },

  stubDeliusApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/delius/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
