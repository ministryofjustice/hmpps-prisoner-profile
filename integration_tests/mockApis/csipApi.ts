import { stubFor } from './wiremock'
import { currentCsipDetailMock } from '../../server/data/localMockData/csipApi/currentCsipDetailMock'

export default {
  stubGetCurrentCsip: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/csip/prisoners/${prisonerNumber}/csip-records/current`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: currentCsipDetailMock,
      },
    })
  },
}
