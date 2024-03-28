import { stubFor } from './wiremock'
import { communityManagerMock } from '../../server/data/localMockData/communityManagerMock'
import { mockProbationDocumentsResponse } from '../../server/data/localMockData/deliusApi/probationDocuments'

export default {
  stubGetCommunityManager: (resp?: never) => {
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
        jsonBody: resp !== undefined ? resp : communityManagerMock,
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
}
