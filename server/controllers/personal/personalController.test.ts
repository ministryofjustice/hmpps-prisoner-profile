import { corePersonPhysicalAttributesMock } from '../../data/localMockData/physicalAttributesMock'
import { PersonalRelationshipsDomesticStatusMock } from '../../data/localMockData/personalRelationshipsApiMock'
import { personalPageServiceMock } from '../../../tests/mocks/personalPageServiceMock'

describe('PersonalController', () => {
  beforeEach(() => {
    const personalPageService = personalPageServiceMock()
    personalPageService.getPhysicalAttributes.mockResolvedValue(corePersonPhysicalAttributesMock)
    personalPageService.getDomesticStatus.mockResolvedValue(PersonalRelationshipsDomesticStatusMock)
  })

  describe('displayPersonalPage', () => {
    // Skipped to focus on the edit routes for now
    it.skip('Renders the page with information from the service', () => {})
  })
})
