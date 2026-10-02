import type PrisonService from '../../server/services/prisonService'
import { allPrisons, prisonsKeyedByPrisonId } from '../../server/data/localMockData/prisonRegisterMockData'

// eslint-disable-next-line import/prefer-default-export
export function prisonServiceMock(): jest.MockedObject<PrisonService> {
  return {
    getAllPrisonNamesById: jest.fn(() =>
      Promise.resolve(Object.fromEntries(allPrisons.map(prison => [prison.prisonId, prison.prisonName]))),
    ),

    getPrisonByPrisonId: jest.fn(prisonId =>
      Promise.resolve({
        prisonId,
        prisonName: prisonId in prisonsKeyedByPrisonId ? prisonsKeyedByPrisonId[prisonId].prisonName : undefined,
      }),
    ),

    getCompletePrisonDetailsByPrisonId: jest.fn(prisonId =>
      Promise.resolve(prisonId in prisonsKeyedByPrisonId ? prisonsKeyedByPrisonId[prisonId] : undefined),
    ),

    isPrisonPartOfYouthCustodyService: jest.fn(prisonId =>
      Promise.resolve(
        prisonId in prisonsKeyedByPrisonId
          ? prisonsKeyedByPrisonId[prisonId].types.some(type => type.code === 'YCS')
          : false,
      ),
    ),
  } as unknown as jest.MockedObject<PrisonService>
}
