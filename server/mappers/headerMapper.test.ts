import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { mapHeaderData } from './headerMappers'

describe('HeaderMapping', () => {
  describe('Category A prisoner', () => {
    it('Photo type should be photoWithheld for security purposes', async () => {
      const headerData = mapHeaderData(PrisonerMockDataA)
      expect(headerData.photoType).toBe('photoWithheld')
    })
    it('Photo type should return as placeholder if the category is not A', async () => {
      const headerData = mapHeaderData(PrisonerMockDataB)
      expect(headerData.photoType).toBe('placeholder')
    })
  })
})
