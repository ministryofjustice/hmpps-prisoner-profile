import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import type { HighProfilePrisonerRequest, HighProfilePrisonerResponse } from '../../server/data/permissionsApiClient'

export default {
  stubPermissionsApiPing: (httpStatus = 200): SuperAgentRequest => stubPing('/permissions', httpStatus),

  stubCheckHighProfilePrisoners: ({
    highProfilePrisoners = [],
    prisonerNumbersToCheck,
  }: {
    highProfilePrisoners: string[]
    prisonerNumbersToCheck?: string[] | undefined
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/permissions/api/high-profile-prisoners',
        bodyPatterns: prisonerNumbersToCheck
          ? [{ equalToJson: { prisonerNumbersToCheck } satisfies HighProfilePrisonerRequest }]
          : [],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { highProfilePrisoners } satisfies HighProfilePrisonerResponse,
      },
    }),
}
