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

  let req: Request
  let res: Response

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      path: 'goals',
      query: {},
      params: { prisonerNumber: 'A9999AA' },
      headers: { referer: 'http://referer' },
      session: {},
      middleware: { clientToken: 'CLIENT_TOKEN', prisonerData: PrisonerMockDataA },
      flash: jest.fn(),
    } as unknown as Request
    res = {
      locals: {
        user: {
          displayName: 'A Name',
          userRoles: [Role.PrisonUser],
          staffId: 487023,
          caseLoads: CaseLoadsDummyDataA,
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('displayGoals', () => {
    it('should render the page with the prisoners goals from VC2', async () => {
      // Given
      const getGoals = jest.spyOn(controller.workAndSkillsPageService, 'get')

      const expectedGoals = aValidLearnerGoals()
      workAndSkillsPageService.get.mockResolvedValue(expectedGoals)

      // When
      await controller.displayGoals(req, res)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/goals/vc2GoalsPage', {
        ...expectedGoals,
      })
      expect(getGoals).toHaveBeenCalledWith(
        req.middleware.clientToken,
        req.middleware.prisonerData,
        res.locals.apiErrorCallback,
      )
    })
  })
})
