import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { mapHeaderData, mapProfileBannerTopLinks } from './headerMappers'
import { userMock } from '../data/localMockData/user'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'

describe('HeaderMapping', () => {
  describe('Header data', () => {
    describe('If the prisoner is part of the users case loads', () => {
      it('Contains the location', () => {
        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, userMock)
        expect(topLinks.length).toEqual(4)
        expect(topLinks[0].heading).toEqual('Location')
      })
    })
  })
  describe('Category A prisoner', () => {
    it('Photo type should be photoWithheld for security purposes', async () => {
      const headerData = mapHeaderData(PrisonerMockDataA, inmateDetailMock, userMock)
      expect(headerData.photoType).toBe('photoWithheld')
    })
    it('Photo type should return as placeholder if the category is not A', async () => {
      const headerData = mapHeaderData(PrisonerMockDataB, inmateDetailMock, userMock)
      expect(headerData.photoType).toBe('placeholder')
    })
  })
})
