import { stubGetWithBody, stubPatchWithResponse } from './utils'
import { ReferenceDataCodeDto } from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'

const baseUrl = '/personIntegration'

export default {
  stubPersonIntegrationGetReferenceData: ({
    domain,
    referenceData,
  }: {
    domain: string
    referenceData: ReferenceDataCodeDto
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/core-person-record/reference-data/domain/${domain}/codes`,
      body: referenceData,
    }),

  stubPersonIntegrationUpdate: () =>
    stubPatchWithResponse<void>({
      path: `${baseUrl}/v1/core-person-record\\?prisonerNumber=.*`,
      responseBody: null,
    }),
}
