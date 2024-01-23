import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import BeliefHistoryController from './beliefHistoryController'
import BeliefService from '../services/beliefService'
import { beliefHistoryMock } from '../data/localMockData/beliefHistoryMock'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
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
        clientToken: 'CLIENT_TOKEN',
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

  describe('displayBeliefHistory', () => {
    it('should call the service and render the page', async () => {
      jest.spyOn<any, string>(controller['beliefService'], 'getBeliefHistory').mockResolvedValue(beliefHistoryMock)

      await controller.displayBeliefHistory(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/beliefHistory', {
        pageTitle: 'Religion or belief history',
        beliefs: beliefHistoryMock,
        prisonerNumber,
        breadcrumbPrisonerName: formatName('John', '', 'Saunders', { style: NameFormatStyle.lastCommaFirst }),
        prisonerName: formatName('John', '', 'Saunders'),
      })
    })
  })
})
