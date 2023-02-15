import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import nonAssociationDetailsDummyData from '../data/localMockData/nonAssociations'
import OverviewPageService from './overviewPageService'
import { Prisoner } from '../interfaces/prisoner'
import {
  accountBalancesMock,
  adjudicationSummaryMock,
  assessmentsMock,
  miniSummaryGroupAMock,
  miniSummaryGroupBMock,
  visitBalancesMock,
  visitSummaryMock,
} from '../data/localMockData/miniSummaryMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

describe('OverviewPageService', () => {
  const prisonApiClient: PrisonApiClient = {
    getNonAssociationDetails: jest.fn(async () => nonAssociationDetailsDummyData),
    getUserCaseLoads: jest.fn(),
    getUserLocations: jest.fn(),
    getVisitBalances: jest.fn(async () => visitBalancesMock),
    getVisitSummary: jest.fn(async () => visitSummaryMock),
    getAdjudications: jest.fn(async () => adjudicationSummaryMock),
    getAccountBalances: jest.fn(async () => accountBalancesMock),
    getAssessments: jest.fn(async () => assessmentsMock),
  }

  describe('Non-associations', () => {
    it.each(['ABC123', 'DEF321'])('Gets the non-associations for the prisoner', async (prisonerNumber: string) => {
      const overviewPageService = new OverviewPageService(prisonApiClient)
      await overviewPageService.get({ prisonerNumber } as Prisoner)
      expect(prisonApiClient.getNonAssociationDetails).toHaveBeenCalledWith(prisonerNumber)
    })

    it('Converts the non-associations into the correct rows', async () => {
      const overviewPageService = new OverviewPageService(prisonApiClient)
      const res = await overviewPageService.get({ prisonerNumber: 'ABC123' } as Prisoner)
      expect(res.nonAssociations.length).toEqual(2)
      const associationRowOne = res.nonAssociations[0]
      const associationRowTwo = res.nonAssociations[1]
      expect(associationRowOne[0].text).toEqual('John Doe')
      expect(associationRowOne[1].text).toEqual('ABC123')
      expect(associationRowOne[2].text).toEqual('NMI-RECP')
      expect(associationRowOne[3].text).toEqual('Victim')
      expect(associationRowTwo[0].text).toEqual('Guy Incognito')
      expect(associationRowTwo[1].text).toEqual('DEF321')
      expect(associationRowTwo[2].text).toEqual('NMI-RECP')
      expect(associationRowTwo[3].text).toEqual('Rival Gang')
    })

    it('Only shows non associations that are part of the same prison', async () => {
      const nonAssocations = { ...nonAssociationDetailsDummyData }
      nonAssocations.nonAssociations[0].offenderNonAssociation.agencyDescription = 'Somewhere else'
      prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssocations)
      const overviewPageService = new OverviewPageService(prisonApiClient)
      const res = await overviewPageService.get({ prisonerNumber: 'ABC123' } as Prisoner)
      const expectedPrisonNumber = nonAssocations.nonAssociations[1].offenderNonAssociation.offenderNo
      expect(res.nonAssociations.length).toEqual(1)
      expect(res.nonAssociations[0][1].text).toEqual(expectedPrisonNumber)
    })

    it('Returns an empty list if no non-associations are returned', async () => {
      const nonAssocations = { ...nonAssociationDetailsDummyData }
      nonAssocations.nonAssociations = []
      prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssocations)
      const overviewPageService = new OverviewPageService(prisonApiClient)
      const res = await overviewPageService.get({ prisonerNumber: 'ABC123' } as Prisoner)
      expect(res.nonAssociations.length).toEqual(0)
    })
  })

  describe('getMiniSummaryGroupA', () => {
    it('should get the account, adjudication and visit summaries for the prisoner', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = new OverviewPageService(prisonApiClient)
      await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner)
      expect(prisonApiClient.getAccountBalances).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getAdjudications).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getVisitSummary).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getVisitBalances).toHaveBeenCalledWith(prisonerNumber)
    })

    it('should map api results into page data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = new OverviewPageService(prisonApiClient)
      const res = await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner)

      expect(res.miniSummaryGroupA).toEqual(miniSummaryGroupAMock)
    })
  })

  describe('getMiniSummaryGroupB', () => {
    it('should get the category, incentive and csra summaries for the prisoner', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = new OverviewPageService(prisonApiClient)
      await overviewPageService.get({ ...PrisonerMockDataA, prisonerNumber, bookingId } as Prisoner)
      expect(prisonApiClient.getAssessments).toHaveBeenCalledWith(bookingId)
    })

    it('should map api results into page data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = new OverviewPageService(prisonApiClient)
      const res = await overviewPageService.get({ ...PrisonerMockDataA, prisonerNumber, bookingId } as Prisoner)

      expect(res.miniSummaryGroupB).toEqual(miniSummaryGroupBMock)
    })
  })
})
