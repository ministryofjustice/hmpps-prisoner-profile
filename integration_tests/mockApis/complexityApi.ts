import { stubFor } from './wiremock'
import { complexityOfNeedHighMock, complexityOfNeedLowMock } from '../../server/data/localMockData/complexityOfNeedMock'
import { ComplexityLevel } from '../../server/data/interfaces/complexityApi/ComplexityOfNeed'

export default {
  stubComplexityData: (params: { prisonerNumber: string; complexityLevel: ComplexityLevel }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/complexity/v1/complexity-of-need/offender-no/${params.prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: params.complexityLevel === ComplexityLevel.High ? complexityOfNeedHighMock : complexityOfNeedLowMock,
      },
    })
  },

  stubComplexityApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/complexity/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
