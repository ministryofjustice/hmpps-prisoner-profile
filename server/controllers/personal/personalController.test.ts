import { corePersonPhysicalAttributesMock } from '../../data/localMockData/physicalAttributesMock'
import { PersonalRelationshipsDomesticStatusMock } from '../../data/localMockData/personalRelationshipsApiMock'
import { personalPageServiceMock } from '../../../tests/mocks/personalPageServiceMock'
import type PersonalPageService from '../../services/personalPageService'

describe('PersonalController', () => {
  let personalPageService: PersonalPageService

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getPhysicalAttributes = jest.fn(async () => corePersonPhysicalAttributesMock)
    personalPageService.updateSmokerOrVaper = jest.fn()
    personalPageService.getNumberOfChildren = jest.fn()
    personalPageService.getDomesticStatus = jest.fn(async () => PersonalRelationshipsDomesticStatusMock)
  })

  describe('displayPersonalPage', () => {
    // Skipped to focus on the edit routes for now
    it.skip('Renders the page with information from the service', () => {})
  })
})
