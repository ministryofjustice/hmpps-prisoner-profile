import { Request, Response } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import CareNeedsController from './careNeedsController'
import CareNeedsService from '../services/careNeedsService'
import { careNeedsMock, xrayBodyScansMock } from '../data/localMockData/careNeedsMock'

describe('Care needs controller', () => {
  const prisonerNumber = 'G6123VU'

  let req: Request
  let res: Response
  let controller: CareNeedsController

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
    } as unknown as Request
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
    } as unknown as Response
    controller = new CareNeedsController(new CareNeedsService(null), auditServiceMock())
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayPastCareNeeds', () => {
    it('should call the service and render the page', async () => {
      jest.spyOn(controller.careNeedsService, 'getCareNeedsAndAdjustments').mockResolvedValue(careNeedsMock)

      await controller.displayPastCareNeeds(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/careNeeds/pastCareNeeds', {
        pageTitle: 'Past care needs',
        careNeeds: [careNeedsMock[1]],
      })
    })
  })

  describe('displayXrayBodyScans', () => {
    it('should call the service and render the page', async () => {
      jest.spyOn(controller.careNeedsService, 'getXrayBodyScans').mockResolvedValue(xrayBodyScansMock)

      await controller.displayXrayBodyScans(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/xrayBodyScans', {
        pageTitle: 'X-ray body scans',
        bodyScans: xrayBodyScansMock,
      })
    })
  })
})
