import { stubFor } from './wiremock'
import { complexityOfNeedHighMock, complexityOfNeedLowMock } from '../../server/data/localMockData/complexityOfNeedMock'
import { ComplexityLevel } from '../../server/interfaces/complexityApi/complexityOfNeed'

export default {
  stubComplexityData: (params: { prisonerNumber: string; complexityLevel: ComplexityLevel }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/complexity/complexity-of-need/offender-no/${params.prisonerNumber}`,
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
}
