import {
  isGranted,
  PersonPrisonCategoryPermission,
  PrisonerAdjudicationsPermission,
  PrisonerIncentivesPermission,
  PrisonerMoneyPermission,
  PrisonerPermission,
  PrisonerPermissions,
  PrisonerVisitsAndVisitorsPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import OverviewController from './overviewController'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import {
  inmateDetailMock,
  recognisedListenerBlank,
  recognisedListenerNo,
  recognisedListenerYes,
  suitableListenerBlank,
  suitableListenerNo,
  suitableListenerYes,
} from '../data/localMockData/inmateDetailMock'
import { CaseLoadsDummyDataA, CaseLoadsDummyDataB } from '../data/localMockData/caseLoad'
import MoneyService from '../services/moneyService'
import { moneyServiceMock } from '../../tests/mocks/moneyServiceMock'
import { PathfinderApiClient } from '../data/interfaces/pathfinderApi/pathfinderApiClient'
import { pathfinderApiClientMock } from '../../tests/mocks/pathfinderApiClientMock'
import { ManageSocCasesApiClient } from '../data/interfaces/manageSocCasesApi/manageSocCasesApiClient'
import { manageSocCasesApiClientMock } from '../../tests/mocks/manageSocCasesApiClientMock'
import { AuditService } from '../services/auditService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import OffencesService from '../services/offencesService'
import { offencesServiceMock } from '../../tests/mocks/offencesServiceMock'
import AdjudicationsService from '../services/adjudicationsService'
import { adjudicationsServiceMock } from '../../tests/mocks/adjudicationsServiceMock'
import { VisitsService } from '../services/visitsService'
import { visitsServiceMock } from '../../tests/mocks/visitsServiceMock'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { Role } from '../data/enums/role'
import { prisonerScheduleServiceMock } from '../../tests/mocks/prisonerScheduleServiceMock'
import PrisonerScheduleService from '../services/prisonerScheduleService'
import { assessmentsMock } from '../data/localMockData/miniSummaryMock'
import IncentivesService from '../services/incentivesService'
import { incentiveServiceMock } from '../../tests/mocks/incentiveServiceMock'
import PersonalPageService from '../services/personalPageService'
import { personalPageServiceMock } from '../../tests/mocks/personalPageServiceMock'
import OffenderService from '../services/offenderService'
import { offenderServiceMock } from '../../tests/mocks/offenderServiceMock'
import ProfessionalContactsService from '../services/professionalContactsService'
import { professionalContactsServiceMock } from '../../tests/mocks/professionalContactsServiceMock'
import { LearnerNeurodivergenceMock } from '../data/localMockData/learnerNeurodivergenceMock'
import ProfileInformation from '../data/interfaces/prisonApi/ProfileInformation'
import { OverviewStatus } from './interfaces/OverviewPageData'
import { scheduledTransfersMock } from '../data/localMockData/scheduledTransfersMock'
import CsipService from '../services/csipService'
import { csipServiceMock } from '../../tests/mocks/csipServiceMock'
import { PrisonerPrisonSchedule } from '../data/interfaces/prisonApi/PrisonerSchedule'
import ContactsService from '../services/contactsService'
import { contactsServiceMock } from '../../tests/mocks/contactsServiceMock'
import config from '../config'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')

const isGrantedMock = isGranted as jest.MockedFunction<typeof isGranted>
const prisonerPermissions = {} as PrisonerPermissions

const getResLocals = ({
  userRoles = ['CELL_MOVE'],
  caseLoads = CaseLoadsDummyDataA,
}: {
  userRoles?: string[]
  caseLoads?: CaseLoad[]
} = {}) => {
  return {
    user: {
      authSource: 'nomis',
      userRoles,
      staffId: 487023,
      caseLoads,
      token: 'USER_TOKEN',
    },
    prisonerPermissions,
  }
}

describe('overviewController', () => {
  const offenderNo = 'ABC123'
  let req: any
  let res: any
  let controller: OverviewController
  let moneyService: MoneyService
  let pathfinderApiClient: PathfinderApiClient
  let manageSocCasesApiClient: ManageSocCasesApiClient
  let auditService: AuditService
  let offencesService: OffencesService
  let adjudicationsService: AdjudicationsService
  let visitsService: VisitsService
  let prisonerScheduleService: PrisonerScheduleService
  let incentiveService: IncentivesService
  let personalPageService: PersonalPageService
  let offenderService: OffenderService
  let professionalContactsService: ProfessionalContactsService
  let csipService: CsipService
  let contactsService: ContactsService

  beforeEach(() => {
    req = {
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
        alertSummaryData: {
          alertFlags: [],
        },
      },
      originalUrl: 'http://localhost',
      params: { offenderNo },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = {
      locals: getResLocals(),
      render: jest.fn(),
      redirect: jest.fn(),
    }

    moneyService = moneyServiceMock() as MoneyService
    pathfinderApiClient = pathfinderApiClientMock() as PathfinderApiClient
    manageSocCasesApiClient = manageSocCasesApiClientMock() as ManageSocCasesApiClient
    auditService = auditServiceMock() as AuditService
    offencesService = offencesServiceMock() as OffencesService
    adjudicationsService = adjudicationsServiceMock() as AdjudicationsService
    visitsService = visitsServiceMock() as VisitsService
    prisonerScheduleService = prisonerScheduleServiceMock() as PrisonerScheduleService
    incentiveService = incentiveServiceMock() as IncentivesService
    personalPageService = personalPageServiceMock() as PersonalPageService
    offenderService = offenderServiceMock() as OffenderService
    professionalContactsService = professionalContactsServiceMock() as ProfessionalContactsService
    csipService = csipServiceMock() as CsipService
    contactsService = contactsServiceMock() as ContactsService

    controller = new OverviewController(
      () => pathfinderApiClient,
      () => manageSocCasesApiClient,
      auditService,
      offencesService,
      moneyService,
      adjudicationsService,
      visitsService,
      prisonerScheduleService,
      incentiveService,
      personalPageService,
      offenderService,
      professionalContactsService,
      csipService,
      contactsService,
    )

    offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)
  })

  describe('moneySummary', () => {
    it('should call moneyService.getMoneySummary and include response', async () => {
      mockPermissionCheck(PrisonerMoneyPermission.read, true)

      moneyService.getAccountBalances = jest
        .fn()
        .mockResolvedValue({ spends: 1, savings: 2, cash: 2, damageObligations: 3, currency: 'GBP' })

      await controller.displayOverview(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          moneySummary: { spends: 1, savings: 2, cash: 2, damageObligations: 3, currency: 'GBP' },
        }),
      )
    })

    it('should not call moneyService.getMoneySummary if user doesnt have permission', async () => {
      mockPermissionCheck(PrisonerMoneyPermission.read, false)

      moneyService.getAccountBalances = jest
        .fn()
        .mockResolvedValue({ spends: 1, savings: 2, cash: 2, damageObligations: 3, currency: 'GBP' })

      await controller.displayOverview(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          moneySummary: null,
        }),
      )
    })
  })

  describe('adjudicationsSummary', () => {
    it('should call adjudicationsService.getAdjudicationsOverview and include response', async () => {
      mockPermissionCheck(PrisonerAdjudicationsPermission.read, true)

      adjudicationsService.getAdjudicationsOverview = jest
        .fn()
        .mockResolvedValue({ adjudicationCount: 1, activePunishments: 2 })

      await controller.displayOverview(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          adjudicationSummary: expect.objectContaining({ value: { adjudicationCount: 1, activePunishments: 2 } }),
        }),
      )
    })

    it('should not call adjudicationsService.getAdjudicationsOverview if user doesnt have permission', async () => {
      mockPermissionCheck(PrisonerAdjudicationsPermission.read, false)

      const resNotInCaseload = {
        ...res,
        locals: getResLocals({ caseLoads: CaseLoadsDummyDataB }),
      }

      adjudicationsService.getAdjudicationsOverview = jest
        .fn()
        .mockResolvedValue({ adjudicationCount: 1, activePunishments: 2 })

      await controller.displayOverview(req, resNotInCaseload)

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          adjudicationSummary: null,
        }),
      )
    })

    it.each([Role.PomUser, Role.ReceptionUser])(
      `should call adjudicationsService.getAdjudicationsOverview if user has role %s`,
      async role => {
        const resRole = {
          ...res,
          locals: getResLocals({ caseLoads: CaseLoadsDummyDataB, userRoles: [role] }),
        }
        adjudicationsService.getAdjudicationsOverview = jest
          .fn()
          .mockResolvedValue({ adjudicationCount: 1, activePunishments: 2 })

        await controller.displayOverview(req, resRole)
        expect.objectContaining({
          adjudicationSummary: expect.objectContaining({ value: { adjudicationCount: 1, activePunishments: 2 } }),
        })
      },
    )
  })

  describe('visitsSummary', () => {
    it('should call visitsService.getVisitsOverview and include response', async () => {
      mockPermissionCheck(PrisonerVisitsAndVisitorsPermission.read, true)

      visitsService.getVisitsOverview = jest
        .fn()
        .mockResolvedValue({ startDate: '2030-03-02', remainingVo: 2, remainingPvo: 2 })

      await controller.displayOverview(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          visitsSummary: { startDate: '2030-03-02', remainingVo: 2, remainingPvo: 2 },
        }),
      )
    })

    it('should not call visitsService.getVisitsOverview if prisoner is not in caseload', async () => {
      mockPermissionCheck(PrisonerVisitsAndVisitorsPermission.read, false)

      const resNotInCaseload = {
        ...res,
        locals: getResLocals({ caseLoads: CaseLoadsDummyDataB }),
      }

      visitsService.getVisitsOverview = jest
        .fn()
        .mockResolvedValue({ startDate: '2030-03-02', remainingVo: 2, remainingPvo: 2 })

      await controller.displayOverview(req, resNotInCaseload)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          moneySummary: null,
        }),
      )
    })
  })

  describe('schedule', () => {
    it('should call prisonerScheduleService.getScheduleOverview and include response', async () => {
      prisonerScheduleService.getScheduleOverview = jest
        .fn()
        .mockResolvedValue({ morning: [], afternoon: [], evening: [] })

      await controller.displayOverview(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          schedule: { morning: [], afternoon: [], evening: [] },
        }),
      )
    })
  })

  describe('categorySummary', () => {
    it('should get data and map category summary data', async () => {
      mockPermissionCheck(PersonPrisonCategoryPermission.edit, false)

      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      await controller.displayOverview(
        {
          ...req,
          middleware: {
            ...req.middleware,
            prisonerData: { prisonerNumber, bookingId, prisonId: 'MDI', assessments: assessmentsMock },
          },
        },
        res,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          categorySummary: { codeDescription: 'B', nextReviewDate: '2023-02-19', userCanManage: false },
        }),
      )
    })

    it('should set userCanManage to true when user has permission', async () => {
      mockPermissionCheck(PersonPrisonCategoryPermission.edit, true)

      const prisonerNumber = 'A1234BC'
      const bookingId = 123456
      const reqEditCategory = {
        ...req,
        middleware: {
          ...req.middleware,
          prisonerData: { prisonerNumber, bookingId, prisonId: 'MDI', assessments: assessmentsMock },
        },
      }

      await controller.displayOverview(reqEditCategory, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          categorySummary: {
            codeDescription: 'B',
            nextReviewDate: '2023-02-19',
            userCanManage: true,
          },
        }),
      )
    })
  })

  describe('csraSummary', () => {
    it('should get data and map csra summary data', async () => {
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      await controller.displayOverview(
        {
          ...req,
          middleware: {
            ...req.middleware,
            prisonerData: { prisonerNumber, bookingId, prisonId: 'MDI', assessments: assessmentsMock },
          },
        },
        res,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          csraSummary: { assessmentDate: '2021-02-19', classification: 'Standard' },
        }),
      )
    })
  })

  describe('incentiveSummary', () => {
    it('should call incentiveService.getIncentiveOverview and include response', async () => {
      mockPermissionCheck(PrisonerIncentivesPermission.read, true)

      incentiveService.getIncentiveOverview = jest.fn().mockResolvedValue({
        positiveBehaviourCount: 1,
        negativeBehaviourCount: 1,
        nextReviewDate: '2026-01-01',
        daysOverdue: undefined,
      })

      await controller.displayOverview(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          incentiveSummary: {
            positiveBehaviourCount: 1,
            negativeBehaviourCount: 1,
            nextReviewDate: '2026-01-01',
            daysOverdue: undefined,
          },
        }),
      )
    })

    it('should not call incentiveService.getIncentiveOverview if user does not have permission', async () => {
      mockPermissionCheck(PrisonerIncentivesPermission.read, false)

      incentiveService.getIncentiveOverview = jest.fn().mockResolvedValue({
        positiveBehaviourCount: 1,
        negativeBehaviourCount: 1,
        nextReviewDate: '2026-01-01',
        daysOverdue: undefined,
      })

      await controller.displayOverview(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          incentiveSummary: null,
        }),
      )
    })
  })

  describe('statuses', () => {
    it('should get statuses for Current Location, Recognised Listener and Neurodiversity', async () => {
      offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)
      personalPageService.getLearnerNeurodivergence = jest.fn().mockResolvedValue(LearnerNeurodivergenceMock)

      await controller.displayOverview(
        {
          ...req,
          middleware: { ...req.middleware, prisonerData: { ...PrisonerMockDataA, prisonId: 'LII' } },
        },
        res,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          statuses: [
            { label: 'In Moorland (HMP & YOI)' },
            { label: 'Recognised Listener' },
            { label: 'Support needed', subText: 'Has neurodiversity needs' },
          ],
        }),
      )
    })

    it('should not return Neurodiversity if not at supported prison', async () => {
      offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)
      personalPageService.getLearnerNeurodivergence = jest.fn().mockResolvedValue([])

      await controller.displayOverview(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          statuses: [{ label: 'In Moorland (HMP & YOI)' }, { label: 'Recognised Listener' }],
        }),
      )
    })

    it('should indicate an error with neurodiversity support status when API fails', async () => {
      offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)
      personalPageService.getLearnerNeurodivergence = jest.fn().mockRejectedValue('ERROR')

      await controller.displayOverview(
        {
          ...req,
          middleware: { ...req.middleware, prisonerData: { ...PrisonerMockDataA, prisonId: 'LII' } },
        },
        res,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          statuses: [
            { label: 'In Moorland (HMP & YOI)' },
            { label: 'Recognised Listener' },
            { label: 'Support needs unavailable', subText: 'Try again later', error: true },
          ],
        }),
      )
    })

    it('should display out location of temporarily out of prison', async () => {
      offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)

      await controller.displayOverview(
        {
          ...req,
          middleware: {
            ...req.middleware,
            prisonerData: { ...PrisonerMockDataA, prisonId: 'LII', inOutStatus: 'OUT', status: 'ACTIVE OUT' },
          },
        },
        res,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          statuses: [{ label: 'Out from Moorland (HMP & YOI)' }, { label: 'Recognised Listener' }],
        }),
      )
    })

    it('should display out location if released from prison', async () => {
      offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)

      await controller.displayOverview(
        {
          ...req,
          middleware: {
            ...req.middleware,
            prisonerData: {
              ...PrisonerMockDataA,
              prisonId: 'LII',
              inOutStatus: 'OUT',
              status: 'INACTIVE OUT',
              locationDescription: 'Outside - released from Moorland (HMP & YOI)',
            },
          },
        },
        res,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          statuses: [{ label: 'Outside - released from Moorland (HMP & YOI)' }, { label: 'Recognised Listener' }],
        }),
      )
    })

    it('should display "Being transferred" if TRN', async () => {
      offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)

      await controller.displayOverview(
        {
          ...req,
          middleware: {
            ...req.middleware,
            prisonerData: {
              ...PrisonerMockDataA,
              prisonId: 'LII',
              inOutStatus: 'TRN',
            },
          },
        },
        res,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          statuses: [{ label: 'Being transferred' }, { label: 'Recognised Listener' }],
        }),
      )
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
        const profileInformation = [suitableListener, recognisedListener].filter(Boolean)
        offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)

        await controller.displayOverview(
          {
            ...req,
            middleware: {
              ...req.middleware,
              inmateDetail: { ...inmateDetailMock, profileInformation },
            },
          },
          res,
        )

        const { statuses } = res.render.mock.calls[0][1]

        expect(statuses.some((status: OverviewStatus) => status.label === 'Suitable Listener')).toEqual(displaySuitable)
        expect(statuses.some((status: OverviewStatus) => status.label === 'Recognised Listener')).toEqual(
          displayRecognised,
        )
      },
    )

    describe('upcoming transfers', () => {
      const scheduledTransferLabel = 'Scheduled transfer'

      describe('Given a scheduled transfer for the prisoner', () => {
        it('Adds a status', async () => {
          offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)
          prisonerScheduleService.getScheduledTransfers = jest.fn(async () => scheduledTransfersMock)

          await controller.displayOverview(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'pages/overviewPage',
            expect.objectContaining({
              statuses: expect.arrayContaining([{ label: scheduledTransferLabel, subText: 'To Moorland (HMP & YOI)' }]),
            }),
          )
        })
      })

      describe('Given no scheduled transfers', () => {
        it('Adds a status', async () => {
          offenderService.getPrisoner = jest.fn().mockResolvedValue(inmateDetailMock)
          prisonerScheduleService.getScheduledTransfers = jest.fn(async (): Promise<PrisonerPrisonSchedule[]> => [])

          await controller.displayOverview(req, res)
          expect(res.render).toHaveBeenCalledWith(
            'pages/overviewPage',
            expect.objectContaining({
              statuses: expect.not.arrayContaining([
                { label: scheduledTransferLabel, subText: 'To Moorland (HMP & YOI)' },
              ]),
            }),
          )
        })
      })
    })
  })

  describe('offencesSummary', () => {
    it('should call offencesService.getOffencesOverview and include response with data from prisonerData', async () => {
      offencesService.getOffencesOverview = jest
        .fn()
        .mockResolvedValue({ mainOffenceDescription: 'Offence', fullStatus: 'Full Status' })

      await controller.displayOverview(
        {
          ...req,
          middleware: {
            ...req.middleware,
            prisonerData: {
              ...PrisonerMockDataA,
              imprisonmentStatusDescription: 'ISD',
              confirmedReleaseDate: 'CnRD',
              conditionalReleaseDate: 'CdRD',
            },
          },
        },
        res,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          offencesOverview: {
            mainOffenceDescription: 'Offence',
            fullStatus: 'Full Status',
            imprisonmentStatusDescription: 'ISD',
            confirmedReleaseDate: 'CnRD',
            conditionalReleaseDate: 'CdRD',
          },
        }),
      )
    })
  })

  describe('Non-associations summary', () => {
    it('Returns the non-association summary from the prison API', async () => {
      const nonAssociationSummary = { prisonName: 'A', prisonCount: 1, otherPrisonsCount: 2 }

      offenderService.getPrisonerNonAssociationOverview = jest.fn().mockResolvedValue(nonAssociationSummary)

      await controller.displayOverview(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          nonAssociationSummary: expect.objectContaining({
            status: 'fulfilled',
            value: nonAssociationSummary,
          }),
        }),
      )
    })

    it('Returns rejected Result if the prison API errors', async () => {
      offenderService.getPrisonerNonAssociationOverview = jest.fn().mockRejectedValue('Server Error')

      await controller.displayOverview(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          nonAssociationSummary: expect.objectContaining({
            status: 'rejected',
            reason: 'Server Error',
          }),
        }),
      )
    })
  })

  describe('External contacts', () => {
    afterAll(() => {
      config.featureToggles.externalContactsEnabledPrisons = []
    })

    it('Returns the external contacts counts from the contacts service', async () => {
      config.featureToggles.externalContactsEnabledPrisons = ['MDI']
      contactsService.getExternalContactsCount = jest.fn().mockResolvedValue({
        official: 1,
        social: 2,
      })

      await controller.displayOverview(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          externalContactsSummary: expect.objectContaining({
            status: 'fulfilled',
            value: {
              official: 1,
              social: 2,
            },
          }),
        }),
      )
    })

    it('Does not request the external contacts count when toggled off', async () => {
      config.featureToggles.externalContactsEnabledPrisons = []
      contactsService.getExternalContactsCount = jest.fn()

      await controller.displayOverview(req, res)

      expect(contactsService.getExternalContactsCount).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          externalContactsSummary: null,
        }),
      )
    })
  })

  describe('Staff-contacts', () => {
    it('Returns the staff contacts from the professional contacts service', async () => {
      professionalContactsService.getProfessionalContactsOverview = jest.fn().mockResolvedValue({
        keyWorker: 'KW',
        prisonOffenderManager: 'POM',
        communityOffenderManager: 'COM',
        coworkingPrisonOffenderManager: 'CW',
      })

      await controller.displayOverview(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          staffContacts: {
            keyWorker: 'KW',
            prisonOffenderManager: 'POM',
            communityOffenderManager: 'COM',
            coworkingPrisonOffenderManager: 'CW',
          },
        }),
      )
    })
  })
})

function mockPermissionCheck(permission: PrisonerPermission, granted: boolean) {
  isGrantedMock.mockImplementation((perm, perms) => perm === permission && perms === prisonerPermissions && granted)
}
