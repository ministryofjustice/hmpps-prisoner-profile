import { addDays, startOfYear } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PersonalCareNeed } from '../data/interfaces/prisonApi/PersonalCareNeeds'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import ReferenceCode, { ReferenceCodeDomain } from '../data/interfaces/prisonApi/ReferenceCode'
import { mockReferenceDomains } from '../data/localMockData/referenceDomains'
import { mockReasonableAdjustments } from '../data/localMockData/reasonableAdjustments'
import CareNeedsService from './careNeedsService'
import { personalCareNeedsMock } from '../data/localMockData/personalCareNeedsMock'

describe('beliefService', () => {
  let prisonApiClient: PrisonApiClient
  let careNeedsService: CareNeedsService

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getPersonalCareNeeds = jest.fn(async () => personalCareNeedsMock)
    prisonApiClient.getReasonableAdjustments = jest.fn(async () => mockReasonableAdjustments)
    prisonApiClient.getReferenceCodesByDomain = jest.fn(async (domain: ReferenceCodeDomain) =>
      mockReferenceDomains(domain),
    )
    careNeedsService = new CareNeedsService(() => prisonApiClient)
  })

  const setPersonalCareNeedsMock = (careNeeds: PersonalCareNeed[]) => {
    prisonApiClient.getPersonalCareNeeds = jest.fn(async () => ({
      offenderNo: 'AB1234',
      personalCareNeeds: careNeeds,
    }))
  }
  const setCodeReferencesMock = (referenceCodes: ReferenceCode[]) => {
    prisonApiClient.getReferenceCodesByDomain = jest.fn(async () => referenceCodes)
  }

  describe('getCareNeedsAndAdjustments', () => {
    it('Handles empty personal care needs', async () => {
      setPersonalCareNeedsMock([])

      const careNeeds = await careNeedsService.getCareNeedsAndAdjustments('token', PrisonerMockDataA.bookingId)
      expect(careNeeds.length).toEqual(0)
    })

    it('Doesnt map care needs without matching health codes', async () => {
      setPersonalCareNeedsMock([
        {
          personalCareNeedId: 1,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'A',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferencesMock([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const careNeeds = await careNeedsService.getCareNeedsAndAdjustments('token', PrisonerMockDataA.bookingId)
      expect(careNeeds.length).toEqual(0)
    })

    it('Doesnt map care needs with problem code NR', async () => {
      setPersonalCareNeedsMock([
        {
          personalCareNeedId: 1,
          problemCode: 'NR',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferencesMock([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const careNeeds = await careNeedsService.getCareNeedsAndAdjustments('token', PrisonerMockDataA.bookingId)
      expect(careNeeds.length).toEqual(0)
    })

    it('Doesnt map care needs with problem type BSCAN', async () => {
      setPersonalCareNeedsMock([
        {
          personalCareNeedId: 1,
          problemCode: 'BSC5.5',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'BSCAN',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferencesMock([
        {
          description: 'Code reference description',
          code: 'BSCAN',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const careNeeds = await careNeedsService.getCareNeedsAndAdjustments('token', PrisonerMockDataA.bookingId)
      expect(careNeeds.length).toEqual(0)
    })

    it('Maps the personal care needs', async () => {
      setPersonalCareNeedsMock([
        {
          personalCareNeedId: 1,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferencesMock([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const careNeeds = await careNeedsService.getCareNeedsAndAdjustments('token', PrisonerMockDataA.bookingId)
      expect(careNeeds.length).toEqual(1)
      expect(careNeeds[0].description).toEqual('problem description')
      expect(careNeeds[0].startDate).toEqual('start date')
      expect(careNeeds[0].type).toEqual('Code reference description')
      expect(careNeeds[0].comment).toEqual('Comment text')
      expect(careNeeds[0].isOngoing).toEqual(true)
    })

    it('Gets the reasonable adjustments for the domain types', async () => {
      setCodeReferencesMock([
        {
          domain: 'HEALTH_TREAT',
          code: 'AC',
          description: 'Accessible Cell',
          activeFlag: 'Y',
        },
        {
          domain: 'HEALTH_TREAT',
          code: 'AMP TEL',
          description: 'Amplified telephone',
          activeFlag: 'Y',
        },
      ])

      await careNeedsService.getCareNeedsAndAdjustments('token', PrisonerMockDataA.bookingId)
      expect(prisonApiClient.getReasonableAdjustments).toHaveBeenCalledWith(PrisonerMockDataA.bookingId, [
        'AC',
        'AMP TEL',
      ])
    })

    it('Maps the reasonable adjustments to the matching care needs', async () => {
      setPersonalCareNeedsMock([
        {
          personalCareNeedId: 1,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
        {
          personalCareNeedId: 2,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferencesMock([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      prisonApiClient.getReasonableAdjustments = jest.fn(async () => ({
        reasonableAdjustments: [
          {
            personalCareNeedId: 1,
            treatmentCode: 'BEH/BODY LAN',
            commentText: 'psych care type adjustment comment goes here',
            startDate: '1999-06-09',
            agencyId: 'MDI',
            agencyDescription: 'Moorland (HMP & YOI)',
            treatmentDescription: 'Behavioural responses/Body language',
          },
        ],
      }))

      const careNeeds = await careNeedsService.getCareNeedsAndAdjustments('token', PrisonerMockDataA.bookingId)

      expect(careNeeds[0].reasonableAdjustments.length).toEqual(1)
      expect(careNeeds[1].reasonableAdjustments.length).toEqual(0)
      const { reasonableAdjustments } = careNeeds[0]
      expect(reasonableAdjustments[0].description).toEqual('Behavioural responses/Body language')
      expect(reasonableAdjustments[0].comment).toEqual('psych care type adjustment comment goes here')
      expect(reasonableAdjustments[0].startDate).toEqual('1999-06-09')
      expect(reasonableAdjustments[0].agency).toEqual('Moorland (HMP & YOI)')
    })
  })

  describe('getXrayBodyScans', () => {
    it('Gets only care needs with problem type BSCAN', async () => {
      setPersonalCareNeedsMock([
        {
          personalCareNeedId: 1,
          problemCode: 'BSC5.5',
          problemStatus: 'ON',
          commentText: 'Xray scan',
          problemType: 'BSCAN',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
        {
          personalCareNeedId: 1,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferencesMock([
        {
          description: 'Code reference description',
          code: 'BSCAN',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const careNeeds = await careNeedsService.getXrayBodyScans('token', PrisonerMockDataA.bookingId)
      expect(careNeeds.length).toEqual(1)
      expect(careNeeds[0].comment).toEqual('Xray scan')
    })
  })

  describe('getXrayBodyScanSummary', () => {
    const xrayNeed = (daysAfterStartOfYear: number): PersonalCareNeed => ({
      personalCareNeedId: 1,
      commentText: '',
      problemCode: 'BSC5.5',
      problemDescription: 'Body scan',
      problemStatus: 'ON',
      problemType: 'BSCAN',
      startDate: addDays(startOfYear(new Date()), daysAfterStartOfYear).toISOString(),
    })

    beforeEach(() => {
      setCodeReferencesMock([
        {
          description: 'X-ray body scan',
          code: 'BSCAN',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])
    })

    describe('Given no x-ray care needs', () => {
      it('Returns no xray security information', async () => {
        setPersonalCareNeedsMock([])
        const xrays = await careNeedsService.getXrayBodyScanSummary('token', PrisonerMockDataA.bookingId)
        expect(xrays.total).toEqual(0)
        expect(xrays.since).toBeUndefined()
      })
    })

    describe('Given x-rays for this year', () => {
      it('Returns the correct number of x-rays and the start date', async () => {
        setPersonalCareNeedsMock([xrayNeed(0), xrayNeed(10), xrayNeed(20), xrayNeed(40)])
        const xrays = await careNeedsService.getXrayBodyScanSummary('token', PrisonerMockDataA.bookingId)
        expect(xrays.total).toEqual(4)
        expect(xrays.since).toBe(startOfYear(new Date()).toISOString())
      })
    })

    describe('Given x-rays over multiple years', () => {
      it('Returns the correct number of x-rays for this year and the start date', async () => {
        setPersonalCareNeedsMock([
          xrayNeed(-10),
          xrayNeed(-20),
          xrayNeed(-40),
          xrayNeed(0),
          xrayNeed(10),
          xrayNeed(20),
          xrayNeed(40),
        ])
        const xrays = await careNeedsService.getXrayBodyScanSummary('token', PrisonerMockDataA.bookingId)
        expect(xrays.total).toEqual(4)
        expect(xrays.since).toBe(startOfYear(new Date()).toISOString())
      })
    })
  })
})
