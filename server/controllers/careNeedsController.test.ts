import type { Request, Response } from 'express'
import config from '../config'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { careNeedsMock } from '../data/localMockData/careNeedsMock'
import { pageResponse } from '../data/localMockData/pageResponse'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import type { XRayBodyScansApiClient } from '../data/interfaces/xRayBodyScansApi'
import { xRayBodyScansApiClientMock } from '../../tests/mocks/xRayBodyScansApiClientMock'
import { Role } from '../data/enums/role'
import CareNeedsController from './careNeedsController'
import CareNeedsService from '../services/careNeedsService'
import { mockLegacyScanResponse, mockScanResponse } from '../data/localMockData/xRayBodyScansMock'

describe('Care needs controller', () => {
  const prisonerNumber = 'G6123VU'

  let req: Request
  let res: Response
  // TODO: remove `resWithDpsDevRole` once XRBS no longer relies on DPS app dev
  let resWithDpsDevRole: Response

  let xRayBodyScansApiClient: jest.Mocked<XRayBodyScansApiClient>
  let controller: CareNeedsController

  let xRayBodyScansWasEnabled: boolean = false

  beforeEach(() => {
    xRayBodyScansWasEnabled = config.featureToggles.xRayBodyScansEnabled

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
      redirect: jest.fn(),
      render: jest.fn(),
      status: jest.fn(),
    } as unknown as Response
    resWithDpsDevRole = {
      ...res,
      locals: {
        ...res.locals,
        user: {
          ...res.locals.user,
          userRoles: [Role.PrisonUser, Role.DpsApplicationDeveloper],
        },
      },
    } as unknown as Response

    xRayBodyScansApiClient = xRayBodyScansApiClientMock()
    controller = new CareNeedsController(new CareNeedsService(null), () => xRayBodyScansApiClient, auditServiceMock())
  })

  afterEach(() => {
    config.featureToggles.xRayBodyScansEnabled = xRayBodyScansWasEnabled

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
    beforeEach(() => {
      res.locals.prisonNamesById = { BXI: 'Brixton (HMP)', MDI: 'Moorland (HMP & YOI)' }
    })

    it('should call the service and render the page', async () => {
      const pageOfScans = pageResponse([mockScanResponse(prisonerNumber), mockLegacyScanResponse(prisonerNumber)])
      xRayBodyScansApiClient.listScans.mockResolvedValueOnce(pageOfScans)

      await controller.displayXrayBodyScans(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/xrayBodyScans', {
        pageTitle: 'X-ray body scans',
        pageOfScans,
        showingDpsAndNomisScans: false,
      })
      expect(xRayBodyScansApiClient.listScans).toHaveBeenCalledWith(prisonerNumber, { size: 200 })
    })

    it('should render the page when the x-ray body scans service is enabled but user doesn’t have DPS app dev role', async () => {
      xRayBodyScansApiClient.listScans.mockResolvedValueOnce(pageResponse([]))

      await controller.displayXrayBodyScans(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/xrayBodyScans', {
        pageTitle: 'X-ray body scans',
        pageOfScans: expect.objectContaining({ content: [] }),
        showingDpsAndNomisScans: false,
      })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it('should show an error message if loading x-ray body scans failed', async () => {
      xRayBodyScansApiClient.listScans.mockRejectedValueOnce({ status: 500, message: 'Internal Server Error' })

      await controller.displayXrayBodyScans(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/xrayBodyScans', {
        pageTitle: 'X-ray body scans',
        pageOfScans: null,
        showingDpsAndNomisScans: false,
        error: true,
      })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it('should redirect to x-ray body scans service when enabled and user has DPS app dev role', async () => {
      config.featureToggles.xRayBodyScansEnabled = true

      await controller.displayXrayBodyScans(req, resWithDpsDevRole)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching('/prisoner/G6123VU/scan-overview$'))
      expect(xRayBodyScansApiClient.listScans).not.toHaveBeenCalled()
    })
  })
})
