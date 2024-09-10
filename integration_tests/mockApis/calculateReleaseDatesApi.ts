import { stubFor } from './wiremock'
import { latestCalculation } from '../../server/data/localMockData/latestCalculationMock'
import LatestCalculation from '../../server/data/interfaces/calculateReleaseDatesApi/LatestCalculation'

export default {
  stubGetLatestCalculation: ({
    prisonerNumber = 'G6123VU',
    resp = latestCalculation,
    status = 200,
  }: {
    prisonerNumber: string
    resp: LatestCalculation
    status: number
  }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/calculateReleaseDatesApi/calculation/${prisonerNumber}/latest`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },

  stubCalculateReleaseDatesApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/calculateReleaseDatesApi/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
