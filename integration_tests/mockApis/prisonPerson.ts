import {
  PrisonPerson,
  PrisonPersonPhysicalAttributes,
  ReferenceDataCode,
  ReferenceDataDomain,
} from '../../server/data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { stubGetWithBody, stubPutWithResponse } from './utils'

const mockPrisonPerson = (prisonerNumber: string): PrisonPerson => ({
  prisonerNumber,
  physicalAttributes: {
    height: 150,
    weight: 65,
  },
  physicalCharacteristics: {
    hair: { code: '', description: '' },
    facialHair: { code: '', description: '' },
    face: { code: '', description: '' },
    build: { code: '', description: '' },
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

  // PUT routes
  stubPrisonPersonUpdatePhysicalAttributes: ({
    prisonerNumber,
    overrides = {},
  }: {
    prisonerNumber: string
    overrides: Partial<PrisonPersonPhysicalAttributes>
  }) =>
    stubPutWithResponse<PrisonPersonPhysicalAttributes>({
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
