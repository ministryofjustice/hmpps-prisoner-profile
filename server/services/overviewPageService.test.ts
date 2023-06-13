import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import dummyScheduledEvents from '../data/localMockData/eventsForToday'
import nonAssociationDetailsDummyData from '../data/localMockData/nonAssociations'
import OverviewPageService from './overviewPageService'
import { Prisoner } from '../interfaces/prisoner'
import {
  accountBalancesMock,
  adjudicationsSummaryDataMock,
  adjudicationSummaryMock,
  assessmentsMock,
  categorySummaryDataMock,
  csraSummaryDataMock,
  incentiveSummaryDataMock,
  miniSummaryGroupBMock,
  moneySummaryDataMock,
  visitBalancesMock,
  visitsSummaryDataMock,
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
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { formatDate } from '../utils/dateHelpers'
import { convertToTitleCase } from '../utils/utils'
import { IncentivesApiClient } from '../data/interfaces/incentivesApiClient'
import { incentiveReviewsMock } from '../data/localMockData/incentiveReviewsMock'
import { caseNoteCountMock } from '../data/localMockData/caseNoteCountMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { fullStatusMock, mainOffenceMock, offenceOverviewMock } from '../data/localMockData/offenceOverviewMock'
import { CourtCasesMock, CourtCaseWithNextCourtAppearance } from '../data/localMockData/courtCaseMock'
import { Role } from '../data/enums/role'

describe('OverviewPageService', () => {
  let prisonApiClient: PrisonApiClient

  const allocationManagerApiClient: AllocationManagerClient = {
    getPomByOffenderNo: jest.fn(async () => pomMock),
  }

  const keyWorkerApiClient: KeyWorkerClient = {
    getOffendersKeyWorker: jest.fn(async () => keyWorkerMock),
  }

  const incentivesApiClient: IncentivesApiClient = {
    getReviews: jest.fn(async () => incentiveReviewsMock),
  }

  const overviewPageServiceConstruct = jest.fn(() => {
    return new OverviewPageService(prisonApiClient, allocationManagerApiClient, keyWorkerApiClient, incentivesApiClient)
  })

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getAccountBalances = jest.fn(async () => accountBalancesMock)
    prisonApiClient.getAdjudications = jest.fn(async () => adjudicationSummaryMock)
    prisonApiClient.getAlerts = jest.fn(async () => pagedActiveAlertsMock)
    prisonApiClient.getAssessments = jest.fn(async () => assessmentsMock)
    prisonApiClient.getEventsScheduledForToday = jest.fn(async () => dummyScheduledEvents)
    prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)
    prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssociationDetailsDummyData)
    prisonApiClient.getPersonalCareNeeds = jest.fn(async () => personalCareNeedsMock)
    prisonApiClient.getPrisoner = jest.fn(async () => prisonerDetailMock)
    prisonApiClient.getVisitBalances = jest.fn(async () => visitBalancesMock)
    prisonApiClient.getVisitSummary = jest.fn(async () => visitSummaryMock)
    prisonApiClient.getCaseNoteCount = jest.fn(async () => caseNoteCountMock)
    prisonApiClient.getUserCaseLoads = jest.fn(async () => CaseLoadsDummyDataA)
    prisonApiClient.getMainOffence = jest.fn(async () => mainOffenceMock)
    prisonApiClient.getCourtCases = jest.fn(async () => CourtCasesMock)
    prisonApiClient.getFullStatus = jest.fn(async () => fullStatusMock)
    prisonApiClient.getStaffRoles = jest.fn(async () => [])
  })

  describe('Prison name', () => {
    it('Returns the prison name', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const { prisonName } = await overviewPageService.get(PrisonerMockDataA, 1)
      expect(prisonName).toEqual(PrisonerMockDataA.prisonName)
    })
  })

  describe('Non-associations', () => {
    it.each(['ABC123', 'DEF321'])('Gets the non-associations for the prisoner', async (prisonerNumber: string) => {
      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get({ prisonerNumber } as Prisoner, 1)
      expect(prisonApiClient.getNonAssociationDetails).toHaveBeenCalledWith(prisonerNumber)
    })

    it('Converts the non-associations into the correct rows', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ prisonerNumber: 'ABC123' } as Prisoner, 1)
      expect(res.nonAssociations.length).toEqual(2)
      const associationRowOne = res.nonAssociations[0]
      const associationRowTwo = res.nonAssociations[1]
      expect(associationRowOne[0].html).toContain('John Doe')
      expect(associationRowOne[0].html).toContain('/prisoner/ABC123')
      expect(associationRowOne[1].text).toEqual('ABC123')
      expect(associationRowOne[2].text).toEqual('NMI-RECP')
      expect(associationRowOne[3].text).toEqual('Victim')
      expect(associationRowTwo[0].html).toContain('Guy Incognito')
      expect(associationRowTwo[0].html).toContain('/prisoner/DEF321')
      expect(associationRowTwo[1].text).toEqual('DEF321')
      expect(associationRowTwo[2].text).toEqual('NMI-RECP')
      expect(associationRowTwo[3].text).toEqual('Rival Gang')
    })

    it('Only shows non associations that are part of the same prison', async () => {
      const nonAssocations = { ...nonAssociationDetailsDummyData }
      nonAssocations.nonAssociations[0].offenderNonAssociation.agencyDescription = 'Somewhere else'
      prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssocations)
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ prisonerNumber: 'ABC123' } as Prisoner, 1)
      const expectedPrisonNumber = nonAssocations.nonAssociations[1].offenderNonAssociation.offenderNo
      expect(res.nonAssociations.length).toEqual(1)
      expect(res.nonAssociations[0][1].text).toEqual(expectedPrisonNumber)
    })

    it('Returns an empty list if no non-associations are returned', async () => {
      const nonAssocations = { ...nonAssociationDetailsDummyData }
      nonAssocations.nonAssociations = []
      prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssocations)
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ prisonerNumber: 'ABC123' } as Prisoner, 1)
      expect(res.nonAssociations.length).toEqual(0)
    })
  })

  describe('getMiniSummaryGroupA', () => {
    it('should get the account, adjudication and visit summaries for the prisoner', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get({ prisonerNumber, bookingId, prisonId: 'MDI' } as Prisoner, 1)
      expect(prisonApiClient.getAccountBalances).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getAdjudications).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getVisitSummary).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getVisitBalances).toHaveBeenCalledWith(prisonerNumber)
    })

    it('should map api results into page data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get(
        { prisonerNumber, bookingId, prisonId: 'MDI' } as Prisoner,
        1,
        CaseLoadsDummyDataA,
      )

      expect(res.miniSummaryGroupA).toEqual(
        expect.arrayContaining([
          { data: expect.objectContaining(moneySummaryDataMock), classes: 'govuk-grid-row card-body' },
          { data: expect.objectContaining(adjudicationsSummaryDataMock), classes: 'govuk-grid-row card-body' },
          { data: expect.objectContaining(visitsSummaryDataMock), classes: 'govuk-grid-row card-body' },
        ]),
      )
    })

    describe('When the prisoner is not part of the users case loads', () => {
      it('should return empty when the user has no specific roles', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({ prisonerNumber, bookingId, prisonId: '123' } as Prisoner, 1)

        expect(res.miniSummaryGroupA).toEqual([])
      })

      it.each([Role.PomUser, Role.ReceptionUser])(
        'should return the adjudications when the user has a specific role',
        async userRole => {
          const prisonerNumber = 'A1234BC'
          const bookingId = 123456

          const overviewPageService = overviewPageServiceConstruct()
          const res = await overviewPageService.get(
            { prisonerNumber, bookingId, prisonId: '123' } as Prisoner,
            1,
            CaseLoadsDummyDataA,
            [userRole],
          )

          expect(res.miniSummaryGroupA).toEqual(
            expect.arrayContaining([
              { data: expect.objectContaining(adjudicationsSummaryDataMock), classes: 'govuk-grid-row card-body' },
            ]),
          )
        },
      )
    })
  })

  describe('getMiniSummaryGroupB', () => {
    it('should get the category, incentive and csra summaries for the prisoner', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get({ ...PrisonerMockDataA, prisonerNumber, bookingId, prisonId: 'MDI' } as Prisoner, 1)
      expect(prisonApiClient.getAssessments).toHaveBeenCalledWith(bookingId)
    })

    it('should map api results into page data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get(
        {
          ...PrisonerMockDataA,
          prisonerNumber,
          bookingId,
          prisonId: 'MDI',
        } as Prisoner,
        1,
        CaseLoadsDummyDataA,
      )

      expect(res.miniSummaryGroupB).toEqual(
        expect.arrayContaining([
          { data: expect.objectContaining(categorySummaryDataMock), classes: 'govuk-grid-row card-body' },
          { data: expect.objectContaining(incentiveSummaryDataMock), classes: 'govuk-grid-row card-body' },
          { data: expect.objectContaining(csraSummaryDataMock), classes: 'govuk-grid-row card-body' },
        ]),
      )
    })
    describe('When the prisoner is not part of the users case loads', () => {
      it('should not return the incentives data', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get(
          {
            ...PrisonerMockDataA,
            prisonerNumber,
            bookingId,
            prisonId: '123',
          } as Prisoner,
          1,
        )

        expect(res.miniSummaryGroupB).toEqual([
          {
            classes: miniSummaryGroupBMock[0].classes,
            data: { ...miniSummaryGroupBMock[0].data, linkHref: undefined, linkLabel: undefined },
          },
          {
            classes: miniSummaryGroupBMock[2].classes,
            data: { ...miniSummaryGroupBMock[2].data, linkHref: undefined, linkLabel: undefined },
          },
        ])
      })

      it('should not return have the links on the category card', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get(
          {
            ...PrisonerMockDataA,
            prisonerNumber,
            bookingId,
            prisonId: '123',
          } as Prisoner,
          1,
        )

        expect(res.miniSummaryGroupB[0].data.linkLabel).toBeUndefined()
        expect(res.miniSummaryGroupB[0].data.linkHref).toBeUndefined()
      })

      it('should not return have the links on the CSRA card', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get(
          {
            ...PrisonerMockDataA,
            prisonerNumber,
            bookingId,
            prisonId: '123',
          } as Prisoner,
          1,
        )

        expect(res.miniSummaryGroupB[1].data.linkLabel).toBeUndefined()
        expect(res.miniSummaryGroupB[1].data.linkHref).toBeUndefined()
      })
    })
  })

  describe('getPersonalDetails', () => {
    it('should get the personal details for a prisoner', async () => {
      const prisonerNumber = '123123'
      const bookingId = 567567

      const overviewPageService = overviewPageServiceConstruct()
      const {
        personalDetails: { personalDetailsMain, personalDetailsSide },
      } = await overviewPageService.get({ ...PrisonerMockDataB, prisonerNumber, bookingId }, 1)

      expect(personalDetailsMain[0].value.text).toEqual(convertToTitleCase(PrisonerMockDataB.firstName))
      expect(personalDetailsMain[1].value.text).toEqual(formatDate(PrisonerMockDataB.dateOfBirth, 'short'))
      expect(personalDetailsMain[2].value.text).toEqual(inmateDetailMock.age.toString())
      expect(personalDetailsMain[3].value.text).toEqual(PrisonerMockDataB.nationality)
      expect(personalDetailsMain[4].value.text).toEqual(inmateDetailMock.language)

      expect(personalDetailsSide[0].value.text).toEqual(PrisonerMockDataB.croNumber)
      expect(personalDetailsSide[1].value.text).toEqual(PrisonerMockDataB.pncNumber)
    })
  })

  describe('getStaffContactDetails', () => {
    it('should get the staff contact details for a prisoner', async () => {
      const prisonerNumber = '123123'
      const bookingId = 567567

      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({ ...PrisonerMockDataB, prisonerNumber, bookingId } as Prisoner, 1)
      expect(res.staffContacts).toEqual(expect.objectContaining(StaffContactsMock))
    })
  })

  describe('Schedule', () => {
    it('Gets events for today from the prison api', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get(PrisonerMockDataA, 1)
      expect(prisonApiClient.getEventsScheduledForToday).toBeCalledWith(PrisonerMockDataA.bookingId)
    })

    it('Groups the events', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const { schedule } = await overviewPageService.get(PrisonerMockDataA, 1)
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
      const { schedule } = await overviewPageService.get(PrisonerMockDataA, 1)
      const { morning } = schedule
      expect(morning[0].name).toEqual('The event description')
    })

    it('Creates the overview page schedule from the events', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const { schedule } = await overviewPageService.get(PrisonerMockDataA, 1)
      const { morning, afternoon, evening } = schedule

      expect(morning[0].name).toEqual('Joinery AM')
      expect(morning[0].startTime).toEqual('08:30')

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
      await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner, 1)
      expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(bookingId)
      expect(prisonApiClient.getPersonalCareNeeds).toHaveBeenCalledWith(bookingId, [ProblemType.MaternityStatus])
    })

    describe('should map api results into page data', () => {
      it('should have "in" location if in prison', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get(
          {
            prisonerNumber,
            bookingId,
            inOutStatus: 'IN',
            prisonName: 'Moorland (HMP & YOI)',
          } as Prisoner,
          1,
        )

        expect(res.statuses.some(status => status.label === 'In Moorland (HMP & YOI)')).toBeTruthy()
      })

      it('should have "out" location if temp out of prison', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get(
          {
            prisonerNumber,
            bookingId,
            inOutStatus: 'OUT',
            status: 'ACTIVE OUT',
            prisonName: 'Moorland (HMP & YOI)',
          } as Prisoner,
          1,
        )

        expect(res.statuses.some(status => status.label === 'Out from Moorland (HMP & YOI)')).toBeTruthy()
      })

      it('should have "out" location if released from prison', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get(
          {
            prisonerNumber,
            bookingId,
            inOutStatus: 'OUT',
            status: 'INACTIVE OUT',
            locationDescription: 'Outside - released from Moorland (HMP & YOI)',
          } as Prisoner,
          1,
        )

        expect(
          res.statuses.some(status => status.label === 'Outside - released from Moorland (HMP & YOI)'),
        ).toBeTruthy()
      })

      it('should have "Being transferred" location if TRN', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get(
          {
            prisonerNumber,
            bookingId,
            inOutStatus: 'TRN',
          } as Prisoner,
          1,
        )

        expect(res.statuses.some(status => status.label === 'Being transferred')).toBeTruthy()
      })

      it('should have pregnant status if care need is one of the pregnant types', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456
        prisonApiClient.getPersonalCareNeeds = jest.fn(async () => ({
          offenderNo: prisonerNumber,
          personalCareNeeds: [pregnantCareNeedMock],
        }))

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner, 1)

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
        const res = await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner, 1)

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
          const res = await overviewPageService.get({ prisonerNumber, bookingId } as Prisoner, 1)

          expect(res.statuses.some(status => status.label === 'Suitable Listener')).toEqual(displaySuitable)
          expect(res.statuses.some(status => status.label === 'Recognised Listener')).toEqual(displayRecognised)
        },
      )
    })
  })
  describe('getOffenceOverview', () => {
    it('should get the offence overview data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get(
        {
          prisonerNumber,
          bookingId,
          inOutStatus: 'OUT',
          locationDescription: 'Moorland (HMP & YOI)',
        } as Prisoner,
        1,
      )
      expect(res.offencesOverview).toEqual(offenceOverviewMock)
    })

    it('should get the next court appearance from all court cases for the overview page', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456
      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get(
        {
          prisonerNumber,
          bookingId,
          inOutStatus: 'OUT',
          locationDescription: 'Moorland (HMP & YOI)',
        } as Prisoner,
        1,
      )

      const nextCourtAppearance = await overviewPageService.getNextCourtAppearanceForOverview(
        CourtCaseWithNextCourtAppearance,
      )
      expect(nextCourtAppearance).toEqual(CourtCaseWithNextCourtAppearance[1].courtHearings[2])
    })
  })
  describe('Staff roles', () => {
    it('Returns the staff role codes from the prison API', async () => {
      prisonApiClient.getStaffRoles = jest.fn(async () => [{ role: 'A' }, { role: 'B' }])
      const { staffRoles } = await overviewPageServiceConstruct().get(PrisonerMockDataA, 1)
      expect(prisonApiClient.getStaffRoles).toHaveBeenCalledWith(1, PrisonerMockDataA.prisonId)
      expect(staffRoles).toEqual(['A', 'B'])
    })
  })

  describe('Main offence', () => {
    it('should return the main offence description', async () => {
      const overviewPageService = await overviewPageServiceConstruct()
      const desc = await overviewPageService.getMainOffenceDescription(mainOffenceMock)
      expect(desc).toEqual(mainOffenceMock[0].offenceDescription)
    })
  })
})
