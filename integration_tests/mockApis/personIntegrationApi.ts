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
  PseudonymResponseMock,
} from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import { mockAddressResponseDto } from '../../server/data/localMockData/personIntegrationApi/addresses'

const baseUrl = '/personIntegration/v2/person'
const refDataBaseUrl = '/personIntegration/v2/reference-data'
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
      path: `${refDataBaseUrl}/domain/${domain}/codes`,
      body: referenceData,
    }),

  stubPersonIntegrationUpdate: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPatchWithResponse<void>({
      path: `${baseUrl}/${prisonerNumber}`,
      responseBody: null,
    }),

  stubPersonIntegrationReligionUpdate: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/${prisonerNumber}/religion`,
      responseBody: null,
    }),

  stubPersonIntegrationNationalityUpdate: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/${prisonerNumber}/nationality`,
      responseBody: null,
    }),

  stubPersonIntegrationGetMilitaryRecords: ({
    prisonerNumber,
    militaryRecords,
  }: {
    prisonerNumber: string
    militaryRecords: MilitaryRecord[]
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/${prisonerNumber}/military-records`,
      body: militaryRecords,
    }),

  stubPersonIntegrationUpdateMilitaryRecord: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/${prisonerNumber}/military-records\\?militarySeq=.*`,
      responseBody: null,
    }),

  stubPersonIntegrationCreateMilitaryRecord: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPostWithResponse<void>({
      path: `${baseUrl}/${prisonerNumber}/military-records`,
      responseBody: null,
    }),

  stubPersonIntegrationGetPhysicalAttributes: ({
    prisonerNumber,
    physicalAttributes,
  }: {
    prisonerNumber: string
    physicalAttributes: CorePersonPhysicalAttributesDto
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/${prisonerNumber}/physical-attributes`,
      body: physicalAttributes,
    }),

  stubPersonIntegrationUpdatePhysicalAttributes: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/${prisonerNumber}/physical-attributes`,
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
      path: `${baseUrl}/${prisonerNumber}/distinguishing-marks`,
      body: response,
    }),

  stubGetDistinguishingMarkImage: (
    prisonerNumber: string,
    photo: PersonIntegrationDistinguishingMarkImageDetail = distinguishingMarkMock.photographUuids[0],
  ) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `${baseUrl}/${prisonerNumber}/distinguishing-mark/image/${photo.id}`,
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
        urlPattern: `${baseUrl}/${prisonerNumber}/distinguishing-mark`,
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
        urlPattern: `${baseUrl}/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${markId}`,
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
    prisonerNumber,
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
        urlPattern: `${baseUrl}/${prisonerNumber}/distinguishing-mark/${imageId}/image`,
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
        urlPattern: `${baseUrl}/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${markId}/image`,
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
      path: `${baseUrl}/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${markId}`,
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
      path: `${baseUrl}/${prisonerNumber}/pseudonyms`,
      body: response,
    }),

  stubUpdatePseudonym: ({
    prisonerNumber,
    pseudonymId = 12345,
    response = PseudonymResponseMock,
  }: {
    prisonerNumber: string
    pseudonymId: number
    response: PseudonymResponseDto
  }) =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: `${baseUrl}/${prisonerNumber}/pseudonym/${pseudonymId}`,
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
        urlPattern: `${baseUrl}/${prisonerNumber}/pseudonym`,
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
      path: `${baseUrl}/${prisonerNumber}/profile-image`,
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
      path: `${baseUrl}/${prisonerNumber}/addresses`,
      body: response,
    }),

  stubCreateAddress: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPostWithResponse({
      path: `${baseUrl}/${prisonerNumber}/addresses`,
      responseBody: {},
    }),

  stubPersonIntegrationGetContacts: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubGetWithBody({
      path: `${baseUrl}/${prisonerNumber}/contacts`,
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
      path: `${baseUrl}/${prisonerNumber}/contacts`,
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
      path: `${baseUrl}/${prisonerNumber}/contacts/${contactId}`,
      responseBody: response ?? ContactsResponseMock[0],
    }),

  stubAddIdentifiers: ({ prisonerNumber = PrisonerMockDataA.prisonerNumber }: { prisonerNumber: string }) =>
    stubPostWithResponse<void>({
      path: `${baseUrl}/${prisonerNumber}/identifiers`,
      responseBody: null,
    }),

  stubUpdateIdentifier: ({
    prisonerNumber,
    offenderId = 1,
    seqId = 1,
  }: {
    prisonerNumber: string
    offenderId: number
    seqId: number
  }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/${prisonerNumber}/identifiers\\?offenderId=${offenderId}&seqId=${seqId}`,
      responseBody: null,
    }),

  stubGetPrisonerProfileSummary: ({
    prisonerNumber,
    response,
  }: {
    prisonerNumber: string
    response: PrisonerProfileSummary
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/${prisonerNumber}`,
      body: response,
    }),
}
