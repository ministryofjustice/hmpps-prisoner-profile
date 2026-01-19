import { stubFor } from './wiremock'
import type { HasNeed } from '../../server/data/interfaces/supportForAdditionalNeedsApi/SupportForAdditionalNeeds'
import { prisonerWithoutAdditionalNeedsMock } from '../../server/data/localMockData/supportForAdditionalNeedsMock'

export default {
  stubSupportForAdditionalNeeds({
    prisonerNumber = 'G6123VU',
    response = prisonerWithoutAdditionalNeedsMock,
    error = false,
  }: {
    prisonerNumber: string
    response: HasNeed
    error?: boolean
  }) {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/supportForAdditionalNeeds/profile/${prisonerNumber}/has-need`,
      },
      response: {
        status: error ? 500 : 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: error
          ? {
              httpStatusCode: 500,
              errorMessage: 'Service Error',
              errorCode: '500',
            }
          : response,
      },
    })
  },
}
