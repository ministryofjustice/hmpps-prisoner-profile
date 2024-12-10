import { stubPatchWithResponse } from './utils'

const baseUrl = '/personIntegration/'

export default {
  // PATCH routes
  stubPersonIntegrationUpdateBirthPlace: () =>
    stubPatchWithResponse<void>({
      path: `${baseUrl}v1/core-person-record\\?prisonerNumber=.*`,
      responseBody: null,
    }),
}
