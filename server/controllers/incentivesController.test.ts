import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import IncentivesController from './incentivesController'
import IncentivesService from '../services/incentivesService'
import { incentiveDetailsDtoMock } from '../data/localMockData/incentiveReviewsMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'

describe('Incentives', () => {
  const prisonerNumber = 'G6123VU'

  let req: any
  let res: any
  let next: any
  let controller: IncentivesController

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
          userRoles: [Role.MaintainIEP],
          caseLoads: CaseLoadsDummyDataA,
          token: 'TOKEN',
        },
        clientToken: 'CLIENT_TOKEN',
      },
      render: jest.fn(),
      status: jest.fn(),
    }
    next = jest.fn()
    controller = new IncentivesController(new IncentivesService(null, null), auditServiceMock())
  })

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2024, 1, 1))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('displayIncentiveLevel', () => {
    it('should call the service and render the page', async () => {
      jest
        .spyOn<any, string>(controller['incentiveService'], 'getIncentiveReviewSummary')
        .mockResolvedValue(incentiveDetailsDtoMock)

      await controller.displayIncentiveLevel()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/incentives/incentiveLevelDetails', {
        pageTitle: 'Incentive details',
        prisonerName: 'John Saunders',
        breadcrumbPrisonerName: 'Saunders, John',
        prisonerNumber: 'G6123VU',
        canMaintainIEP: true,
        prisons: [AgenciesMock],
        levels: [
          {
            text: 'Standard',
            value: 'Standard',
          },
        ],
        formValues: {
          agencyId: undefined,
          fromDate: undefined,
          incentiveLevel: undefined,
          toDate: undefined,
        },
        currentIncentiveLevel: 'Standard',
        nextReviewDueBy: '1 January 2024',
        reviews: [
          [
            { text: '01/12/2023 - 10:35' },
            { text: 'Standard' },
            { text: 'A review took place' },
            { text: 'Moorland (HMP & YOI)' },
            { text: 'Not entered' },
          ],
        ],
        daysOverdue: 31,
        noReviewsMessage: 'There is no incentive level history for the selections you have made',
        recordIncentiveLevelLink: `/prisoner/${prisonerNumber}/incentive-level-details/change-incentive-level`,
        errors: [],
      })
    })
  })
})
