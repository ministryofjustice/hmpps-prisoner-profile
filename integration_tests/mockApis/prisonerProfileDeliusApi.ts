import { stubFor } from './wiremock'
import { communityManagerMock } from '../../server/data/localMockData/communityManagerMock'

export default {
  stubGetCommunityManager: () => {
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
        jsonBody: communityManagerMock,
      },
    })
  },
}
