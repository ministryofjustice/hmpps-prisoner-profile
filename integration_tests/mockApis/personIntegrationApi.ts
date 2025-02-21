import { stubGetWithBody, stubPatchWithResponse, stubPostWithResponse, stubPutWithResponse } from './utils'
import {
  CorePersonPhysicalAttributes,
  CorePersonRecordReferenceDataCodeDto,
  MilitaryRecord,
} from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'

const baseUrl = '/personIntegration'

export default {
  stubPersonIntegrationGetReferenceData: ({
    domain,
    referenceData,
  }: {
    domain: string
    referenceData: CorePersonRecordReferenceDataCodeDto[]
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

  stubPersonIntegrationNationalityUpdate: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v1/core-person-record/nationality\\?prisonerNumber=.*`,
      responseBody: null,
    }),

  stubPersonIntegrationGetMilitaryRecords: (militaryRecords: MilitaryRecord[]) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/core-person-record/military-records\\?prisonerNumber=.*`,
      body: militaryRecords,
    }),

  stubPersonIntegrationUpdateMilitaryRecord: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v1/core-person-record/military-records\\?prisonerNumber=.*&militarySeq=.*`,
      responseBody: null,
    }),

  stubPersonIntegrationCreateMilitaryRecord: () =>
    stubPostWithResponse<void>({
      path: `${baseUrl}/v1/core-person-record/military-records\\?prisonerNumber=.*`,
      responseBody: null,
    }),

  stubPersonIntegrationGetPhysicalAttributes: (physicalAttributes: CorePersonPhysicalAttributes) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/core-person-record/physical-attributes\\?prisonerNumber=.*`,
      body: physicalAttributes,
    }),

  stubPersonIntegrationUpdatePhysicalAttributes: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v1/core-person-record/physical-attributes\\?prisonerNumber=.*`,
      responseBody: null,
    }),
}
