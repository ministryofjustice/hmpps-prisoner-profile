import {
  PrisonPerson,
  PrisonPersonPhysicalAttributes,
} from '../../server/data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { stubGetWithBody, stubPutWithResponse } from './utils'

const mockPrisonPerson = (prisonerNumber: string): PrisonPerson => ({
  prisonerNumber,
  physicalAttributes: {
    height: 150,
    weight: 65,
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
}
