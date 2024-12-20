import { stubGetWithBody, stubPatchWithResponse } from './utils'
import { ReferenceDataCodeDto } from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'

const baseUrl = '/personIntegration/'

export default {
  // PATCH routes
  stubPersonIntegrationUpdateBirthPlace: () =>
    stubPatchWithResponse<void>({
      path: `${baseUrl}v1/core-person-record\\?prisonerNumber=.*`,
      responseBody: null,
    }),

  stubPersonIntegrationUpdateNationality: () =>
    stubPatchWithResponse<void>({
      path: `${baseUrl}v1/core-person-record\\?prisonerNumber=.*`,
      responseBody: null,
    }),

  stubGetReferenceDataCodesForDomain: ({ domain, response }: { domain: string; response: ReferenceDataCodeDto[] }) =>
    stubGetWithBody({
      path: `${baseUrl}v1/core-person-record/reference-data/domain/${domain}/codes`,
      body: response,
    }),
}
