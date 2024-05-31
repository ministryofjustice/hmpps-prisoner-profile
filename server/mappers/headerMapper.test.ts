import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { mapHeaderData, mapHeaderNoBannerData, mapProfileBannerTopLinks } from './headerMappers'
import { prisonUserMock } from '../data/localMockData/user'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'

describe('HeaderMapping', () => {
  describe('Header data', () => {
    describe('If the prisoner is part of the users case loads', () => {
      it('Contains the location', () => {
        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, prisonUserMock)
        expect(topLinks.length).toEqual(4)
        expect(topLinks[0].heading).toEqual('Location')
      })
    })
  })
  describe('Category A prisoner', () => {
    it('Photo type should be photoWithheld for security purposes', async () => {
      const headerData = mapHeaderData(PrisonerMockDataA, inmateDetailMock, alertFlagLabels, prisonUserMock)
      expect(headerData.photoType).toBe('photoWithheld')
    })
    it('Photo type should return as placeholder if the category is not A', async () => {
      const headerData = mapHeaderData(PrisonerMockDataB, inmateDetailMock, alertFlagLabels, prisonUserMock)
      expect(headerData.photoType).toBe('placeholder')
    })
  })

  describe('No banner', () => {
    it('should return prisonerName, prisonerNumber and prisonId', async () => {
      const headerData = mapHeaderNoBannerData(PrisonerMockDataA)
      expect(headerData.prisonerName).toBe('Saunders, John')
      expect(headerData.prisonerNumber).toBe('G6123VU')
      expect(headerData.prisonId).toBe('MDI')
      expect(headerData['backLinkLabel']).not.toBeDefined()
      expect(headerData['profileBannerTopLinks']).not.toBeDefined()
      expect(headerData['alerts']).not.toBeDefined()
      expect(headerData['tabLinks']).not.toBeDefined()
      expect(headerData['photoType']).not.toBeDefined()
      expect(headerData['restrictedPatient']).not.toBeDefined()
      expect(headerData['hideBanner']).not.toBeDefined()
    })
  })
})
