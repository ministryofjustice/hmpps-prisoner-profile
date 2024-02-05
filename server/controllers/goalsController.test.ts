import { SessionData } from 'express-session'
import { Request, Response } from 'express'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import aValidLearnerGoals from '../data/localMockData/learnerGoalsMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import WorkAndSkillsPageService from '../services/workAndSkillsPageService'
import GoalsController from './goalsController'

describe('Prisoner goals controller', () => {
  const workAndSkillsPageService = {
    get: jest.fn(),
  }

  const controller = new GoalsController(
    workAndSkillsPageService as unknown as WorkAndSkillsPageService,
    auditServiceMock(),
  )

  const req = {
    params: {} as Record<string, string>,
    query: {} as Record<string, string>,
    headers: {} as Record<string, string>,
    session: {} as SessionData,
    middleware: { prisonerData: {} },
    path: '',
    flash: jest.fn(),
  }
  const res = {
    locals: {} as Record<string, any>,
    render: jest.fn(),
    redirect: jest.fn(),
  }

  beforeEach(() => {
    jest.resetAllMocks()
    req.params = { prisonerNumber: 'A9999AA' }
    req.query = {}
    req.middleware = {
      prisonerData: PrisonerMockDataA,
    }
    req.headers = {
      referer: 'http://referer',
    }
    req.path = 'goals'
    req.session = {
      userDetails: { displayName: 'A Name' },
    } as SessionData

    res.locals = {
      clientToken: 'CLIENT_TOKEN',
      user: {
        userRoles: [Role.PrisonUser],
        staffId: 487023,
        caseLoads: CaseLoadsDummyDataA,
        token: 'USER_TOKEN',
      },
    }
  })

  describe('displayGoals', () => {
    it('should render the page with the prisoners goals from VC2', async () => {
      // Given
      const getGoals = jest.spyOn<any, string>(controller['workAndSkillsPageService'], 'get')

      const expectedGoals = aValidLearnerGoals()
      workAndSkillsPageService.get.mockResolvedValue(expectedGoals)

      const expectedView = {
        prisonerName: 'John Saunders',
        prisonerNumber: 'G6123VU',
        ...expectedGoals,
      }

      // When
      await controller.displayGoals(req as unknown as Request, res as unknown as Response)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/goals/vc2GoalsPage', expectedView)
      expect(getGoals).toHaveBeenCalledWith(res.locals.clientToken, req.middleware.prisonerData)
    })
  })
})
