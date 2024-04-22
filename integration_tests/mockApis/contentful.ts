import { stubFor } from './wiremock'
import { bannerCollectionMock } from '../../server/data/localMockData/contentfulApi/bannerMock'

export default {
  stubBanner: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/contentful/.*',
        bodyPatterns: [
          {
            contains: 'banner',
          },
        ],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: bannerCollectionMock,
      },
    })
  },
}
