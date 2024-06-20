import permissionsGuard from './permissionsGuard'
import { permissionsServiceMock } from '../../tests/mocks/permissionsServiceMock'
import PermissionsService from '../services/permissionsService'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonUserMock } from '../data/localMockData/user'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import NotFoundError from '../utils/notFoundError'

jest.mock('./middlewareHelpers', () => ({
  addMiddlewareError: jest.fn().mockImplementation((...args) => args),
}))

const next = jest.fn()

describe('permissionsGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return server error if no prisoner date found in middleware', async () => {
    const req: any = { middleware: {} }
    const res: any = {}
    const permissionService = permissionsServiceMock()

    await permissionsGuard(permissionService as PermissionsService, 'getOverviewPermissions')(req, res, next)

    expect(next).toHaveBeenCalledWith(new Error('No PrisonerData found in middleware'))
  })

  it('should call next if permissions service returns status of OK', async () => {
    const req: any = { middleware: { prisonerData: PrisonerMockDataA, clientToken: 'token' } }
    const res: any = { locals: { user: prisonUserMock } }

    const permissionService = permissionsServiceMock()
    permissionService.getOverviewPermissions = jest.fn().mockResolvedValue({ accessCode: HmppsStatusCode.OK })

    await permissionsGuard(permissionService as PermissionsService, 'getOverviewPermissions')(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it.each([
    [HmppsStatusCode.RESTRICTED_PATIENT, 'Prisoner is restricted patient'],
    [HmppsStatusCode.PRISONER_IS_RELEASED, 'Prisoner is inactive [MDI]'],
    [HmppsStatusCode.PRISONER_IS_RELEASED, 'Prisoner is inactive [MDI]'],
    [HmppsStatusCode.NOT_IN_CASELOAD, 'Prisoner not in case loads'],
  ])('For %s status code it should throw error with message %s', async (status: HmppsStatusCode, message: string) => {
    const req: any = { middleware: { prisonerData: PrisonerMockDataA, clientToken: 'token' } }
    const res: any = { locals: { user: prisonUserMock } }

    const permissionService = permissionsServiceMock()
    permissionService.getOverviewPermissions = jest.fn().mockResolvedValue({ accessCode: status })

    await permissionsGuard(permissionService as PermissionsService, 'getOverviewPermissions')(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith([req, next, new NotFoundError(message, status)])
  })
})
