import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { mapHeaderData } from './headerMappers'
import { userMock } from '../data/localMockData/user'

describe('HeaderMapping', () => {
  describe('Category A prisoner', () => {
    it('Photo type should be photoWithheld for security purposes', async () => {
      const headerData = mapHeaderData(PrisonerMockDataA, userMock)
      expect(headerData.photoType).toBe('photoWithheld')
    })
    it('Photo type should return as placeholder if the category is not A', async () => {
      const headerData = mapHeaderData(PrisonerMockDataB, userMock)
      expect(headerData.photoType).toBe('placeholder')
    })
  })
})
