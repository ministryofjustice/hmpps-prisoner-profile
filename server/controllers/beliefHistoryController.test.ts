import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import BeliefHistoryController from './beliefHistoryController'
import BeliefService from '../services/beliefService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'

describe('Prisoner belief history', () => {
  const prisonerNumber = 'G6123VU'

  let req: any
  let res: any
  let controller: BeliefHistoryController

  beforeEach(() => {
    req = {
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      originalUrl: 'http://localhost',
      params: { prisonerNumber },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
          userRoles: [Role.PrisonUser],
          caseLoads: CaseLoadsDummyDataA,
          token: 'TOKEN',
        },
      },
      render: jest.fn(),
      status: jest.fn(),
    }
    controller = new BeliefHistoryController(new BeliefService(null), auditServiceMock())
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  it('foo', () => {})
})
