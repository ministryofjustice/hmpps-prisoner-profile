import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import dummyScheduledEvents from '../data/localMockData/eventsForToday'
import OverviewPageService from './overviewPageService'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import {
  accountBalancesMock,
  assessmentsMock,
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
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import ProfileInformation from '../data/interfaces/prisonApi/ProfileInformation'

import KeyWorkerClient from '../data/interfaces/keyWorkerApi/keyWorkerClient'
import { pomMock } from '../data/localMockData/pom'
import { keyWorkerMock } from '../data/localMockData/keyWorker'
import { pagedActiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { formatDate } from '../utils/dateHelpers'
import { convertToTitleCase, neurodiversityEnabled } from '../utils/utils'
import { IncentivesApiClient } from '../data/interfaces/incentivesApi/incentivesApiClient'
import { incentiveReviewsMock } from '../data/localMockData/incentiveReviewsMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { fullStatusMock, mainOffenceMock, offenceOverviewMock } from '../data/localMockData/offenceOverviewMock'
import { CourtCasesMock } from '../data/localMockData/courtCaseMock'

import { LearnerNeurodivergenceMock } from '../data/localMockData/learnerNeurodivergenceMock'
import { learnerEmployabilitySkills } from '../data/localMockData/learnerEmployabilitySkills'
import { LearnerProfiles } from '../data/localMockData/learnerProfiles'
import { learnerEducation } from '../data/localMockData/learnerEducation'
import { LearnerLatestAssessmentsMock } from '../data/localMockData/learnerLatestAssessmentsMock'
import aValidLearnerGoals from '../data/localMockData/learnerGoalsMock'
import { NonAssociationsApiClient } from '../data/interfaces/nonAssociationsApi/nonAssociationsApiClient'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import { communityManagerMock } from '../data/localMockData/communityManagerMock'
import { scheduledTransfersMock } from '../data/localMockData/scheduledTransfersMock'
import { prisonerNonAssociationsMock } from '../data/localMockData/prisonerNonAssociationsMock'
import config from '../config'
import { complexityOfNeedHighMock, complexityOfNeedLowMock } from '../data/localMockData/complexityOfNeedMock'
import AllocationManagerClient from '../data/interfaces/allocationManagerApi/allocationManagerClient'
import ComplexityApiClient from '../data/interfaces/complexityApi/complexityApiClient'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import { Result } from '../utils/result/result'
import { mockContactDetail, mockContactDetailYouthEstate } from '../data/localMockData/contactDetail'

jest.mock('../utils/utils', () => {
  const original = jest.requireActual('../utils/utils')
  return { ...original, neurodiversityEnabled: jest.fn() }
})
const mockedNeurodiversityEnabled = neurodiversityEnabled as jest.Mock
config.featureToggles.complexityEnabledPrisons = ['MDI']

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

  const incentivesApiClientReturnsNull: IncentivesApiClient = {
    getReviews: jest.fn(async () => null),
  }

  const incentivesApiClientThrowsError: IncentivesApiClient = {
    getReviews: jest.fn(async () => {
      throw new Error()
    }),
  }

  const curiousApiClient: CuriousApiClient = {
    getLearnerEmployabilitySkills: jest.fn(async () => learnerEmployabilitySkills),
    getLearnerProfile: jest.fn(async () => LearnerProfiles),
    getLearnerEducation: jest.fn(async () => learnerEducation),
    getLearnerLatestAssessments: jest.fn(async () => LearnerLatestAssessmentsMock),
    getLearnerGoals: jest.fn(async () => aValidLearnerGoals()),
    getLearnerNeurodivergence: jest.fn(async () => LearnerNeurodivergenceMock),
  }

  const nonAssociationsApiClient: NonAssociationsApiClient = {
    getPrisonerNonAssociations: jest.fn(async () => prisonerNonAssociationsMock),
  }

  const prisonerProfileDeliusApiClient: PrisonerProfileDeliusApiClient = {
    getCommunityManager: jest.fn(async () => communityManagerMock),
    getProbationDocuments: jest.fn(),
  }

  const complexityApiClient: ComplexityApiClient = {
    getComplexityOfNeed: jest.fn(async () => complexityOfNeedLowMock),
  }

  const complexityApiClientComplex: ComplexityApiClient = {
    getComplexityOfNeed: jest.fn(async () => complexityOfNeedHighMock),
  }

  const overviewPageServiceConstruct = jest.fn(({ useNull = false, useError = false, useComplex = false } = {}) => {
    let incentivesApi: IncentivesApiClient
    if (useNull) {
      incentivesApi = incentivesApiClientReturnsNull
    } else if (useError) {
      incentivesApi = incentivesApiClientThrowsError
    } else {
      incentivesApi = incentivesApiClient
    }

    return new OverviewPageService(
      () => prisonApiClient,
      () => allocationManagerApiClient,
      () => keyWorkerApiClient,
      () => incentivesApi,
      () => curiousApiClient,
      () => nonAssociationsApiClient,
      () => prisonerProfileDeliusApiClient,
      () => (useComplex ? complexityApiClientComplex : complexityApiClient),
    )
  })

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getAccountBalances = jest.fn(async () => accountBalancesMock)
    prisonApiClient.getAlerts = jest.fn(async () => pagedActiveAlertsMock)
    prisonApiClient.getAssessments = jest.fn(async () => assessmentsMock)
    prisonApiClient.getEventsScheduledForToday = jest.fn(async () => dummyScheduledEvents)
    prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)
    prisonApiClient.getPrisoner = jest.fn(async () => prisonerDetailMock)
    prisonApiClient.getVisitBalances = jest.fn(async () => visitBalancesMock)
    prisonApiClient.getVisitSummary = jest.fn(async () => visitSummaryMock)
    prisonApiClient.getUserCaseLoads = jest.fn(async () => CaseLoadsDummyDataA)
    prisonApiClient.getMainOffence = jest.fn(async () => mainOffenceMock)
    prisonApiClient.getCourtCases = jest.fn(async () => CourtCasesMock)
    prisonApiClient.getFullStatus = jest.fn(async () => fullStatusMock)
    prisonApiClient.getStaffRoles = jest.fn(async () => [])
    prisonApiClient.getScheduledTransfers = jest.fn(async () => [])
    prisonApiClient.getBookingContacts = jest.fn(async () => mockContactDetail)

    nonAssociationsApiClient.getPrisonerNonAssociations = jest.fn(async () => prisonerNonAssociationsMock)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Prison name', () => {
    it('Returns the prison name', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const { prisonName } = await overviewPageService.get({
        clientToken: 'token',
        prisonerData: PrisonerMockDataA,
        staffId: 1,
        inmateDetail: inmateDetailMock,
      })
      expect(prisonName).toEqual(PrisonerMockDataA.prisonName)
    })
  })

  describe('getPersonalDetails', () => {
    it('should get the personal details for a prisoner', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-23'))

      const prisonerNumber = '123123'
      const bookingId = 567567

      const overviewPageService = overviewPageServiceConstruct()
      const {
        personalDetails: { personalDetailsMain, personalDetailsSide },
      } = await overviewPageService.get({
        clientToken: 'token',
        prisonerData: { ...PrisonerMockDataB, prisonerNumber, bookingId },
        staffId: 1,
        inmateDetail: inmateDetailMock,
      })

      expect(personalDetailsMain.preferredName).toEqual(convertToTitleCase(PrisonerMockDataB.firstName))
      expect(personalDetailsMain.dateOfBirth).toEqual(formatDate(PrisonerMockDataB.dateOfBirth, 'short'))
      expect(personalDetailsMain.age).toEqual({ months: 1, years: 30 })
      expect(personalDetailsMain.nationality).toEqual(PrisonerMockDataB.nationality)
      expect(personalDetailsMain.spokenLanguage).toEqual(inmateDetailMock.language)

      expect(personalDetailsSide.ethnicGroup).toEqual(
        `${prisonerDetailMock.ethnicity} (${prisonerDetailMock.ethnicityCode})`,
      )
      expect(personalDetailsSide.religionOrBelief).toEqual(PrisonerMockDataB.religion)
      expect(personalDetailsSide.croNumber).toEqual(PrisonerMockDataB.croNumber)
      expect(personalDetailsSide.pncNumber).toEqual(PrisonerMockDataB.pncNumber)

      jest.useRealTimers()
    })
  })

  describe('getStaffContactDetails', () => {
    it('should get the staff contact details for an adult prisoner', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({
        clientToken: 'token',
        prisonerData: PrisonerMockDataA,
        staffId: 1,
        inmateDetail: inmateDetailMock,
      })
      expect(res.staffContacts).toEqual({
        keyWorker: Result.fulfilled({
          name: `${convertToTitleCase(keyWorkerMock.firstName)} ${convertToTitleCase(keyWorkerMock.lastName)}`,
          lastSession: '',
        }).toPromiseSettledResult(),
        prisonOffenderManager: 'Andy Marke',
        coworkingPrisonOffenderManager: 'Andy Hudson',
        communityOffenderManager: 'Terry Scott',
      })
    })

    it('should get the staff contact details for a youth prisoner', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      prisonApiClient.getBookingContacts = jest.fn(async () => mockContactDetailYouthEstate)

      const res = await overviewPageService.get({
        clientToken: 'token',
        prisonerData: { ...PrisonerMockDataA, prisonId: 'WYI' },
        staffId: 1,
        inmateDetail: inmateDetailMock,
      })
      expect(res.staffContacts).toEqual({
        cuspOfficer: 'Mike Tester',
        cuspOfficerBackup: 'Katie Testing',
        youthJusticeWorker: 'Emma Justice',
        resettlementPractitioner: 'Shauna Michaels',
        youthJusticeService: 'Outer York',
        youthJusticeServiceCaseManager: 'Barney Rubble',
      })
    })

    it('should get the staff contact details for a prisoner with complex needs', async () => {
      const overviewPageService = overviewPageServiceConstruct({ useComplex: true })
      const res = await overviewPageService.get({
        clientToken: 'token',
        prisonerData: PrisonerMockDataA,
        staffId: 1,
        inmateDetail: inmateDetailMock,
      })
      expect(res.staffContacts).toEqual({
        keyWorker: Result.fulfilled({
          name: 'None - high complexity of need',
          lastSession: '',
        }).toPromiseSettledResult(),
        prisonOffenderManager: 'Andy Marke',
        coworkingPrisonOffenderManager: 'Andy Hudson',
        communityOffenderManager: 'Terry Scott',
      })
    })

    it('should handle an API error getting the key worker name', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      keyWorkerApiClient.getOffendersKeyWorker = jest.fn().mockRejectedValue(Error('some error!'))

      const res = await overviewPageService.get({
        clientToken: 'token',
        prisonerData: PrisonerMockDataA,
        staffId: 1,
        inmateDetail: inmateDetailMock,
      })
      expect(res.staffContacts).toEqual({
        keyWorker: Result.rejected(Error('some error!')).toPromiseSettledResult(),
        prisonOffenderManager: 'Andy Marke',
        coworkingPrisonOffenderManager: 'Andy Hudson',
        communityOffenderManager: 'Terry Scott',
      })
    })
  })

  describe('getStatuses', () => {
    it('should get statuses for Current Location, Recognised Listener and Suitable Listener, Neurodiversity', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456
      mockedNeurodiversityEnabled.mockImplementation(() => true)

      const overviewPageService = overviewPageServiceConstruct()
      await overviewPageService.get({
        clientToken: 'token',
        prisonerData: { prisonerNumber, bookingId } as Prisoner,
        staffId: 1,
        inmateDetail: inmateDetailMock,
      })
      expect(curiousApiClient.getLearnerNeurodivergence).toHaveBeenCalledWith(prisonerNumber)
    })

    describe('should map api results into page data', () => {
      it('should have "in" location if in prison', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          clientToken: 'token',
          prisonerData: {
            prisonerNumber,
            bookingId,
            inOutStatus: 'IN',
            prisonName: 'Moorland (HMP & YOI)',
          } as Prisoner,
          staffId: 1,
          inmateDetail: inmateDetailMock,
        })

        expect(res.statuses.some(status => status.label === 'In Moorland (HMP & YOI)')).toBeTruthy()
      })

      it('should have "out" location if temp out of prison', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          clientToken: 'token',
          prisonerData: {
            prisonerNumber,
            bookingId,
            inOutStatus: 'OUT',
            status: 'ACTIVE OUT',
            prisonName: 'Moorland (HMP & YOI)',
          } as Prisoner,
          staffId: 1,
          inmateDetail: inmateDetailMock,
        })

        expect(res.statuses.some(status => status.label === 'Out from Moorland (HMP & YOI)')).toBeTruthy()
      })

      it('should have "out" location if released from prison', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          clientToken: 'token',
          prisonerData: {
            prisonerNumber,
            bookingId,
            inOutStatus: 'OUT',
            status: 'INACTIVE OUT',
            locationDescription: 'Outside - released from Moorland (HMP & YOI)',
          } as Prisoner,
          staffId: 1,
          inmateDetail: inmateDetailMock,
        })

        expect(
          res.statuses.some(status => status.label === 'Outside - released from Moorland (HMP & YOI)'),
        ).toBeTruthy()
      })

      it('should have "Being transferred" location if TRN', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          clientToken: 'token',
          prisonerData: {
            prisonerNumber,
            bookingId,
            inOutStatus: 'TRN',
          } as Prisoner,
          staffId: 1,
          inmateDetail: inmateDetailMock,
        })

        expect(res.statuses.some(status => status.label === 'Being transferred')).toBeTruthy()
      })

      it.each([
        ['Suitable Blank/Recognised Blank', suitableListenerBlank, recognisedListenerBlank, false, false],
        ['Suitable No/Recognised Blank', suitableListenerNo, recognisedListenerBlank, false, false],
        ['Suitable No/Recognised No', suitableListenerNo, recognisedListenerNo, false, false],
        ['Suitable Yes/Recognised Blank', suitableListenerYes, recognisedListenerBlank, true, false],
        ['Suitable Yes/Recognised No', suitableListenerYes, recognisedListenerNo, true, false],
        ['Suitable Yes/Recognised Yes', suitableListenerYes, recognisedListenerYes, false, true],
        ['Suitable Blank/Recognised Yes', suitableListenerBlank, recognisedListenerYes, false, true],
        ['Suitable No/Recognised Yes', suitableListenerNo, recognisedListenerYes, false, true],
        ['Suitable None/Recognised No', null, recognisedListenerNo, false, false],
      ])(
        'given %s should show correct suitable and/or recognised listener statuses',
        async (
          _: string,
          suitableListener: ProfileInformation,
          recognisedListener: ProfileInformation,
          displaySuitable: boolean,
          displayRecognised: boolean,
        ) => {
          const profileInformation = []
          if (suitableListener) profileInformation.push(suitableListener)
          if (recognisedListener) profileInformation.push(recognisedListener)

          const prisonerNumber = 'A1234BC'
          const bookingId = 123456
          const inmateDetail = {
            profileInformation,
          } as InmateDetail

          const overviewPageService = overviewPageServiceConstruct()
          const res = await overviewPageService.get({
            clientToken: 'token',
            prisonerData: { prisonerNumber, bookingId } as Prisoner,
            staffId: 1,
            inmateDetail,
          })

          expect(res.statuses.some(status => status.label === 'Suitable Listener')).toEqual(displaySuitable)
          expect(res.statuses.some(status => status.label === 'Recognised Listener')).toEqual(displayRecognised)
        },
      )

      it('should have neurodiversity support status if returned from API and it is enabled', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456
        mockedNeurodiversityEnabled.mockImplementation(() => true)

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          clientToken: 'token',
          prisonerData: { prisonerNumber, bookingId } as Prisoner,
          staffId: 1,
          inmateDetail: inmateDetailMock,
        })

        expect(
          res.statuses.some(
            status => status.label === 'Support needed' && status.subText === 'Has neurodiversity needs',
          ),
        ).toBeTruthy()
      })

      it('should not have neurodiversity support status if returned from API and it is not enabled', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456
        mockedNeurodiversityEnabled.mockImplementation(() => false)

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          clientToken: 'token',
          prisonerData: { prisonerNumber, bookingId } as Prisoner,
          staffId: 1,
          inmateDetail: inmateDetailMock,
        })

        expect(
          res.statuses.some(
            status => status.label === 'Support needed' && status.subText === 'Has neurodiversity needs',
          ),
        ).toBeFalsy()
      })

      it('should not have neurodiversity support status if not returned from API and it is enabled', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456
        curiousApiClient.getLearnerNeurodivergence = jest.fn(async () => null)
        mockedNeurodiversityEnabled.mockImplementation(() => true)

        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          clientToken: 'token',
          prisonerData: { prisonerNumber, bookingId } as Prisoner,
          staffId: 1,
          inmateDetail: inmateDetailMock,
        })

        expect(
          res.statuses.some(
            status => status.label === 'Support needed' && status.subText === 'Has neurodiversity needs',
          ),
        ).toBeFalsy()
      })

      it('should indicate an error with neurodiversity support status when API fails', async () => {
        const prisonerNumber = 'A1234BC'
        const bookingId = 123456
        curiousApiClient.getLearnerNeurodivergence = jest.fn(async () => Promise.reject(new Error()))
        mockedNeurodiversityEnabled.mockImplementation(() => true)

        let apiErrorFlag = false
        const overviewPageService = overviewPageServiceConstruct()
        const res = await overviewPageService.get({
          clientToken: 'token',
          prisonerData: { prisonerNumber, bookingId } as Prisoner,
          staffId: 1,
          inmateDetail: inmateDetailMock,
          apiErrorCallback: () => {
            apiErrorFlag = true
          },
        })

        expect(apiErrorFlag).toBeTruthy()
        expect(
          res.statuses.some(
            status =>
              status.label === 'Support needs unavailable' &&
              status.subText === 'Try again later' &&
              status.error === true,
          ),
        ).toBeTruthy()
      })
    })

    describe('Displaying upcoming transfer', () => {
      const scheduledTransferLabel = 'Scheduled transfer'

      describe('Given a scheduled transfer for the prisoner', () => {
        it('Adds a status', async () => {
          const prisonerNumber = 'A1234BC'
          const bookingId = 123456
          prisonApiClient.getScheduledTransfers = jest.fn(async () => scheduledTransfersMock)

          const overviewPageService = overviewPageServiceConstruct()
          const res = await overviewPageService.get({
            clientToken: 'token',
            prisonerData: { prisonerNumber, bookingId, prisonId: '123' } as Prisoner,
            staffId: 1,
            inmateDetail: inmateDetailMock,
          })
          const scheduledStatus = res.statuses.filter(s => s.label === scheduledTransferLabel)[0]
          expect(scheduledStatus.label).toEqual(scheduledTransferLabel)
          expect(scheduledStatus.subText).toEqual(`To ${scheduledTransfersMock[0].eventLocation}`)
        })
      })

      describe('Given no scheduled transfers', () => {
        it('Does not add a status', async () => {
          const prisonerNumber = 'A1234BC'
          const bookingId = 123456

          const overviewPageService = overviewPageServiceConstruct()
          const res = await overviewPageService.get({
            clientToken: 'token',
            prisonerData: { prisonerNumber, bookingId, prisonId: '123' } as Prisoner,
            staffId: 1,
            inmateDetail: inmateDetailMock,
          })

          expect(res.statuses.filter(s => s.label === scheduledTransferLabel)).toEqual([])
        })
      })
    })
  })

  describe('getOffenceOverview', () => {
    it('should get the offence overview data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({
        clientToken: 'token',
        prisonerData: {
          prisonerNumber,
          bookingId,
          inOutStatus: 'OUT',
          locationDescription: 'Moorland (HMP & YOI)',
        } as Prisoner,
        staffId: 1,
        inmateDetail: inmateDetailMock,
      })
      expect(res.offencesOverview).toEqual(offenceOverviewMock)
    })
  })
  describe('Staff roles', () => {
    it('Returns the staff role codes from the prison API', async () => {
      prisonApiClient.getStaffRoles = jest.fn(async () => [{ role: 'A' }, { role: 'B' }])
      const { staffRoles } = await overviewPageServiceConstruct().get({
        clientToken: '',
        prisonerData: PrisonerMockDataA,
        staffId: 1,
        inmateDetail: inmateDetailMock,
        userCaseLoads: CaseLoadsDummyDataA,
      })
      expect(prisonApiClient.getStaffRoles).toHaveBeenCalledWith(1, 'MDI')
      expect(staffRoles).toEqual(['A', 'B'])
    })
  })

  describe('Non-association summary', () => {
    it('should return non-associations summary data', async () => {
      const overviewPageService = overviewPageServiceConstruct()
      const res = await overviewPageService.get({
        clientToken: 'token',
        prisonerData: PrisonerMockDataA,
        staffId: 1,
        inmateDetail: inmateDetailMock,
        userCaseLoads: CaseLoadsDummyDataA,
      })
      expect(res.nonAssociationSummary).toEqual({
        prisonName: 'Moorland (HMP & YOI)',
        prisonCount: 1,
        otherPrisonsCount: 1,
      })
    })
  })
})
