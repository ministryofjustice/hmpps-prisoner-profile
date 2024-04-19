import OverviewController from './overviewController'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
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
import OverviewPageService from '../services/overviewPageService'
import { overviewPageServiceMock } from '../../tests/mocks/overviewPageServiceMock'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { Role } from '../data/enums/role'
import { prisonerScheduleServiceMock } from '../../tests/mocks/prisonerScheduleServiceMock'
import PrisonerScheduleService from '../services/prisonerScheduleService'
import { assessmentsMock } from '../data/localMockData/miniSummaryMock'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import IncentivesService from '../services/incentivesService'
import { incentiveServiceMock } from '../../tests/mocks/incentiveServiceMock'

const getResLocals = ({
  userRoles = ['CELL_MOVE'],
  caseLoads = CaseLoadsDummyDataA,
}: {
  userRoles?: string[]
  caseLoads?: CaseLoad[]
} = {}) => {
  return {
    user: {
      userRoles,
      staffId: 487023,
      caseLoads,
      token: 'USER_TOKEN',
    },
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
  let overviewPageService: OverviewPageService
  let prisonerScheduleService: PrisonerScheduleService
  let incentiveService: IncentivesService

  beforeEach(() => {
    req = {
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
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
    overviewPageService = overviewPageServiceMock() as OverviewPageService
    prisonerScheduleService = prisonerScheduleServiceMock() as PrisonerScheduleService
    incentiveService = incentiveServiceMock() as IncentivesService

    controller = new OverviewController(
      overviewPageService,
      () => pathfinderApiClient,
      () => manageSocCasesApiClient,
      auditService,
      offencesService,
      moneyService,
      adjudicationsService,
      visitsService,
      prisonerScheduleService,
      incentiveService,
    )
  })

  describe('moneySummary', () => {
    it('should call moneyService.getMoneySummary and include response', async () => {
      moneyService.getAccountBalances = jest
        .fn()
        .mockResolvedValue({ spends: 1, savings: 2, cash: 2, damageObligations: 3, currency: 'GBP' })

      await controller.displayOverview(req, res, PrisonerMockDataA, inmateDetailMock)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          moneySummary: { spends: 1, savings: 2, cash: 2, damageObligations: 3, currency: 'GBP' },
        }),
      )
    })

    it('should not call moneyService.getMoneySummary if prisoner is not in caseload', async () => {
      const resNotInCaseload = {
        ...res,
        locals: getResLocals({ caseLoads: CaseLoadsDummyDataB }),
      }
      moneyService.getAccountBalances = jest
        .fn()
        .mockResolvedValue({ spends: 1, savings: 2, cash: 2, damageObligations: 3, currency: 'GBP' })

      await controller.displayOverview(req, resNotInCaseload, PrisonerMockDataA, inmateDetailMock)
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
      adjudicationsService.getAdjudicationsOverview = jest
        .fn()
        .mockResolvedValue({ adjudicationCount: 1, activePunishments: 2 })

      await controller.displayOverview(req, res, PrisonerMockDataA, inmateDetailMock)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          adjudicationSummary: { adjudicationCount: 1, activePunishments: 2 },
        }),
      )
    })

    it('should not call adjudicationsService.getAdjudicationsOverview if prisoner is not in caseload', async () => {
      const resNotInCaseload = {
        ...res,
        locals: getResLocals({ caseLoads: CaseLoadsDummyDataB }),
      }
      adjudicationsService.getAdjudicationsOverview = jest
        .fn()
        .mockResolvedValue({ adjudicationCount: 1, activePunishments: 2 })

      await controller.displayOverview(req, resNotInCaseload, PrisonerMockDataA, inmateDetailMock)
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

        await controller.displayOverview(req, resRole, PrisonerMockDataA, inmateDetailMock)
        expect(res.render).toHaveBeenCalledWith(
          'pages/overviewPage',
          expect.objectContaining({ adjudicationSummary: { adjudicationCount: 1, activePunishments: 2 } }),
        )
      },
    )
  })

  describe('visitsSummary', () => {
    it('should call visitsService.getVisitsOverview and include response', async () => {
      visitsService.getVisitsOverview = jest
        .fn()
        .mockResolvedValue({ startDate: '2030-03-02', remainingVo: 2, remainingPvo: 2 })

      await controller.displayOverview(req, res, PrisonerMockDataA, inmateDetailMock)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          visitsSummary: { startDate: '2030-03-02', remainingVo: 2, remainingPvo: 2 },
        }),
      )
    })

    it('should not call visitsService.getVisitsOverview if prisoner is not in caseload', async () => {
      const resNotInCaseload = {
        ...res,
        locals: getResLocals({ caseLoads: CaseLoadsDummyDataB }),
      }
      visitsService.getVisitsOverview = jest
        .fn()
        .mockResolvedValue({ startDate: '2030-03-02', remainingVo: 2, remainingPvo: 2 })

      await controller.displayOverview(req, resNotInCaseload, PrisonerMockDataA, inmateDetailMock)
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

      await controller.displayOverview(req, res, PrisonerMockDataA, inmateDetailMock)
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
      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      await controller.displayOverview(
        req,
        res,
        { prisonerNumber, bookingId, prisonId: 'MDI', assessments: assessmentsMock } as Prisoner,
        inmateDetailMock,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          categorySummary: { codeDescription: 'B', nextReviewDate: '2023-02-19', userCanManage: false },
        }),
      )
    })

    it.each([
      Role.CreateRecategorisation,
      Role.ApproveCategorisation,
      Role.CreateRecategorisation,
      Role.CategorisationSecurity,
    ])('should set userCanManage to true when user has a specific role', async role => {
      const resRole = {
        ...res,
        locals: getResLocals({ userRoles: [role] }),
      }

      const prisonerNumber = 'A1234BC'
      const bookingId = 123456

      await controller.displayOverview(
        req,
        resRole,
        { prisonerNumber, bookingId, prisonId: 'MDI', assessments: assessmentsMock } as Prisoner,
        inmateDetailMock,
      )

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
        req,
        res,
        { prisonerNumber, bookingId, prisonId: 'MDI', assessments: assessmentsMock } as Prisoner,
        inmateDetailMock,
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
      incentiveService.getIncentiveOverview = jest.fn().mockResolvedValue({
        positiveBehaviourCount: 1,
        negativeBehaviourCount: 1,
        nextReviewDate: '2026-01-01',
        daysOverdue: undefined,
      })

      await controller.displayOverview(req, res, PrisonerMockDataA, inmateDetailMock)
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

    it('should not call incentiveService.getIncentiveOverview if prisoner is not in caseload', async () => {
      const resNotInCaseload = {
        ...res,
        locals: getResLocals({ caseLoads: CaseLoadsDummyDataB }),
      }
      incentiveService.getIncentiveOverview = jest.fn().mockResolvedValue({
        positiveBehaviourCount: 1,
        negativeBehaviourCount: 1,
        nextReviewDate: '2026-01-01',
        daysOverdue: undefined,
      })

      await controller.displayOverview(req, resNotInCaseload, PrisonerMockDataA, inmateDetailMock)
      expect(res.render).toHaveBeenCalledWith(
        'pages/overviewPage',
        expect.objectContaining({
          incentiveSummary: null,
        }),
      )
    })

    it('should call adjudicationsService.getAdjudicationsOverview if user is Global search user', async () => {
      const resRole = {
        ...res,
        locals: getResLocals({ caseLoads: CaseLoadsDummyDataB, userRoles: [Role.GlobalSearch] }),
      }
      incentiveService.getIncentiveOverview = jest.fn().mockResolvedValue({
        positiveBehaviourCount: 1,
        negativeBehaviourCount: 1,
        nextReviewDate: '2026-01-01',
        daysOverdue: undefined,
      })

      await controller.displayOverview(req, resRole, PrisonerMockDataA, inmateDetailMock)
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
  })
})
