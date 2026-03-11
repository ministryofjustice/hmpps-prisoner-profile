import { NextFunction, Request, Response } from 'express'
import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonUserMock } from '../data/localMockData/user'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { AuditService, Page } from '../services/auditService'
import DuplicateProfilesController from './duplicateProfilesController'
import NotFoundError from '../utils/notFoundError'

jest.mock('../../logger')

let req: Request
let res: Response
let next: NextFunction
let controller: DuplicateProfilesController
let permissionsService: PermissionsService
let auditService: AuditService

const prisonerInContext = PrisonerMockDataA
const duplicateRecord1 = { ...PrisonerMockDataA, prisonerNumber: 'X1111XX', prisonId: 'OUT' }
const duplicateRecord2 = { ...PrisonerMockDataA, prisonerNumber: 'Y1111YY', prisonId: 'TRN' }

const mockPermissionsRecord1 = { permission1: true }
const mockPermissionsRecord2 = { permission2: true }

describe('DuplicateProfilesController', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    permissionsService = {
      getPrisonerPermissions: jest.fn().mockImplementation(({ prisoner }) => {
        if (prisoner.prisonerNumber === duplicateRecord1.prisonerNumber) return mockPermissionsRecord1
        if (prisoner.prisonerNumber === duplicateRecord2.prisonerNumber) return mockPermissionsRecord2
        return {}
      }),
    } as unknown as PermissionsService

    auditService = auditServiceMock()
    controller = new DuplicateProfilesController(permissionsService, auditService)

    req = {
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: prisonerInContext,
        inmateDetail: inmateDetailMock,
        duplicatePrisonerData: [duplicateRecord1, duplicateRecord2],
      },
      params: { prisonerNumber: prisonerInContext.prisonerNumber },
      id: 'test-correlation-id',
    } as unknown as Request

    res = {
      locals: {
        user: prisonUserMock,
        prisonerNumber: prisonerInContext.prisonerNumber,
        prisonerName: {
          firstLast: 'John Saunders',
          lastCommaFirst: 'Saunders, John',
          full: 'John Middle Names Saunders',
        },
        prisonId: prisonerInContext.prisonId,
        prisonerPermissions: {},
      },
      render: jest.fn(),
    } as unknown as Response

    next = jest.fn()
  })

  describe('getDuplicateProfiles', () => {
    it('should call next with NotFoundError when duplicatePrisonerData is undefined', async () => {
      req.middleware.duplicatePrisonerData = undefined

      await controller.getDuplicateProfiles(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
      expect(res.render).not.toHaveBeenCalled()
    })

    it('should call next with NotFoundError when duplicatePrisonerData is empty', async () => {
      req.middleware.duplicatePrisonerData = []

      await controller.getDuplicateProfiles(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
      expect(res.render).not.toHaveBeenCalled()
    })

    it('should render the page when duplicateRecordApiFailure is set to display the error message', async () => {
      res.locals.duplicateRecordApiFailure = true
      req.middleware.duplicatePrisonerData = []

      await controller.getDuplicateProfiles(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/duplicateProfiles', {
        pageTitle: 'Possible duplicate profiles for this person',
        miniBannerData: expect.any(Object),
        duplicateProfiles: [],
        prisonerPermissionsMap: {},
        backLinkUrl: `/prisoner/${PrisonerMockDataA.prisonerNumber}`,
        useCustomErrorBanner: true,
      })
    })

    it('should render the duplicateProfiles page with the correct data', async () => {
      await controller.getDuplicateProfiles(req, res, next)

      expect(permissionsService.getPrisonerPermissions).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisoner: duplicateRecord1,
        duplicateRecords: [prisonerInContext, duplicateRecord2],
        requestDependentOn: [],
      })

      expect(permissionsService.getPrisonerPermissions).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisoner: duplicateRecord2,
        duplicateRecords: [prisonerInContext, duplicateRecord1],
        requestDependentOn: [],
      })

      expect(res.render).toHaveBeenCalledWith('pages/duplicateProfiles', {
        pageTitle: 'Possible duplicate profiles for this person',
        miniBannerData: expect.any(Object),
        duplicateProfiles: [duplicateRecord1, duplicateRecord2],
        prisonerPermissionsMap: {
          [duplicateRecord1.prisonerNumber]: mockPermissionsRecord1,
          [duplicateRecord2.prisonerNumber]: mockPermissionsRecord2,
        },
        backLinkUrl: `/prisoner/${PrisonerMockDataA.prisonerNumber}`,
        useCustomErrorBanner: true,
      })
    })

    it('should send an audit page view event', async () => {
      await controller.getDuplicateProfiles(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: prisonerInContext.prisonerNumber,
        prisonId: prisonerInContext.prisonId,
        correlationId: 'test-correlation-id',
        page: Page.PossibleDuplicateProfiles,
      })
    })

    it('should not fail if audit service rejects', async () => {
      jest.mocked(auditService).sendPageView.mockRejectedValue(new Error('Audit failure'))

      await controller.getDuplicateProfiles(req, res, next)

      expect(res.render).toHaveBeenCalled()
    })
  })
})
