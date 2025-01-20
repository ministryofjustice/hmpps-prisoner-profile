import { stubGetWithBody, stubPatchWithResponse, stubPutWithResponse } from './utils'
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

  stubPersonIntegrationReligionUpdate: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v1/person-protected-characteristics/religion\\?prisonerNumber=.*`,
      responseBody: null,
    }),
}
