import { stubGetWithBody, stubPatchWithResponse, stubPostWithResponse, stubPutWithResponse } from './utils'
import {
  AddressResponseDto,
  ContactsResponseDto,
  CorePersonPhysicalAttributesDto,
  CorePersonRecordReferenceDataCodeDto,
  MilitaryRecord,
  PersonIntegrationDistinguishingMark,
  PersonIntegrationDistinguishingMarkImageDetail,
  PrisonerProfileSummary,
  PseudonymResponseDto,
} from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { distinguishingMarkMock } from '../../server/data/localMockData/distinguishingMarksMock'
import { stubFor } from './wiremock'
import {
  ContactsResponseMock,
  PrisonerProfileSummaryMock,
  PseudonymResponseMock,
} from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import { mockAddressResponseDto } from '../../server/data/localMockData/personIntegrationApi/addresses'

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
      path: `${baseUrl}/v2/reference-data/domain/${domain}/codes`,
      body: referenceData,
    }),

  stubPersonIntegrationUpdate: () =>
    stubPatchWithResponse<void>({
      path: `${baseUrl}/v2/person\\?prisonerNumber=.*`,
      responseBody: null,
    }),

  stubPersonIntegrationReligionUpdate: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v2/person/.*/religion`,
      responseBody: null,
    }),

  stubPersonIntegrationNationalityUpdate: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v2/person/.*/nationality`,
      responseBody: null,
    }),

  stubPersonIntegrationGetMilitaryRecords: (militaryRecords: MilitaryRecord[]) =>
    stubGetWithBody({
      path: `${baseUrl}/v2/person/.*/military-records`,
      body: militaryRecords,
    }),

  stubPersonIntegrationUpdateMilitaryRecord: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v2/person/.*/military-records\\?militarySeq=.*`,
      responseBody: null,
    }),

  stubPersonIntegrationCreateMilitaryRecord: () =>
    stubPostWithResponse<void>({
      path: `${baseUrl}/v2/person/.*/military-records`,
      responseBody: null,
    }),

  stubPersonIntegrationGetPhysicalAttributes: (physicalAttributes: CorePersonPhysicalAttributesDto) =>
    stubGetWithBody({
      path: `${baseUrl}/v2/person/.*/physical-attributes`,
      body: physicalAttributes,
    }),

  stubPersonIntegrationUpdatePhysicalAttributes: () =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v2/person/.*/physical-attributes`,
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
      path: `${baseUrl}/v2/person/${prisonerNumber}/distinguishing-marks`,
      body: response,
    }),

  stubGetDistinguishingMarkImage: (
    photo: PersonIntegrationDistinguishingMarkImageDetail = distinguishingMarkMock.photographUuids[0],
  ) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `${baseUrl}/v2/person/.*/distinguishing-mark/image/${photo.id}`,
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
        urlPattern: `${baseUrl}/v2/person/${prisonerNumber}/distinguishing-mark`,
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
        urlPattern: `${baseUrl}/v2/person/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${markId}`,
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

  stubPutDistinguishingMarkPhoto: ({
    imageId = '100',
    response = distinguishingMarkMock,
  }: {
    prisonerNumber: string
    imageId: string
    response: PersonIntegrationDistinguishingMark
  }) => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `${baseUrl}/v2/person/.*/distinguishing-mark/${imageId}/image`,
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
        urlPattern: `${baseUrl}/v2/person/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${markId}/image`,
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
      path: `${baseUrl}/v2/person/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${markId}`,
      body: response,
    }),

  stubGetPseudonyms: ({
    prisonerNumber,
    response = [PseudonymResponseMock],
  }: {
    prisonerNumber: string
    response: PseudonymResponseDto[]
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v2/person/${prisonerNumber}/pseudonyms`,
      body: response,
    }),

  stubUpdatePseudonym: ({
    pseudonymId = 12345,
    response = PseudonymResponseMock,
  }: {
    pseudonymId: number
    response: PseudonymResponseDto
  }) =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: `${baseUrl}/v2/person/.*/pseudonym/${pseudonymId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubCreatePseudonym: ({
    prisonerNumber = PrisonerMockDataA.prisonerNumber,
    response = PseudonymResponseMock,
  }: {
    prisonerNumber: string
    response: PseudonymResponseDto
  }) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `${baseUrl}/v2/person/${prisonerNumber}/pseudonym`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubUpdateProfileImage: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPutWithResponse({
      path: `${baseUrl}/v2/person/${prisonerNumber}/profile-image`,
      responseBody: {},
    }),

  stubGetAddresses: ({
    prisonerNumber,
    response = [mockAddressResponseDto],
  }: {
    prisonerNumber: string
    response: AddressResponseDto[]
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v2/person/${prisonerNumber}/addresses`,
      body: response,
    }),

  stubCreateAddress: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPostWithResponse({
      path: `${baseUrl}/v2/person/${prisonerNumber}/addresses`,
      responseBody: {},
    }),

  stubPersonIntegrationGetContacts: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubGetWithBody({
      path: `${baseUrl}/v2/person/${prisonerNumber}/contacts`,
      body: ContactsResponseMock,
    }),

  stubPersonIntegrationCreateContact: ({
    prisonerNumber,
    response,
  }: {
    prisonerNumber: string
    response?: ContactsResponseDto
  }) =>
    stubPostWithResponse({
      path: `${baseUrl}/v2/person/${prisonerNumber}/contacts`,
      responseBody: response ?? ContactsResponseMock[0],
    }),

  stubPersonIntegrationUpdateContact: ({
    prisonerNumber,
    contactId,
    response,
  }: {
    prisonerNumber: string
    contactId: string
    response?: ContactsResponseDto
  }) =>
    stubPutWithResponse({
      path: `${baseUrl}/v2/person/${prisonerNumber}/contacts/${contactId}`,
      responseBody: response ?? ContactsResponseMock[0],
    }),

  stubAddIdentifiers: ({ prisonerNumber = PrisonerMockDataA.prisonerNumber }: { prisonerNumber: string }) =>
    stubPostWithResponse<void>({
      path: `${baseUrl}/v2/person/${prisonerNumber}/identifiers`,
      responseBody: null,
    }),

  stubUpdateIdentifier: ({ offenderId = 1, seqId = 1 }: { offenderId: number; seqId: number }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v2/person/.*/identifiers\\?offenderId=${offenderId}&seqId=${seqId}`,
      responseBody: null,
    }),

  stubGetPrisonerProfileSummary: ({
    prisonerNumber,
    response = PrisonerProfileSummaryMock,
  }: {
    prisonerNumber: string
    response?: PrisonerProfileSummary
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v2/person/${prisonerNumber}`,
      body: response,
    }),
}
