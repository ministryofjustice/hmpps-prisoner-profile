import {
  PrisonPerson,
  PrisonPersonPhysicalAttributes,
  ReferenceDataCode,
  ReferenceDataDomain,
} from '../../server/data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { stubGetWithBody, stubPatchWithResponse } from './utils'

const mockPrisonPerson = (prisonerNumber: string): PrisonPerson => ({
  prisonerNumber,
  physicalAttributes: {
    height: { value: 150, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
    weight: { value: 65, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
    hair: { id: '', description: '' },
    facialHair: { id: '', description: '' },
    face: { id: '', description: '' },
    build: { id: '', description: '' },
    leftEyeColour: { id: '', description: '' },
    rightEyeColour: { id: '', description: '' },
    shoeSize: { value: '7.5', lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
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
}
