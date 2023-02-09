import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import nonAssociationDetailsDummyData from '../data/localMockData/nonAssociations'
import OverviewPageService from './overviewPageService'

describe('OverviewPageService', () => {
  const prisonApiClient: PrisonApiClient = {
    getNonAssociationDetails: jest.fn(async () => nonAssociationDetailsDummyData),
    getUserCaseLoads: jest.fn(),
    getUserLocations: jest.fn(),
  }

  describe('Non-associations', () => {
    it.each(['ABC123', 'DEF321'])('Gets the non-associations for the prisoner', async (prisonerNumber: string) => {
      const overviewPageService = new OverviewPageService(prisonApiClient)
      await overviewPageService.get(prisonerNumber)
      expect(prisonApiClient.getNonAssociationDetails).toHaveBeenCalledWith(prisonerNumber)
    })

    it('Converts the non-associations into the correct rows', async () => {
      const overviewPageService = new OverviewPageService(prisonApiClient)
      const res = await overviewPageService.get('ABC123')
      expect(res.nonAssociationRows.length).toEqual(2)
      const associationRowOne = res.nonAssociationRows[0]
      const associationRowTwo = res.nonAssociationRows[1]
      expect(associationRowOne.name).toEqual('John Doe')
      expect(associationRowOne.prisonNumber).toEqual('ABC123')
      expect(associationRowOne.location).toEqual('NMI-RECP')
      expect(associationRowOne.reciprocalReason).toEqual('Victim')
      expect(associationRowTwo.name).toEqual('Guy Incognito')
      expect(associationRowTwo.prisonNumber).toEqual('DEF321')
      expect(associationRowTwo.location).toEqual('NMI-RECP')
      expect(associationRowTwo.reciprocalReason).toEqual('Rival Gang')
    })

    it('Only shows non associations that are part of the same prison', async () => {
      const nonAssocations = { ...nonAssociationDetailsDummyData }
      nonAssocations.nonAssociations[0].offenderNonAssociation.agencyDescription = 'Somewhere else'
      prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssocations)
      const overviewPageService = new OverviewPageService(prisonApiClient)
      const res = await overviewPageService.get('ABC123')
      const expectedPrisonNumber = nonAssocations.nonAssociations[1].offenderNonAssociation.offenderNo
      expect(res.nonAssociationRows.length).toEqual(1)
      expect(res.nonAssociationRows[0].prisonNumber).toEqual(expectedPrisonNumber)
    })
  })
})
