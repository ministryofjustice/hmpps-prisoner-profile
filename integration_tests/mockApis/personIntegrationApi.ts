import { stubGetWithBody, stubPatchWithResponse, stubPostWithResponse, stubPutWithResponse } from './utils'
import {
  CorePersonPhysicalAttributesDto,
  CorePersonRecordReferenceDataCodeDto,
  MilitaryRecord,
  PersonIntegrationDistinguishingMark,
  PersonIntegrationDistinguishingMarkImageDetail,
} from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { distinguishingMarkMock } from '../../server/data/localMockData/distinguishingMarksMock'
import { stubFor } from './wiremock'

const baseUrl = '/personIntegration'
const placeHolderImagePath = './../../assets/images/average-face.jpg'

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

  stubPersonIntegrationGetPhysicalAttributes: (physicalAttributes: CorePersonPhysicalAttributesDto) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/core-person-record/physical-attributes\\?prisonerNumber=.*`,
      body: physicalAttributes,
    }),

  stubPersonIntegrationUpdatePhysicalAttributes: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v1/core-person-record/physical-attributes\\?prisonerNumber=.*`,
      responseBody: null,
    }),

  stubGetDistinguishingMarksForPrisoner: ({
    prisonerNumber,
    response = [distinguishingMarkMock],
  }: {
    prisonerNumber: string
    response: PersonIntegrationDistinguishingMark[]
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/distinguishing-marks\\?prisonerNumber=${prisonerNumber}&sourceSystem=NOMIS`,
      body: response,
    }),

  stubGetDistinguishingMarkImage: (
    photo: PersonIntegrationDistinguishingMarkImageDetail = distinguishingMarkMock.photographUuids[0],
  ) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `${baseUrl}/v1/distinguishing-mark/image/${photo.id}\\?sourceSystem=NOMIS`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
        },
        bodyFileName: placeHolderImagePath,
      },
    })
  },

  stubPostNewDistinguishingMark: ({ prisonerNumber }: { prisonerNumber: string }) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `${baseUrl}/v1/distinguishing-mark\\?prisonerNumber=${prisonerNumber}&sourceSystem=NOMIS`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: distinguishingMarkMock,
      },
    })
  },

  stubPutDistinguishingMark: ({
    prisonerNumber,
    markId = '100',
    response = distinguishingMarkMock,
  }: {
    prisonerNumber: string
    markId: string
    response: PersonIntegrationDistinguishingMark
  }) => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `${baseUrl}/v1/distinguishing-mark/${prisonerNumber}-${markId}\\?sourceSystem=NOMIS`,
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

  stubPostDistinguishingMarkPhoto: ({
    prisonerNumber,
    markId = '100',
    response = distinguishingMarkMock,
  }: {
    prisonerNumber: string
    markId: string
    response: PersonIntegrationDistinguishingMark
  }) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `${baseUrl}/v1/distinguishing-mark/${prisonerNumber}-${markId}/image\\?sourceSystem=NOMIS`,
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

  stubGetDistinguishingMark: ({
    prisonerNumber,
    markId = '100',
    response = distinguishingMarkMock,
  }: {
    prisonerNumber: string
    markId: string
    response: PersonIntegrationDistinguishingMark
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/distinguishing-mark/${prisonerNumber}-${markId}\\?sourceSystem=NOMIS`,
      body: response,
    }),
}
