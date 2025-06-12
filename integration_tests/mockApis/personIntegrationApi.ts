import { stubGetWithBody, stubPatchWithResponse, stubPostWithResponse, stubPutWithResponse } from './utils'
import {
  ContactsResponseDto,
  CorePersonPhysicalAttributesDto,
  CorePersonRecordReferenceDataCodeDto,
  MilitaryRecord,
  PersonIntegrationDistinguishingMark,
  PersonIntegrationDistinguishingMarkImageDetail,
  PseudonymResponseDto,
} from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { distinguishingMarkMock } from '../../server/data/localMockData/distinguishingMarksMock'
import { stubFor } from './wiremock'
import {
  ContactsResponseMock,
  PseudonymResponseMock,
} from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'

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
        urlPattern: `${baseUrl}/v1/distinguishing-mark/image/${imageId}\\?sourceSystem=NOMIS`,
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

  stubGetPseudonyms: ({
    prisonerNumber,
    response = [PseudonymResponseMock],
  }: {
    prisonerNumber: string
    response: PseudonymResponseDto[]
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/pseudonyms\\?prisonerNumber=${prisonerNumber}&sourceSystem=NOMIS`,
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
        urlPattern: `${baseUrl}/v1/pseudonym/${pseudonymId}\\?sourceSystem=NOMIS`,
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
        urlPattern: `${baseUrl}/v1/pseudonym\\?prisonerNumber=${prisonerNumber}&sourceSystem=NOMIS`,
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
      path: `${baseUrl}/v1/core-person-record/profile-image\\?prisonerNumber=${prisonerNumber}`,
      responseBody: {},
    }),

  stubPersonIntegrationGetContacts: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/person/${prisonerNumber}/contacts`,
      body: ContactsResponseMock,
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
      path: `${baseUrl}/v1/person/${prisonerNumber}/contacts/${contactId}`,
      responseBody: response ?? ContactsResponseMock[0],
    }),
}
