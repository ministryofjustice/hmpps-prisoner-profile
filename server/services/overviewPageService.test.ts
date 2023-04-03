import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import dummyScheduledEvents from '../data/localMockData/eventsForToday'
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
import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import {
  inmateDetailMock,
  recognisedListenerBlank,
  recognisedListenerNo,
  recognisedListenerYes,
  suitableListenerBlank,
  suitableListenerNo,
  suitableListenerYes,
} from '../data/localMockData/inmateDetailMock'
import {
  notPregnantCareNeedMock,
  personalCareNeedsMock,
  pregnantCareNeedMock,
} from '../data/localMockData/personalCareNeedsMock'
import { ProblemType } from '../data/enums/problemType'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'
import { ProfileInformation } from '../interfaces/prisonApi/profileInformation'

import AllocationManagerClient from '../data/interfaces/allocationManagerClient'
import KeyWorkerClient from '../data/interfaces/keyWorkerClient'
import { pomMock } from '../data/localMockData/pom'
import { keyWorkerMock } from '../data/localMockData/keyWorker'
import { StaffContactsMock } from '../data/localMockData/staffContacts'
import { pagedActiveAlertsMock } from '../data/localMockData/pagedAlertsMock'

describe('OverviewPageService', () => {
  const prisonApiClient: PrisonApiClient = {
    getNonAssociationDetails: jest.fn(),
    getEventsScheduledForToday: jest.fn(),
    getUserCaseLoads: jest.fn(),
    getUserLocations: jest.fn(),
    getVisitBalances: jest.fn(async () => visitBalancesMock),
    getVisitSummary: jest.fn(async () => visitSummaryMock),
    getAdjudications: jest.fn(async () => adjudicationSummaryMock),
    getAccountBalances: jest.fn(async () => accountBalancesMock),
    getAssessments: jest.fn(async () => assessmentsMock),
    getBookingContacts: jest.fn(),
    getCaseNoteSummaryByTypes: jest.fn(),
    getPrisoner: jest.fn(async () => prisonerDetailMock),
    getInmateDetail: jest.fn(async () => inmateDetailMock),
    getPersonalCareNeeds: jest.fn(async () => personalCareNeedsMock),
    getOffenderActivitiesHistory: jest.fn(),
    getOffenderAttendanceHistory: jest.fn(),
    getSecondaryLanguages: jest.fn(),
    getAlerts: jest.fn(async () => pagedActiveAlertsMock),
    getProperty: jest.fn(),
    getAddresses: jest.fn(),
    getAddressesForPerson: jest.fn(),
    getOffenderContacts: jest.fn(),
  }

  const allocationManagerApiClient: AllocationManagerClient = {
    getPomByOffenderNo: jest.fn(async () => pomMock),
  }

  const keyWorkerApiClient: KeyWorkerClient = {
    getOffendersKeyWorker: jest.fn(async () => keyWorkerMock),
  }

  const overviewPageServiceConstruct = jest.fn(() => {
    return new OverviewPageService(prisonApiClient, allocationManagerApiClient, keyWorkerApiClient)
  })

  beforeEach(() => {
    prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssociationDetailsDummyData)
    prisonApiClient.getEventsScheduledForToday = jest.fn(async () => dummyScheduledEvents)
  })

  describe('Non-associations', () => {
    it.each(['ABC123', 'DEF321'])('Gets the non-associations for the prisoner', async (prisonerNumber: string) => {
      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get({ prisonerNumber } as Prisoner)
      expect(prisonApiClient.getNonAssociationDetails).toHaveBeenCalledWith(prisonerNumber)
    })

    it('Converts the non-associations into the correct rows', async () => {
      const overviewPageService = overviewPageServiceConstruct()
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
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ prisonerNumber: 'ABC123' } as Prisoner)
      const expectedPrisonNumber = nonAssocations.nonAssociations[1].offenderNonAssociation.offenderNo
      expect(res.nonAssociations.length).toEqual(1)
      expect(res.nonAssociations[0][1].text).toEqual(expectedPrisonNumber)
    })

    it('Returns an empty list if no non-associations are returned', async () => {
      const nonAssocations = { ...nonAssociationDetailsDummyData }
      nonAssocations.nonAssociations = []
      prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssocations)
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ prisonerNumber: 'ABC123' } as Prisoner)
      expect(res.nonAssociations.length).toEqual(0)
    })
  })

  describe('getMiniSummaryGroupA', () => {
    it('should get the account, adjudication and visit summaries for the prisoner', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner)
      expect(prisonApiClient.getAccountBalances).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getAdjudications).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getVisitSummary).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getVisitBalances).toHaveBeenCalledWith(prisonerNumber)
    })

    it('should map api results into page data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner)

      expect(res.miniSummaryGroupA).toEqual(miniSummaryGroupAMock)
    })
  })

  describe('getMiniSummaryGroupB', () => {
    it('should get the category, incentive and csra summaries for the prisoner', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get({ ...PrisonerMockDataA, prisonerNumber, bookingId } as Prisoner)
      expect(prisonApiClient.getAssessments).toHaveBeenCalledWith(bookingId)
    })

    it('should map api results into page data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ ...PrisonerMockDataA, prisonerNumber, bookingId } as Prisoner)

      expect(res.miniSummaryGroupB).toEqual(miniSummaryGroupBMock)
    })
  })

  describe('getPersonalDetails', () => {
    it('should get the personal details for a prisoner', async () => {
      const prisonerNumber = '123123'
      const bookingId = 567567

      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ ...PrisonerMockDataB, prisonerNumber, bookingId } as Prisoner)
      expect(res.personalDetails).toEqual(overviewPageService.getPersonalDetails(PrisonerMockDataB))
    })
  })

  describe('getStaffContactDetails', () => {
    it('should get the staff contact details for a prisoner', async () => {
      const prisonerNumber = '123123'
      const bookingId = 567567

      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ ...PrisonerMockDataB, prisonerNumber, bookingId } as Prisoner)
      expect(res.staffContacts).toEqual(StaffContactsMock)
    })
  })

  describe('Schedule', () => {
    it('Gets events for today from the prison api', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get(PrisonerMockDataA)
      expect(prisonApiClient.getEventsScheduledForToday).toBeCalledWith(PrisonerMockDataA.bookingId)
    })

    it('Groups the events', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const { schedule } = await overviewPageService.get(PrisonerMockDataA)
      const { morning, afternoon, evening } = schedule
      expect(morning.length).toEqual(1)
      expect(afternoon.length).toEqual(1)
      expect(evening.length).toEqual(2)
    })

    it('Uses the event source description for PA sub types', async () => {
      const events = [{ ...dummyScheduledEvents[0] }]
      events[0].eventSubType = 'PA'
      events[0].eventSourceDesc = 'The event description'
      prisonApiClient.getEventsScheduledForToday = jest.fn(async () => events)
      const overviewPageService = overviewPageServiceConstruct()
      const { schedule } = await overviewPageService.get(PrisonerMockDataA)
      const { morning } = schedule
      expect(morning[0].name).toEqual('The event description')
    })

    it('Creates the overview page schedule from the events', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const { schedule } = await overviewPageService.get(PrisonerMockDataA)
      const { morning, afternoon, evening } = schedule

      expect(morning[0].name).toEqual('Joinery AM')
      expect(morning[0].startTime).toEqual('08:30')
      expect(morning[0].endTime).toEqual('11:45')

      expect(afternoon[0].name).toEqual('Joinery PM')
      expect(afternoon[0].startTime).toEqual('13:15')
      expect(afternoon[0].endTime).toEqual('16:15')

      expect(evening[0].name).toEqual('Gym - Football')
      expect(evening[0].startTime).toEqual('18:00')
      expect(evening[0].endTime).toEqual('19:00')
      expect(evening[1].name).toEqual('VLB - Test')
      expect(evening[1].startTime).toEqual('18:00')
      expect(evening[1].endTime).toEqual('19:00')
    })
  })

  describe('getStatuses', () => {
    it('should get statuses for Current Location, Pregnant, Recognised Listener and Suitable Listener', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner)
      expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getPersonalCareNeeds).toHaveBeenCalledWith(bookingId, [ProblemType.MaternityStatus])
    })

    describe('should map api results into page data', () => {
      it('should have "in" location if in prison', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          prisonerNumber,
          bookingId,
          inOutStatus: 'IN',
          locationDescription: 'Moorland (HMP & YOI)',
        } as Prisoner)

        expect(res.statuses.some(status => status.label === 'In Moorland (HMP & YOI)')).toBeTruthy()
        expect(res.statuses.some(status => status.label === 'Out from Moorland (HMP & YOI)')).toBeFalsy()
      })

      it('should have "out" location if out of prison', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          prisonerNumber,
          bookingId,
          inOutStatus: 'OUT',
          locationDescription: 'Moorland (HMP & YOI)',
        } as Prisoner)

        expect(res.statuses.some(status => status.label === 'Out from Moorland (HMP & YOI)')).toBeTruthy()
        expect(res.statuses.some(status => status.label === 'In Moorland (HMP & YOI)')).toBeFalsy()
      })

      it('should have pregnant status if care need is one of the pregnant types', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456
        prisonApiClient.getPersonalCareNeeds = jest.fn(async () => ({
          offenderNo: prisonerNumber,
          personalCareNeeds: [pregnantCareNeedMock],
        }))

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner)

        expect(res.statuses.some(status => status.label === 'Pregnant' && status.date === '21/06/2010')).toBeTruthy()
      })

      it('should not have pregnant status if care need is one of the not pregnant types', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456
        prisonApiClient.getPersonalCareNeeds = jest.fn(async () => ({
          offenderNo: prisonerNumber,
          personalCareNeeds: [notPregnantCareNeedMock],
        }))

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner)

        expect(res.statuses.some(status => status.label === 'Pregnant')).toBeFalsy()
      })

      it.each([
        ['Suitable Blank/Recognised Blank', suitableListenerBlank, recognisedListenerBlank, false, false],
        ['Suitable No/Recognised Blank', suitableListenerNo, recognisedListenerBlank, false, false],
        ['Suitable No/Recognised No', suitableListenerNo, recognisedListenerNo, false, false],
        ['Suitable Yes/Recognised Blank', suitableListenerYes, recognisedListenerBlank, true, false],
        ['Suitable Yes/Recognised No', suitableListenerYes, recognisedListenerNo, true, true],
        ['Suitable Yes/Recognised Yes', suitableListenerYes, recognisedListenerYes, false, true],
        ['Suitable Blank/Recognised Yes', suitableListenerBlank, recognisedListenerYes, false, true],
        ['Suitable No/Recognised Yes', suitableListenerNo, recognisedListenerYes, false, false],
      ])(
        'given %s should show correct suitable and/or recognised listener statuses',
        async (
          _: string,
          suitableListener: ProfileInformation,
          recognisedListener: ProfileInformation,
          displaySuitable: boolean,
          displayRecognised: boolean,
        ) => {
          const prisonerNumber = 'A1234BC'
          const bookingId = 123456
          prisonApiClient.getInmateDetail = jest.fn(
            async () =>
              ({
                profileInformation: [suitableListener, recognisedListener],
              } as InmateDetail),
          )

          const overviewPageService = overviewPageServiceConstruct()
          const res = await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner)

          expect(res.statuses.some(status => status.label === 'Suitable Listener')).toEqual(displaySuitable)
          expect(res.statuses.some(status => status.label === 'Recognised Listener')).toEqual(displayRecognised)
        },
      )
    })
  })
})
