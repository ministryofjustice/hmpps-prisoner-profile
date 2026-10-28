import type { Request, Response } from 'express'
import { XRayBodyScansPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import type PrisonService from './prisonService'
import type { PrisonUser } from '../interfaces/HmppsUser'
import mockPermissions from '../../tests/mocks/mockPermissions'
import { prisonServiceMock } from '../../tests/mocks/prisonServiceMock'
import { XRayBodyScansAvailability, XRayBodyScansAvailabilityService } from './xRayBodyScansAvailabilityService'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')

describe('X-ray body scans availability service', () => {
  let prisonService: jest.MockedObject<PrisonService>
  let availabilityService: XRayBodyScansAvailabilityService

  beforeEach(() => {
    prisonService = prisonServiceMock()
    availabilityService = new XRayBodyScansAvailabilityService(prisonService)
  })

  describe('x-ray body scan card on overview page', () => {
    it('should show if the service is available now', () => {
      expect(availabilityService.showOverviewCard(XRayBodyScansAvailability.AVAILABLE)).toBe(true)
    })

    it('should show if the service will be available soon', () => {
      expect(availabilityService.showOverviewCard(XRayBodyScansAvailability.AVAILABLE_SOON)).toBe(true)
    })

    it('should show if the service access is not authorised', () => {
      expect(availabilityService.showOverviewCard(XRayBodyScansAvailability.UNAUTHORISED)).toBe(true)
    })

    it('should not show if the service is unavailable', () => {
      expect(availabilityService.showOverviewCard(XRayBodyScansAvailability.UNAVAILABLE)).toBe(false)
    })
  })

  describe('availability check', () => {
    let req: Request
    let res: Response

    beforeEach(() => {
      req = { middleware: { clientToken: 'token3' } } as Request
      res = {
        locals: {
          feComponents: {
            header: 'DPS header',
            footer: 'DPS footer',
            cssIncludes: [],
            jsIncludes: [],
            sharedData: {
              caseLoads: [],
              activeCaseLoad: {},
              services: [], // active case load not enabled
              allocationJobResponsibilities: [],
              cspDirectives: {},
            },
          },
          prisonerPermissions: {}, // mocked
          user: { activeCaseLoadId: 'MDI' },
        },
      } as unknown as Response
    })

    it('should indicate that access to the service is unauthorised due to permissions if it will be available soon to the user’s active case load', async () => {
      mockPermissions({ [XRayBodyScansPermission.read_scans]: false })

      await expect(availabilityService.getAvailability(req, res)).resolves.toBe(XRayBodyScansAvailability.UNAUTHORISED)

      expect(prisonService.getCompletePrisonDetailsByPrisonId).toHaveBeenCalledWith('MDI', 'token3')
    })

    it('should indicate that the service will be available soon when the user’s active case load is not yet enabled', async () => {
      mockPermissions({ [XRayBodyScansPermission.read_scans]: true })

      await expect(availabilityService.getAvailability(req, res)).resolves.toBe(
        XRayBodyScansAvailability.AVAILABLE_SOON,
      )

      expect(prisonService.getCompletePrisonDetailsByPrisonId).toHaveBeenCalledWith('MDI', 'token3')
    })

    it.each([
      { scenario: 'women’s estate', activeCaseLoadId: 'BZI' },
      { scenario: 'youth custody service', activeCaseLoadId: 'FYI' },
    ])(
      'should indicate that the service is not available when the user’s active case load is part of the $scenario',
      async ({ activeCaseLoadId }) => {
        mockPermissions({ [XRayBodyScansPermission.read_scans]: true })
        ;(res.locals.user as PrisonUser).activeCaseLoadId = activeCaseLoadId

        await expect(availabilityService.getAvailability(req, res)).resolves.toBe(XRayBodyScansAvailability.UNAVAILABLE)

        expect(prisonService.getCompletePrisonDetailsByPrisonId).toHaveBeenCalledWith(activeCaseLoadId, 'token3')
      },
    )

    it('should indicate that access to the service is unauthorised due to permissions despite being available to the user’s active case load', async () => {
      mockPermissions({ [XRayBodyScansPermission.read_scans]: false })
      res.locals.feComponents.sharedData.services.push({
        id: 'x-ray-body-scans',
        heading: 'X-ray body scans',
        description: 'X-ray body scans API',
        href: 'http://localhost:3001/xRayBodyScansApi',
        navEnabled: false,
      })

      await expect(availabilityService.getAvailability(req, res)).resolves.toBe(XRayBodyScansAvailability.UNAUTHORISED)

      expect(prisonService.getCompletePrisonDetailsByPrisonId).not.toHaveBeenCalled()
    })

    it.each([
      { scenario: 'enabled in their active case load', activeCaseLoadId: 'MDI' },
      { scenario: 'enabled in their active case load even if it part of the women’s estate', activeCaseLoadId: 'NHI' },
      {
        scenario: 'enabled in their active case load even if it part of the youth custody service',
        activeCaseLoadId: 'WYI',
      },
    ])(
      'should indicate that the service is available to permitted users when $scenario',
      async ({ activeCaseLoadId }) => {
        mockPermissions({ [XRayBodyScansPermission.read_scans]: true })
        ;(res.locals.user as PrisonUser).activeCaseLoadId = activeCaseLoadId
        res.locals.feComponents.sharedData.services.push({
          id: 'x-ray-body-scans',
          heading: 'X-ray body scans',
          description: 'X-ray body scans API',
          href: 'http://localhost:3001/xRayBodyScansApi',
          navEnabled: false,
        })

        await expect(availabilityService.getAvailability(req, res)).resolves.toBe(XRayBodyScansAvailability.AVAILABLE)

        expect(prisonService.getCompletePrisonDetailsByPrisonId).not.toHaveBeenCalled()
      },
    )
  })
})
