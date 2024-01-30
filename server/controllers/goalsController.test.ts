import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import WorkAndSkillsPageService from '../services/workAndSkillsPageService'
import GoalsController from './goalsController'

describe('Prisoner goals', () => {
  const offenderNo = 'A1143DZ'

  let req: any
  let res: any
  let controller: GoalsController

  beforeEach(() => {
    req = {
      middleware: {
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }
    controller = new GoalsController(new WorkAndSkillsPageService(null, null))
  })

  describe('displayGoals', () => {
    it('should render the page with the prisoners goals', async () => {
      // Given
      const getGoalsForPrisonerSpy = jest.spyOn<any, string>(controller['workAndSkillsPageService'], 'get')
      const expectedGoals = [
        {
          employmentGoals: [
            {
              key: {
                text: 'Example 1 for employment goal',
              },
              value: {
                text: '',
              },
            },
            {
              key: {
                text: 'Example 2 for employment goal',
              },
              value: {
                text: '',
              },
            },
            {
              key: {
                text: 'Example 3 for employment goal',
              },
              value: {
                text: '',
              },
            },
          ],
          personalGoals: [
            {
              key: {
                text: 'Example 1 for personal goal',
              },
              value: {
                text: '',
              },
            },
            {
              key: {
                text: 'Example 2 for personal goal',
              },
              value: {
                text: '',
              },
            },
            {
              key: {
                text: 'Example 3 for personal goal',
              },
              value: {
                text: '',
              },
            },
          ],
          longTermGoals: [
            {
              key: {
                text: 'Example 1 for long term goal',
              },
              value: {
                text: '',
              },
            },
            {
              key: {
                text: 'Example 2 for long term goal',
              },
              value: {
                text: '',
              },
            },
          ],
          shortTermGoals: [
            {
              key: {
                text: 'Example 1 for short term goal',
              },
              value: {
                text: '',
              },
            },
            {
              key: {
                text: 'Example 2 for short term goal',
              },
              value: {
                text: '',
              },
            },
          ],
        },
      ]

      const expectedView = {
        prisonerName: 'Michael Willis',
        prisonerNumber: 'A1143DZ',
        expectedGoals,
      }

      // When
      await controller.displayGoals(req, res)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/goals/goalsPage', expectedView)
      expect(controller.displayGoals).toHaveBeenCalled()
      expect(getGoalsForPrisonerSpy).toHaveBeenCalledWith(res.locals.clientToken, req.middleware.prisonerData)
    })
  })
})
