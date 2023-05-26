import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { mapHeaderData, mapProfileBannerTopLinks } from './headerMappers'

describe('HeaderMapping', () => {
  describe('Header data', () => {
    describe('If the prisoner is part of the users case loads', () => {
      it('Contains the location', () => {
        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, CaseLoadsDummyDataA)
        expect(topLinks.length).toEqual(4)
        expect(topLinks[0].heading).toEqual('Location')
      })
    })
  })
  describe('Category A prisoner', () => {
    it('Photo type should be photoWithheld for security purposes', async () => {
      const headerData = mapHeaderData(PrisonerMockDataA, CaseLoadsDummyDataA)
      expect(headerData.photoType).toBe('photoWithheld')
    })
    it('Photo type should return as placeholder if the category is not A', async () => {
      const headerData = mapHeaderData(PrisonerMockDataB, CaseLoadsDummyDataA)
      expect(headerData.photoType).toBe('placeholder')
    })
  })
})
