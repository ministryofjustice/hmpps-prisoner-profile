import { stubFor } from './wiremock'
import type { HasNeed } from '../../server/data/interfaces/supportForAdditionalNeedsApi/SupportForAdditionalNeeds'
import { prisonerHasNeedsMock } from '../../server/data/localMockData/supportForAdditionalNeedsMock'

export default {
  stubSupportForAdditionalNeeds({
    prisonerNumber = 'G6123VU',
    response = prisonerHasNeedsMock,
  }: {
    prisonerNumber: string
    response: HasNeed
  }) {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/profile/${prisonerNumber}/has-need`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    })
  },
}
