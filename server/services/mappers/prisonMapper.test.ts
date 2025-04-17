import toPrison from './prisonMapper'
import { Prison } from '../interfaces/prisonService/PrisonServicePrisons'
import { prisonsKeyedByPrisonId } from '../../data/localMockData/prisonRegisterMockData'

describe('prisonMapper', () => {
  it('should map a PrisonResponse to a Prison', () => {
    // Given
    const prisonResponse = prisonsKeyedByPrisonId['MDI']

    const expectedPrison: Prison = {
      prisonId: 'MDI',
      prisonName: 'Moorland (HMP & YOI)',
    }

    // When
    const actual = toPrison(prisonResponse)

    // Then
    expect(actual).toEqual(expectedPrison)
  })
})
