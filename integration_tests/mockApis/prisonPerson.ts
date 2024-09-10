import {
  PrisonPerson,
  PrisonPersonHealth,
  PrisonPersonPhysicalAttributes,
  ReferenceDataCode,
  ReferenceDataDomain,
} from '../../server/data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { stubGetWithBody, stubPatchWithResponse } from './utils'
import { stubFor } from './wiremock'

const mockPrisonPerson = (prisonerNumber: string): PrisonPerson => ({
  prisonerNumber,
  physicalAttributes: {
    height: { value: 150, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
    weight: { value: 65, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
    hair: { value: { id: '', description: '' }, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
    facialHair: {
      value: { id: '', description: '' },
      lastModifiedAt: '2024-07-01T01:02:03+0100',
      lastModifiedBy: 'USER1',
    },
    face: { value: { id: '', description: '' }, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
    build: { value: { id: '', description: '' }, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
    leftEyeColour: {
      value: { id: '', description: '' },
      lastModifiedAt: '2024-07-01T01:02:03+0100',
      lastModifiedBy: 'USER1',
    },
    rightEyeColour: {
      value: { id: '', description: '' },
      lastModifiedAt: '2024-07-01T01:02:03+0100',
      lastModifiedBy: 'USER1',
    },
    shoeSize: { value: '7.5', lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
  },
  health: {
    smokerOrVaper: {
      value: { id: 'SMOKE_SMOKER', description: '', listSequence: 0, isActive: true },
      lastModifiedAt: '2024-07-01T01:02:03+0100',
      lastModifiedBy: 'USER1',
    },
  },
})

const baseUrl = '/prisonPerson/'

export default {
  stubPrisonPerson: ({
    prisonerNumber,
    overrides = {},
  }: {
    prisonerNumber: string
    overrides: Partial<PrisonPerson>
  }) =>
    stubGetWithBody({
      path: `${baseUrl}prisoners/${prisonerNumber}`,
      body: {
        ...mockPrisonPerson(prisonerNumber),
        ...overrides,
      },
    }),

  // PATCH routes
  stubPrisonPersonUpdatePhysicalAttributes: ({
    prisonerNumber,
    overrides = {},
  }: {
    prisonerNumber: string
    overrides: Partial<PrisonPersonPhysicalAttributes>
  }) =>
    stubPatchWithResponse<PrisonPersonPhysicalAttributes>({
      path: `${baseUrl}prisoners/${prisonerNumber}/physical-attributes`,
      responseBody: {
        ...mockPrisonPerson(prisonerNumber).physicalAttributes,
        ...overrides,
      },
    }),

  stubPrisonPersonUpdateHealth: ({
    prisonerNumber,
    overrides = {},
  }: {
    prisonerNumber: string
    overrides: Partial<PrisonPersonHealth>
  }) =>
    stubPatchWithResponse<PrisonPersonHealth>({
      path: `${baseUrl}prisoners/${prisonerNumber}/health`,
      responseBody: {
        ...mockPrisonPerson(prisonerNumber).health,
        ...overrides,
      },
    }),

  // Reference data
  stubGetReferenceDataDomains: (resp: ReferenceDataDomain[]) =>
    stubGetWithBody({
      path: `${baseUrl}reference-data/domains\\?includeInactive=false`,
      body: resp,
    }),

  stubGetReferenceDataDomain: (resp: ReferenceDataDomain) =>
    stubGetWithBody({
      path: `${baseUrl}reference-data/domains/[^/]*`,
      body: resp,
    }),

  stubGetReferenceDataCodes: (resp: ReferenceDataCode[]) =>
    stubGetWithBody({
      path: `${baseUrl}reference-data/domains/[^/]*/codes\\?includeInactive=false`,
      body: resp,
    }),

  stubGetReferenceDataCode: (resp: ReferenceDataCode) =>
    stubGetWithBody({
      path: `${baseUrl}reference-data/domains/[^/]*/codes/[^/]*`,
      body: resp,
    }),

  stubPrisonPersonApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `${baseUrl}health/ping`,
      },
      response: {
        status: httpStatus,
      },
    }),
}
