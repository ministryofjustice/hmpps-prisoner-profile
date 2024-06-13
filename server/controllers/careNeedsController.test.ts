import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import CareNeedsController from './careNeedsController'
import CareNeedsService from '../services/careNeedsService'
import { careNeedsMock, xrayBodyScansMock } from '../data/localMockData/careNeedsMock'

describe('Care needs controller', () => {
  const prisonerNumber = 'G6123VU'

  let req: any
  let res: any
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
    controller = new CareNeedsController(new CareNeedsService(null), auditServiceMock())
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayPastCareNeeds', () => {
    it('should call the service and render the page', async () => {
      jest
        .spyOn<any, string>(controller['careNeedsService'], 'getCareNeedsAndAdjustments')
        .mockResolvedValue(careNeedsMock)

      await controller.displayPastCareNeeds(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/careNeeds/pastCareNeeds', {
        pageTitle: 'Past care needs',
        careNeeds: [careNeedsMock[1]],
        prisonerNumber,
        breadcrumbPrisonerName: formatName('John', '', 'Saunders', { style: NameFormatStyle.lastCommaFirst }),
        prisonerName: formatName('John', '', 'Saunders'),
      })
    })
  })

  describe('displayXrayBodyScans', () => {
    it('should call the service and render the page', async () => {
      jest.spyOn<any, string>(controller['careNeedsService'], 'getXrayBodyScans').mockResolvedValue(xrayBodyScansMock)

      await controller.displayXrayBodyScans(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/xrayBodyScans', {
        pageTitle: 'X-ray body scans',
        prisonerNumber,
        breadcrumbPrisonerName: formatName('John', '', 'Saunders', { style: NameFormatStyle.lastCommaFirst }),
        prisonerName: formatName('John', '', 'Saunders'),
        bodyScans: xrayBodyScansMock,
      })
    })
  })
})
