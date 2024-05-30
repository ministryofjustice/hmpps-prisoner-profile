import { stubFor } from './wiremock'
import { componentsNoServicesMock } from '../../server/data/localMockData/componentApi/componentsMetaMock'

export default {
  stubComponentsMeta: (resp = componentsNoServicesMock) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/component/.*',
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
}
