import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { mapHeaderData, mapHeaderNoBannerData, mapProfileBannerTopLinks } from './headerMappers'
import { prisonUserMock } from '../data/localMockData/user'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'

describe('HeaderMapping', () => {
  describe('Header data', () => {
    describe('If the prisoner is part of the users case loads', () => {
      it('Contains the location', () => {
        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, prisonUserMock)
        expect(topLinks.length).toEqual(4)
        expect(topLinks[0].heading).toEqual('Location')
        expect(topLinks[0].info).toEqual('1-1-035')
      })
    })
    describe('If the prisoner is part of the users case loads but outside', () => {
      it('Contains the location', () => {
        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataB, inmateDetailMock, prisonUserMock)
        expect(topLinks.length).toEqual(4)
        expect(topLinks[0].heading).toEqual('Location')
        expect(topLinks[0].info).toEqual('1-1-015 (Outside)')
      })
    })
  })
  describe('Category A prisoner', () => {
    it('Photo type should be photoWithheld for security purposes', async () => {
      const headerData = mapHeaderData(
        PrisonerMockDataA,
        inmateDetailMock,
        {
          alertFlags: [],
          apiUnavailable: false,
        },
        prisonUserMock,
      )
      expect(headerData.photoType).toBe('photoWithheld')
    })
    it('Photo type should return as placeholder if the category is not A', async () => {
      const headerData = mapHeaderData(
        PrisonerMockDataB,
        inmateDetailMock,
        {
          alertFlags: [],
          apiUnavailable: false,
        },
        prisonUserMock,
      )
      expect(headerData.photoType).toBe('placeholder')
    })
  })

  describe('No banner', () => {
    it('should return prisonerName, prisonerNumber and prisonId', async () => {
      const headerData = mapHeaderNoBannerData(PrisonerMockDataA)
      expect(headerData.prisonerName).toBe('Saunders, John')
      expect(headerData.prisonerNumber).toBe('G6123VU')
      expect(headerData.prisonId).toBe('MDI')
      expect(headerData['backLinkLabel' as keyof typeof headerData]).not.toBeDefined()
      expect(headerData['profileBannerTopLinks' as keyof typeof headerData]).not.toBeDefined()
      expect(headerData['alerts' as keyof typeof headerData]).not.toBeDefined()
      expect(headerData['tabLinks' as keyof typeof headerData]).not.toBeDefined()
      expect(headerData['photoType' as keyof typeof headerData]).not.toBeDefined()
      expect(headerData['restrictedPatient' as keyof typeof headerData]).not.toBeDefined()
      expect(headerData['hideBanner' as keyof typeof headerData]).not.toBeDefined()
    })
  })
})
