import { PrisonPersonApiClient } from '../../server/data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { distinguishingMarkMock } from '../../server/data/localMockData/distinguishingMarksMock'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import { physicalAttributesMock } from '../../server/data/localMockData/physicalAttributesMock'

export const prisonPersonApiClientMock = (): PrisonPersonApiClient => ({
  getPrisonPerson: jest.fn(async () => ({
    prisonerNumber: PrisonerMockDataA.prisonerNumber,
    physicalAttributes: physicalAttributesMock,
  })),
  updatePhysicalAttributes: jest.fn(),
  getReferenceDataDomains: jest.fn(),
  getReferenceDataDomain: jest.fn(),
  getReferenceDataCodes: jest.fn(),
  getReferenceDataCode: jest.fn(),
  updateHealth: jest.fn(),
  getFieldHistory: jest.fn(),
  getDistinguishingMarks: jest.fn().mockResolvedValue([distinguishingMarkMock]),
  getImage: jest.fn(),
  postDistinguishingMark: jest.fn(),
  patchDistinguishingMark: jest.fn(),
  postDistinguishingMarkPhoto: jest.fn(),
  getDistinguishingMark: jest.fn(),
})
