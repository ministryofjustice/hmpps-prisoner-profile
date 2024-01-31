import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { LearnerGoalsMock } from '../data/localMockData/learnerGoalsMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import WorkAndSkillsPageService from '../services/workAndSkillsPageService'
import GoalsController from './goalsController'

let req: any
let res: any
let controller: GoalsController

jest.mock('../services/workAndSkillsPageService.ts')

describe('Prisoner goals controller', () => {
  let workAndSkillsPageService: WorkAndSkillsPageService

  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'A9999AA' },
      query: {},
      middleware: {
        prisonerData: PrisonerMockDataA,
      },
      headers: {
        referer: 'http://referer',
      },
      path: 'goals',
      session: {
        userDetails: { displayName: 'A Name' },
      },
      flash: jest.fn(),
    }
    res = {
      locals: {
        clientToken: 'CLIENT_TOKEN',
        user: {
          userRoles: [Role.PrisonUser],
          staffId: 487023,
          caseLoads: CaseLoadsDummyDataA,
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }

    workAndSkillsPageService = new WorkAndSkillsPageService(null, null)
    workAndSkillsPageService.get = jest.fn().mockResolvedValue(LearnerGoalsMock)
    controller = new GoalsController(workAndSkillsPageService, auditServiceMock())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('displayGoals', () => {
    it('should render the page with the prisoners goals from VC2', async () => {
      // Given
      const getGoals = jest.spyOn<any, string>(controller['workAndSkillsPageService'], 'get')
      const expectedGoals = LearnerGoalsMock
      const expectedView = {
        prisonerName: 'John Saunders',
        prisonerNumber: 'G6123VU',
        ...expectedGoals,
      }

      // When
      await controller.displayGoals(req, res)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/goals/vc2GoalsPage', expectedView)
      expect(getGoals).toHaveBeenCalledWith(res.locals.clientToken, req.middleware.prisonerData)
    })
  })
})
